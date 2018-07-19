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
                        :layout  "bottomRight"
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
              :iconSize    #js [128 128]
              :iconAnchor  #js [64 64]
              :popupAnchor #js [64 64]}))


(def service-provider-icon
  (.icon js/L
         #js {:iconUrl     "images/serviceprovider.png"
              :iconSize    #js [128 128]
              :iconAnchor  #js [64 64]
              :popupAnchor #js [64 64]}))


(def iota-icon
  (.icon js/L
         #js {:iconUrl     "images/iota.png"
              :iconSize    #js [64 64]
              :iconAnchor  #js [32 32]
              :popupAnchor #js [32 32]}))


(defn map-view-did-mount []
  (let [mapbox (.setView (.map js/L "map") #js [53.418 5.776] 13)]
        iota-authorization-marker (.marker (.-Symbol js/L)
                                           #js {:rotate true :markerOptions #js {:icon iota-icon}})
    (set! js/foo mapbox)
    (doseq [prop #{"scrollWheelZoom" "doubleClickZoom" "keyboard"}]
      (.disable (object/get mapbox prop)))
    (.addTo (.tileLayer js/L
                        "https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
                        #js {:attribution "Map data &copy; [...]"
                             :id          "mapbox.streets"
                             :accessToken access-token})
            mapbox)
    #_(.addTo (.marker js/L #js [53.444177 5.635188] #js {:icon consumer-icon})
            mapbox)

    (.addTo (.marker js/L #js [53.448177 5.635188] #js {:icon smart-meter-icon})
            mapbox)

    (.addTo (.marker js/L #js [53.452177 5.659188] #js {:icon service-provider-icon})
            mapbox)

    ;; (let [marker (new (.-Marker js/mapboxgl) #js {:color "red" :label "pin-l-water"})]
    ;;   (-> marker
    ;;       (.setLngLat #js [5.635188 53.444177])
    ;;       (.setPopup
    ;;        (.setHTML (new (.-Popup js/mapboxgl) #js {:offset 25})
    ;;                  "<p>HOI</p>"))
    ;;       (.on "click" #(println "FOO"))
    ;;       (.addTo mapbox)))

    ;; (let [marker (new (.-Marker js/mapboxgl) [:div.car])]
    ;;   (.addTo (.on (.setLngLat marker #js [5.635188 53.449177])
    ;;                "click"
    ;;                #(.log js/console "hallo"))
    ;;           mapbox))
    ))

;; TODO add leaflet...
;; (let [marker (new (.-Marker js/mapboxgl) [:div.car])]
;;   (.addTo (.setLngLat marker #js [5.635188 53.499177]) js/foo))

(defn map-view []
  (r/create-class {:reagent-render      map-view-render
                   :component-did-mount map-view-did-mount}))


(defn main-panel []
  [map-view])
