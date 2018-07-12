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
  [:div#map {:style {:height "100vh"}}])


(defn map-view-did-mount []
  (set! (.-accessToken js/mapboxgl)
        "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmFpNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")
  (new (.-Map js/mapboxgl)
       #js {:container "map"
            :style     "mapbox://styles/mapbox/streets-v10"}))


(defn map-view []
  (r/create-class {:reagent-render      map-view-render
                   :component-did-mount map-view-did-mount}))


(defn main-panel []
  [map-view])
