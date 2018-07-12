(ns decentralized-auth.views
  (:require cljsjs.noty
            [decentralized-auth.utils :refer [debug-panel json-encode]]
            [re-frame.core :refer [dispatch subscribe]]
            [reagent.core :as r]))


(defn notification
  "Displays the msg in a Noty notification with type `:info`, `:warning` or
  `:error`."
  [type msg]
  (.show (js/Noty. #js {:text    (str "<span>" msg "</span>")
                        :theme   "mint"
                        :type    (name type)
                        :layout  "bottomRight"
                        :timeout 10000})))


(defn map-view-render []
  [:div#map])


(defn map-view-did-mount []
  (set! (.-accessToken js/mapboxgl)
        "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmFpNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")
  (let [mapbox (new (.-Map js/mapboxgl)
                    #js {:container "map"
                         :center    #js [5.788068297037057 53.38723233031408]
                         :bearing   64
                         :pitch     42
                         :zoom      11
                         :style     "mapbox://styles/mapbox/satellite-streets-v10"})]
    (.disable (.-scrollZoom mapbox))
    (.disable (.-keyboard mapbox))
    (.disable (.-doubleClickZoom mapbox))
    (.addControl mapbox (new (.-NavigationControl js/mapboxgl) #js {:compass false}) "top-left")

    (let [marker (new (.-Marker js/mapboxgl) #js {:color "red" :label "pin-l-water"})]
      (-> marker
          (.setLngLat #js [5.635188 53.444177])
          (.setPopup
           (.setHTML (new (.-Popup js/mapboxgl) #js {:offset 25})
                     "<p>HOI</p>"))
          (.on "click" #(println "FOO"))
          (.addTo mapbox)))

    (let [marker (new (.-Marker js/mapboxgl) [:div.car])]
      (.addTo (.on (.setLngLat marker #js [5.635188 53.449177])
                   "click"
                   #(.log js/console "hallo"))
              mapbox))
    (set! js/foo mapbox)))

;; TODO add leaflet...
(let [marker (new (.-Marker js/mapboxgl) [:div.car])]
  (.addTo (.setLngLat marker #js [5.635188 53.499177]) js/foo))

(defn map-view []
  (r/create-class {:reagent-render      map-view-render
                   :component-did-mount map-view-did-mount}))


(defn main-panel []
  [map-view])
