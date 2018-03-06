(ns decentralized-auth.core
  (:require [decentralized-auth.config :as config]
            [decentralized-auth.events]
            [decentralized-auth.subs]
            [decentralized-auth.views :as views]
            [re-frame.core :as re-frame]
            [re-frisk.core :refer [enable-re-frisk!]]
            [reagent.core :as reagent]))


(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (enable-re-frisk!)
    (println "dev mode")))


(defn mount-root []
  (re-frame/clear-subscription-cache!)
  (reagent/render [views/main-panel]
                  (.getElementById js/document "app")))


(defn ^:export init []
  (dev-setup)
  (re-frame/dispatch-sync [:db/initialize-db])

  ;; Wait for IOTA MAM to be compiled...
  (js/setTimeout
   #(re-frame/dispatch [:iota/initialize "https://testnet140.tangle.works"])
   1000)

  (mount-root))
