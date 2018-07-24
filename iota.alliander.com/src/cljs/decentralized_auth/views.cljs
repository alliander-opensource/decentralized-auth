(ns decentralized-auth.views
  (:require cljsjs.noty
            [decentralized-auth.utils :refer [debug-panel json-encode]]
            [goog.object :as object]
            [re-frame.core :refer [dispatch subscribe]]
            [reagent.core :as r]))


(defn notification
  "Displays the msg in a Noty notification with type `:info`, `:warning` or
  `:error`."
  [type msg]
  (.show (js/Noty. #js {:text    (str "<span>" msg "</span>")
                        :theme   "mint"
                        :type    (name type)
                        :layout  "topRight"
                        :timeout 10000})))


(defn medium-icon [image-url]
  (.icon js/L
         #js {:iconUrl     image-url
              :iconSize    #js [48 48]
              :iconAnchor  #js [24 24]
              :popupAnchor #js [24 24]}))


(defn small-icon [image-url]
  (.icon js/L
         #js {:iconUrl     image-url
              :iconSize    #js [24 24]
              :iconAnchor  #js [12 12]
              :popupAnchor #js [0 -12]}))


(def smart-meter-icon
  (medium-icon "images/smartmeter.png"))


(def service-provider-icon
  (medium-icon "images/serviceprovider.png"))


(def iota-icon
  (small-icon "images/iota.png"))


(defn policy-item [iota-address {:keys [smart-meter-name active?] :as options}]
  [:p.list-group-item {:class (when active? "list-group-item-primary")}
   (str smart-meter-name " can access service provider 1 with the goal of graphing energy data")
   [:br]
   [:a {:href (str "https://mam.tangle.army/fetch?address=" iota-address) :target "_blank"}
    "View MAM channel"]
   " | "
   [:a {:href (str "https://thetangle.org/address/" iota-address) :target "_blank"}
    "View IOTA transactions"]])


(defn info-panel []
  (let [policies (subscribe [:map/policies])]
    [:div.container-fluid.leaflet-bottom.leaflet-left.leaflet-control-container
     [:div.list-group.leaflet-control
      [:p.list-group-item.active {:href "#"} "Policies"]
      (doall
       (for [[_ _ options] @policies]
         ^{:key options}
         [policy-item "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNAWIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP" options]))]]))


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


(defn add-policy-visualization [mapbox [smart-meter-latlng service-provider-latlng]]
  (let [polyline                   (.polyline js/L
                                              #js [smart-meter-latlng service-provider-latlng]
                                              #js {:weight 2 :color "black" :opacity 0.4})
        smart-meter-marker         (.marker js/L smart-meter-latlng #js {:icon smart-meter-icon})
        service-provider-marker    (.marker js/L service-provider-latlng #js {:icon service-provider-icon})
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
    (.on polyline-decorator "click" #(js/alert "haaaaaallo"))
    (.bindPopup polyline-decorator "foo")
    (.addTo polyline-decorator mapbox)))


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
