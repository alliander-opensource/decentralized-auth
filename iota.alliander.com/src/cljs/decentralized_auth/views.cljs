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


(defn info-panel []
  [:div.container-fluid.leaflet-bottom.leaflet-right.leaflet-control-container
   [:div.list-group.leaflet-control
    [:p.list-group-item.active {:href "#"} "Policies"]
    [:p.list-group-item.list-group-item-primary
     "Smart meter 1 can access service provider 1 with the goal of graphing energy data"
     [:br]
     [:a {:href "https://mam.tangle.army/fetch?address=[YOUR-ROOT-ADDRESS]" :rel "external"}
      "View MAM channel"]]
    [:p.list-group-item
     "Smart meter 2 can access service provider 2 with the goal of graphing energy data"
     [:br]
     [:a {:href "https://mam.tangle.army/fetch?address=[YOUR-ROOT-ADDRESS]" :rel "external"}
      "View MAM channel"]]]])


(defn configure [mapbox access-token]
  (doseq [prop #{"scrollWheelZoom" "doubleClickZoom" "keyboard"}]
    (.disable (object/get mapbox prop)))
  (.addTo (.tileLayer js/L
                      "https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
                      #js {:attribution (str
                                         "Map data &copy; Mapbox | "
                                         "<a href=\"http://alliander.com\" "
                                         "target=\"_blank\">Alliander</a>")
                           :id          "mapbox.run-bike-hike"
                           :accessToken access-token})
          mapbox))


(defn map-view-did-mount []
  (let [mapbox                     (.setView (.map js/L "map") #js [53.418 5.776] 12)
        access-token               (subscribe [:mapbox/access-token])
        smart-meter-latlngs        (subscribe [:map/smart-meter-latlngs])
        service-provider-latlngs   (subscribe [:map/service-provider-latlngs])
        polyline                   (.polyline js/L
                                              #js [(first @smart-meter-latlngs) (first @service-provider-latlngs)]
                                              #js {:weight 2 :color "black" :opacity 0.4})
        smart-meter-marker         (.marker js/L (first @smart-meter-latlngs) #js {:icon smart-meter-icon})
        service-provider-marker    (.marker js/L (first @service-provider-latlngs) #js {:icon service-provider-icon})
        iota-authorization-marker  (.marker (.-Symbol js/L)
                                            #js {:markerOptions #js {:icon iota-icon}})
        iota-authorization-pattern #js {:offset "50%"
                                        :repeat "100%"
                                        :symbol iota-authorization-marker}
        polyline-decorator         (.polylineDecorator js/L
                                                       polyline
                                                       #js {:patterns #js [iota-authorization-pattern]})]
    (set! js/foo mapbox)
    (configure mapbox @access-token)

    (.addTo smart-meter-marker mapbox)

    (.addTo service-provider-marker mapbox)
    (.addTo polyline mapbox)

    (.on polyline-decorator "click" #(js/alert "haaaaaallo"))
    (.bindPopup polyline-decorator "foo")

    (.addTo polyline-decorator mapbox)))


(defn map-view-render []
  [:div#map])


(defn map-view []
  (r/create-class {:component-did-mount map-view-did-mount
                   :reagent-render      map-view-render}))


(defn main-panel []
  [:div
   [map-view]
   [info-panel]])
