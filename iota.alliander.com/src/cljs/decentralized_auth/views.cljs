(ns decentralized-auth.views
  (:require-macros [hiccups.core :as hiccups])
  (:require cljsjs.leaflet
            cljsjs.leaflet-polylinedecorator
            cljsjs.toastr
            [decentralized-auth.utils :refer [to-string debug-panel json-encode jsx->clj]]
            [goog.object :as object]
            [hiccups.runtime]
            [re-frame.core :refer [dispatch subscribe]]
            [reagent.core :as r]))


(defn notification
  "Displays the msg in a Toastr notification with type `:success`, `:info`,
  `:warning` or `:error`."
  [type msg]
  (set! (.-options js/toastr) #js {:timeOut 0 :extendedTimeOut 0})
  (case type
    :success
    (.success js/toastr msg)
    :info
    (.info js/toastr msg)
    :warning
    (.warning js/toastr msg)
    :error
    (.error js/toastr msg)
    #_default
    (.success js/toastr msg)))


(defn medium-icon [image-url & {:keys [popup-distance] :or {popup-distance 24}}]
  (.icon js/L
         #js {:iconUrl     image-url
              :iconSize    #js [48 48]
              :iconAnchor  #js [24 24]
              :popupAnchor #js [0 (- popup-distance)]}))


(defn small-icon [image-url]
  (.icon js/L
         #js {:iconUrl     image-url
              :iconSize    #js [24 24]
              :iconAnchor  #js [12 12]
              :popupAnchor #js [0 -12]}))


(def smart-meter-icon
  (medium-icon "images/smartmeter.png"))


(def revoked-icon
  (medium-icon "images/revoked.png"))


(def arrow-icon
  (small-icon "images/arrow.gif"))


(def service-provider-icon
  (medium-icon "images/serviceprovider.png" :popup-distance 6))


(def iota-icon
  (small-icon "images/iota.png"))


;; SOURCE: http://tobiasahlin.com/spinkit/ (MIT)
(defn spinner
  []
  [:div.sk-folding-cube
   [:div.sk-cube1.sk-cube]
   [:div.sk-cube2.sk-cube]
   [:div.sk-cube4.sk-cube]
   [:div.sk-cube3.sk-cube]])


(defn policy-row [{:keys [address
                          goal
                          mam-root
                          mam-side-key
                          iota-bundle-hash
                          iota-transaction-hash
                          pending?]
                   :as   policy}]

  (let [policy-published? (:iota-bundle-hash policy)
        revokable-policy? (and (not (:revoked? policy))
                               policy-published?)]
     (if pending?
       [:tr
        [:td "Policy: "]
        [:td [spinner]]
        [:td.small "(Performing Proof of Work to attach policy to the Tangle...)"]]
       [:tr
        [:td "Policy: "]
        [:td [:a.btn.btn-link
              {:href   (str "https://mam.tangle.army/fetch?address=" mam-root "&key=" mam-side-key)
               :class  (when-not mam-root "disabled")
               :target "_blank"}
              "MAM channel"]]
        [:td " | "]
        [:td [:a.btn.btn-link {:href   (str "https://thetangle.org/bundle/" iota-bundle-hash)
                               :class  (when-not iota-bundle-hash "disabled")
                               :target "_blank"}
              "Latest bundle"]]
        [:td " | "]
        [:td [:a.btn.btn-link {:href   (str "http://tangle.glumb.de/?hash=" iota-transaction-hash)
                               :class  (when-not iota-transaction-hash "disabled")
                               :target "_blank"}
              "Latest transaction in Tangle visualization"]]
        [:td (merge {:rowSpan 2} (when (or (not policy-published?)
                                           (:revoked? policy))
                                   {:style {:display "none"}})) " | "]
        [:td (merge {:rowSpan 2} (when (or (not policy-published?)
                                           (:revoked? policy))
                                   {:style {:display "none" }}))
         [:button.btn.btn-outline-primary
          {:on-click #(when revokable-policy?
                        (do (notification :success "Revoking policy by publishing to the Tangle")
                            (dispatch [:policy/revoke (:id policy)])))
           :class    (when-not revokable-policy? "disabled")}
          "Revoke"]]])))


(defn data-row [policy]
  [:tr
   [:td "Data: "]
   [:td.small {:colSpan 5}
    "Infeasible to attach high frequent P1-messages to mainnet with standard hardware."]])


(defn policy-list-item [policy]
  [:div.list-group-item {:class    (cond (and (:revoked? policy)
                                              (:active? policy))
                                         "list-group-item-warning"
                                         (:revoked? policy)
                                         "list-group-item-danger"
                                         (:active? policy)
                                         "list-group-item-primary")
                         :on-click #(dispatch [:policy/selected (:id policy)])}
   [:i (to-string policy)]
   [:br]
   [:table
    [:tbody
     [policy-row policy]
     [data-row policy]]]])


(defn policies-panel []
  (let [policies (subscribe [:map/policies])]
    [:div.container-fluid.leaflet-bottom.leaflet-left.leaflet-control-container
     [:div.list-group.leaflet-control
      [:p.list-group-item.active {:href "#"} "Policies and data"]
      (doall
       (for [policy @policies]
         ^{:key policy}
         [policy-list-item policy]))]]))


(defn add-tile-layer [mapbox access-token]
  (let [tile-layer (.tileLayer js/L
                               "https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
                               #js {:attribution (str
                                                  "Map data &copy; Mapbox | "
                                                  (hiccups/html
                                                   [:a {:href   "http://alliander.com"
                                                        :target "_blank"}
                                                    "Alliander"]))
                                    :id          "mapbox.run-bike-hike"
                                    :accessToken access-token})]
    (.addTo tile-layer mapbox)))


(defn configure [mapbox access-token]
  (doseq [prop #{"scrollWheelZoom" "doubleClickZoom" "keyboard"}]
    (.disable (object/get mapbox prop)))
  (add-tile-layer mapbox access-token))


(defn format-trytes
  "Shortens trytes and creates a link to IOTA Tangle Explorer."
  [trytes]
  (hiccups/html [:a {:href   (str "https://thetangle.org/address/" trytes)
                     :target "_blank"}
                 (subs trytes 0 15)]))


(defn add-policy-visualization [mapbox {{smart-meter-latlng :latlng
                                         meter-name         :meter-name
                                         meter-address      :address}    :smart-meter
                                        {service-provider-latlng  :latlng
                                         service-provider-address :address
                                         service-provider-name    :name} :service-provider
                                        :as                              policy}]
  (let [polyline                   (.polyline js/L
                                              #js [smart-meter-latlng service-provider-latlng]
                                              #js {:weight 2 :color "black" :opacity 0.4})
        smart-meter-marker         (.marker js/L smart-meter-latlng #js {:icon smart-meter-icon})
        smart-meter-popup          (hiccups/html
                                    [:table
                                     [:tr
                                      [:td "Meter name:"]
                                      [:td meter-name]]
                                     [:tr
                                      [:td "IOTA address:"]
                                      [:td (format-trytes meter-address)]]])
        service-provider-marker    (.marker js/L service-provider-latlng #js {:icon service-provider-icon})
        service-provider-popup     (hiccups/html
                                    [:table
                                     [:tr
                                      [:td "Service provider:"]
                                      [:td service-provider-name]]
                                     [:tr
                                      [:td "IOTA address:"]
                                      [:td (format-trytes service-provider-address)]]])
        iota-authorization-marker  (.marker (.-Symbol js/L)
                                            #js {:markerOptions #js {:icon iota-icon}})
        iota-authorization-pattern #js {:offset "50%"
                                        :repeat "100%"
                                        :symbol iota-authorization-marker}
        polyline-decorator         (.polylineDecorator js/L
                                                       polyline
                                                       #js {:patterns #js [iota-authorization-pattern]})]
    (.addTo smart-meter-marker mapbox)
    (.addTo service-provider-marker mapbox)
    (.addTo polyline mapbox)
    (.addTo polyline-decorator mapbox)
    (dispatch [:policy/create-and-add-mam-instance (:id policy)])

    ;; Little bit of a hassle to be able to add a new pattern on the existing one later...
    (dispatch [:policy/add-polyline (:id policy) polyline])
    (dispatch [:policy/add-iota-authorization-pattern (:id policy) iota-authorization-pattern])
    (dispatch [:policy/add-polyline-decorator (:id policy) polyline-decorator])

    (let [popup            (.bindPopup smart-meter-marker smart-meter-popup)
          select-policy-fn #(dispatch [:policy/selected (:id policy)])]
      (dispatch [:policy/add-popup (:id policy) popup])
      (dispatch [:policy/publish (:id policy)])
      (.on polyline-decorator "click" select-policy-fn)
      (.on polyline "click" select-policy-fn)
      (.on smart-meter-marker "click" select-policy-fn))
    (.bindPopup service-provider-marker service-provider-popup)))


(defn show-info-modal
  ([mapbox]
   (show-info-modal mapbox identity))
  ([mapbox callback]
   (let [content (hiccups/html [:a {:href "www.google.nl"} "Decentral IOTA MAM IOTA Policy Data"])]
     #_(.openModal mapbox #js {:content            content
                             :closeTitle         "Close"
                             :zIndex             10000
                             :onHide             (fn [e] (callback))
                             :transitionDuration 300}))))


(defn confirm-policies
  "Show dialog box for first policy and recur with rest of policies"
  [mapbox policies]
  (when (seq policies)
    (let [policy (first policies)]
      (.confirm js/bootbox
                #js {:message  (hiccups/html [:a {:href "www.google.nl"} "Policy 1"])
                     :buttons  #js {:confirm #js {:label     "Yes"
                                                  :className "btn-success"}
                                    :cancel  #js {:label     "No"
                                                  :className "btn-danger"}}
                     :callback #(do (if %
                                      (add-policy-visualization mapbox policy)
                                      (notification :error "Policy not accepted"))
                                    (confirm-policies mapbox (next policies)))}))))


(defn map-view-did-mount []
  (let [mapbox       (.setView (.map js/L "map") #js [53.405 5.739] 12)
        access-token (subscribe [:mapbox/access-token])
        policies     (subscribe [:map/policies])]
    (configure mapbox @access-token)
    (.addTo (.easyButton js/L "glyphicon-info-sign" #(show-info-modal mapbox)) mapbox)
    (dispatch [:map/add-mapbox mapbox])
    (confirm-policies mapbox @policies)))


(defn map-view-render []
  [:div#map])


(defn map-view []
  (r/create-class {:component-did-mount map-view-did-mount
                   :reagent-render      map-view-render}))


(defn main-panel []
  [:div
   [map-view]
   [policies-panel]])
