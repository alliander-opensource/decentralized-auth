(ns decentralized-auth.views
  (:require cljsjs.noty
            [decentralized-auth.utils :refer [debug-panel json-encode]]
            [goog.object :as object]
            [goog.string :as string]
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


(defn map-view-render []
  [:div#map])


(def access-token
  (string/buildString
   "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmF"
   "pNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg"))


(def smart-meter-icon
  (.icon js/L
         #js {:iconUrl     "images/smartmeter.png"
              :iconSize    #js [64 64]
              :iconAnchor  #js [32 32]
              :popupAnchor #js [32 32]}))


(def service-provider-icon
  (.icon js/L
         #js {:iconUrl     "images/serviceprovider.png"
              :iconSize    #js [64 64]
              :iconAnchor  #js [32 32]
              :popupAnchor #js [32 32]}))


(def iota-icon
  (.icon js/L
         #js {:iconUrl     "images/iota.png"
              :iconSize    #js [32 32]
              :iconAnchor  #js [16 16]
              :popupAnchor #js [16 16]}))


(defn info-panel []
  [:div.container-fluid.leaflet-bottom
   [:div.list-group
    [:a.list-group-item.active {:href "#"} "EWGHWIUEGHWEIUGHWEIUGHWEUIGHW"]
    [:h4.list-group-item-heading {:style {:background-color "white"}} "hallo"]
    [:p.list-group-item-text {:style {:background-color "white"}} "..."]]])


(defn map-view-did-mount []
  (let [mapbox                     (.setView (.map js/L "map") #js [53.418 5.776] 12)
        smart-meter-latlng         #js [53.458177 5.655188]
        service-provider-latlng    #js [53.452177 5.699188]
        polyline                   (.polyline js/L
                                              #js [smart-meter-latlng service-provider-latlng]
                                              #js {:weight 10 :color "black" :opacity 0.0})
        smart-meter-marker         (.marker js/L smart-meter-latlng #js {:icon smart-meter-icon})
        service-provider-marker    (.marker js/L service-provider-latlng #js {:icon service-provider-icon})
        iota-authorization-marker  (.marker (.-Symbol js/L)
                                            #js {:rotate true :markerOptions #js {:icon iota-icon}})
        arrow-head-pattern         #js {:offset "10%"
                                        :repeat "10%"
                                        :symbol (.arrowHead (.-Symbol js/L) #js {:pixelSize 12})}
        iota-authorization-pattern #js {:offset "50%"
                                        :repeat "100%"
                                        :symbol iota-authorization-marker}
        polyline-decorator         (.polylineDecorator js/L
                                                       polyline
                                                       #js {:patterns #js [arrow-head-pattern
                                                                           iota-authorization-pattern]})]
    (set! js/foo mapbox)
    (doseq [prop #{"scrollWheelZoom" "doubleClickZoom" "keyboard"}]
      (.disable (object/get mapbox prop)))
    (.addTo (.tileLayer js/L
                        "https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
                        #js {:attribution "Map data &copy; Mapbox | <a href=\"http://alliander.com\" rel=\"external nofollow\">Alliander</a>"
                             :id          "mapbox.run-bike-hike"
                             :accessToken access-token})
            mapbox)

    (.addTo smart-meter-marker mapbox)

    (.addTo service-provider-marker mapbox)
    (.addTo polyline mapbox)

    (.on polyline-decorator "click" #(js/alert "haaaaaallo"))

    (.addTo polyline-decorator mapbox)))


(defn map-view []
  (r/create-class {:reagent-render      map-view-render
                   :component-did-mount map-view-did-mount}))


(defn main-panel []
  [:div
   [map-view]
   [info-panel]])
