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

;; :bearing   64
;; :pitch     42

(defn map-view-render []
  [:div#map])


(defn map-view-did-mount []
  ;; (set! (.-accessToken js/mapboxgl)
  ;;       "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmFpNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")
  (let [mapbox (.setView (.map js/L "map") #js [53.38723233031408 5.788068297037057] 11)]
    ;; (.disable (.-scrollZoom mapbox))
    ;; (.disable (.-keyboard mapbox))
    ;; (.disable (.-doubleClickZoom mapbox))
    ;; (.addControl mapbox (new (.-NavigationControl js/mapboxgl)) "top-left")

    (.addTo (.tileLayer js/L "https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
                        (clj->js {:attribution "Map data &copy; [...]"
                                  :maxZoom     18
                                  :id          "mapbox.streets"
                                  :accessToken "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmFpNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg"}))
            mapbox

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
    )))

;; TODO add leaflet...
;; (let [marker (new (.-Marker js/mapboxgl) [:div.car])]
;;   (.addTo (.setLngLat marker #js [5.635188 53.499177]) js/foo))

(defn map-view []
  (r/create-class {:reagent-render      map-view-render
                   :component-did-mount map-view-did-mount}))


(defn main-panel []
  [map-view])
