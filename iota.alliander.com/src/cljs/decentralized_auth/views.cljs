(ns decentralized-auth.views
  (:require-macros [hiccups.core :as hiccups])
  (:require cljsjs.leaflet
            cljsjs.leaflet-polylinedecorator
            cljsjs.toastr
            [decentralized-auth.policy :as policy]
            [decentralized-auth.utils :refer [debug-panel json-encode jsx->clj]]
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
  (medium-icon "images/arrow.gif"))


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
              {:href   (str "https://mam.tangle.army/fetch?key=" mam-side-key "&address=" mam-root)
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
    "Infeasible to attach (non-batch) high frequent P1-messages to mainnet with
    standard hardware."]])


(defn policy-list-item [policy]
  [:div.list-group-item {:class    (cond (and (:revoked? policy)
                                              (:active? policy))
                                         "list-group-item-warning"
                                         (:revoked? policy)
                                         "list-group-item-danger"
                                         (:active? policy)
                                         "list-group-item-primary")
                         :on-click #(dispatch [:policy/selected (:id policy)])}
   [:i (policy/to-string policy)]
   [:br]
   [:table
    [:tbody
     [policy-row policy]
     [data-row policy]]]])


(defn policies-panel []
  (let [policies (subscribe [:map/policies])]
    (when (not (empty? (keep :accepted? @policies)))
      [:div.container-fluid.leaflet-bottom.leaflet-left.leaflet-control-container
       [:div.list-group.leaflet-control
        [:p.list-group-item.active {:href "#"} "Policies and data"]
        (doall
         (for [policy @policies
               :when  (:accepted? policy)]
           ^{:key policy}
           [policy-list-item policy]))]])))


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

        iota-authorization-marker  (.marker (.-Symbol js/L)
                                            #js {:markerOptions #js {:icon iota-icon}})
        iota-authorization-pattern #js {:offset "50%"
                                        :repeat "100%"
                                        :symbol iota-authorization-marker}
        polyline-decorator         (.polylineDecorator js/L
                                                       polyline
                                                       #js {:patterns #js [iota-authorization-pattern]})]
    (.addTo smart-meter-marker mapbox)
    (.addTo polyline mapbox)
    (.addTo polyline-decorator mapbox)
    (dispatch [:policy/create-and-add-mam-instance (:id policy)])
    (dispatch [:policy/accept (:id policy)])

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
      (.on smart-meter-marker "click" select-policy-fn))))


(defn show-info-modal []
  (let [content
        (hiccups/html
         [:div
          [:h1 "GDPR-compliant smart meter data on the IOTA Tangle"]
          [:p
           [:div
            "Sharing P1 usage data with service providers can help the energy transition. "
            "But the data is privacy-sensitive. "
            "When dealing with personal identifiable information (like the measurements of a smart meter) a service provider has to adhere to the "
            [:a {:href "https://ec.europa.eu/commission/priorities/justice-and-fundamental-rights/data-protection/2018-reform-eu-data-protection-rules_en"}

             "GDPR"]
            " and therefore: "]]
          [:p
           [:lu
            [:li "State the goal for data usage clearly (and only use the data for that goal)."]
            [:li "Have consent of the consumer to access the data."]
            [:li "Stop collecting data when consent is revoked."]]]
          [:p
           [:div
            "Storing policies or data in a central place can lead to "
            [:a {:href   "https://tweakers.net/nieuws/115665/energiedata-miljoenen-nederlanders-gestolen-door-energieleverancier.html"
                 :target "_blank"}
             "misuse"]
            ", "
            [:a {:href   "https://www.independent.ie/irish-news/news/exclusive-eirgrid-targeted-by-state-sponsored-hackers-leaving-networks-exposed-to-devious-attack-36003502.html"
                 :target "_blank"}
             "hacks"] " and a "
            [:a {:href   "https://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/"
                 :target "_blank"}
             "single point of failure"]
            ". Central storage can also lead to a vendor lock-in, where the owner
            of the smart meter data reader determines what service providers can
            use the data, instead of creating a level playing field where you
            can authorize anyone to access the data."]]
          [:p "Distributed ledger technology could address these issues."]
          [:p
           [:div "Distributed ledgers are capable of creating a single source of
           truth, without the need for a trusted third party. In the most famous
           example of a distributed ledger, "
            [:a {:href "https://bitcoin.org/bitcoin.pdf"} "Bitcoin"]
            ", money can be transferred without a bank. In the case of
           providing access to energy data, data can be transferred and policies
           stored without an Alliander cloud."]]
          [:p
           [:div
            "In this demo smart meters are shown (not actual ones) on Ameland.
            Holwerd P1 Data Graphing Service is an example service provider. The
            smart meter publishes its measurements on the IOTA Tangle, but this
            data can only be accessed when the access key is known."]]
          [:p
           [:div
            "Access to your smart meter data is requested by Holwerd P1 Data
            Graphing Service. Since you are the owner of the smart meter you can
            accept or decline this request. If the request is accepted a policy
            will be stored on the IOTA Tangle. And the service provider will
            receive the access key to the measurement data. The audit log is only
            decryptable by you and the service provider."]]
          [:p
           [:div
            "Note that the data flow and encrypted key exchange are not shown
            here. But they are available in the "
            [:a {:href "https://github.com/alliander/decentralized-auth"}
             "proof-of-concept application"]
            "."]]
          [:p
           [:div
            "We hope this will be a step towards a decentralized
            privacy-preserving infrastructure that opens smart meter data to the
            world." ]]
          [:p
           [:div
            [:h3 "Links"]
            [:ul
             [:li [:a {:href   "https://github.com/Alliander/decentralized-auth/tree/master/docs"
                       :target "_blank"}
                   "Documentation of open source project"]]
             [:li [:a {:href   "https://medium.com/@erwinrooijakkers/gdpr-compliant-smart-meter-data-on-the-iota-tangle-four-lessons-learned-while-putting-the-dea852a5b2aa"
                       :target "_blank"}
                   "Blog post GDPR-compliant smart meter data on the IOTA Tangle"]]]]]])]
    (.alert js/bootbox content)))


(defn confirm-policies
  "Show dialog box for first policy and recur with rest of policies"
  [mapbox policies]
  (when (seq policies)
    (let [policy (first policies)]
      (.confirm js/bootbox
                #js {:message  (policy/request-html policy)
                     :buttons  #js {:confirm #js {:label     "Yes"
                                                  :className "btn-lg btn-success"}
                                    :cancel  #js {:label     "No"
                                                  :className "btn-lg btn-danger"}}
                     :callback #(do (if %
                                      (add-policy-visualization mapbox policy)
                                      (notification :error
                                                    (str "Do not allow Holwerd P1 Data Graphing Service to access "
                                                         (-> policy :smart-meter :meter-name))))
                                    (confirm-policies mapbox (next policies)))}))))


(defn show-smart-meter [mapbox {:keys [latlng meter-name address] :as smart-meter}]
  (let [marker (.marker js/L latlng #js {:icon smart-meter-icon})
        popup  (hiccups/html
                [:table
                 [:tr
                  [:td "Meter name:"]
                  [:td meter-name]]
                 [:tr
                  [:td "IOTA address:"]
                  [:td (format-trytes address)]]])]
    (.addTo marker mapbox)
    (.bindPopup marker popup)))


(defn map-view-did-mount []
  (let [mapbox                   (.setView (.map js/L "map") #js [53.405 5.739] 12)
        access-token             (subscribe [:mapbox/access-token])
        policies                 (subscribe [:map/policies])
        {:keys [latlng
                name
                address]
         :as   service-provider} @(subscribe [:map/service-provider])
        smart-meters             @(subscribe [:map/smart-meters])
        service-provider-marker  (.marker js/L latlng #js {:icon service-provider-icon})
        service-provider-popup   (hiccups/html
                                  [:table
                                   [:tr
                                    [:td "Service provider:"]
                                    [:td name]]
                                   [:tr
                                    [:td "IOTA address:"]
                                    [:td (format-trytes address)]]])]
    (configure mapbox @access-token)
    (doseq [meter smart-meters]
      (show-smart-meter mapbox meter))
    (.addTo (.easyButton js/L "glyphicon-info-sign" #(show-info-modal)) mapbox)
    (.addTo service-provider-marker mapbox)
    (dispatch [:map/add-mapbox mapbox])
    (.openPopup (.bindPopup service-provider-marker service-provider-popup))

    ;; Show popup and then start confirming policies
    (js/setTimeout #(confirm-policies mapbox @policies) 3000)))


(defn map-view-render []
  [:div#map])


(defn map-view []
  (r/create-class {:component-did-mount map-view-did-mount
                   :reagent-render      map-view-render}))


(defn main-panel []
  [:div
   [map-view]
   [policies-panel]])
