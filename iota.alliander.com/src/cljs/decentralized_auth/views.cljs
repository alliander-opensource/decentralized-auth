(ns decentralized-auth.views
  (:require-macros [hiccups.core :as hiccups])
  (:require cljsjs.leaflet
            cljsjs.leaflet-polylinedecorator
            cljsjs.toastr
            [decentralized-auth.utils :refer [debug-panel json-encode]]
            [goog.object :as object]
            [hiccups.runtime]
            [re-frame.core :refer [dispatch subscribe]]
            [reagent.core :as r]))


(defn notification
  "Displays the msg in a Toastr notification with type `:success`, `:info`,
  `:warning` or `:error`."
  [type msg]
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


(def service-provider-icon
  (medium-icon "images/serviceprovider.png" :popup-distance 6))


(def iota-icon
  (small-icon "images/iota.png"))


(defn policy-item [{{:keys [meter-name]} :smart-meter
                    address              :address
                    side-key             :side-key
                    :as                  policy}]
  [:p.list-group-item {:class (when (:active? policy) "list-group-item-primary")}
   (str meter-name " can access service provider 1 with the goal of graphing energy data")
   [:br]
   [:a {:href (str "https://mam.tangle.army/fetch?address=" address "&key=" side-key) :target "_blank"}
    "View MAM channel"]
   " | "
   [:a {:href (str "https://thetangle.org/address/" address) :target "_blank"}
    "View IOTA transactions"]])


(defn info-panel []
  (let [policies (subscribe [:map/policies])]
    [:div.container-fluid.leaflet-bottom.leaflet-left.leaflet-control-container
     [:div.list-group.leaflet-control
      [:p.list-group-item.active {:href "#"} "Policies"]
      (doall
       (for [policy @policies]
         ^{:key policy}
         [policy-item policy]))]]))


(defn add-tile-layer [mapbox access-token]
  (let [tile-layer (.tileLayer js/L
                               "https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
                               #js {:attribution (str
                                                  "Map data &copy; Mapbox | "
                                                  "<a href=\"http://alliander.com\" "
                                                  "target=\"_blank\">Alliander</a>")
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
                                         meter-address      :address}       :smart-meter
                                        {service-provider-latlng  :latlng
                                         service-provider-address :address} :service-provider
                                        :as                                 policy}]
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
                                      [:td "Holwert P1 Data Graphing Service"]]
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
    (.bindPopup smart-meter-marker smart-meter-popup)
    (.bindPopup service-provider-marker service-provider-popup)
    (.bindPopup polyline-decorator "foo")
    (.on polyline-decorator "click" #(dispatch [:policy/selected policy]))))


(defn map-view-did-mount []
  (let [mapbox       (.setView (.map js/L "map") #js [53.405 5.739] 12)
        access-token (subscribe [:mapbox/access-token])
        policies     (subscribe [:map/policies])]
    (set! js/foo mapbox)
    (configure mapbox @access-token)
    (doseq [policy @policies]
      (add-policy-visualization mapbox policy))))


(defn map-view-render []
  [:div#map])


(defn map-view []
  (r/create-class {:component-did-mount map-view-did-mount
                   :reagent-render      map-view-render}))


(defn main-panel []
  [:div
   [map-view]
   [info-panel]])
