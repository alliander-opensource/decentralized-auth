(ns decentralized-auth.core
  (:require [clojure.string :as string]
            [decentralized-auth.config :as config]
            [decentralized-auth.db]
            [decentralized-auth.events]
            [decentralized-auth.subs]
            [decentralized-auth.views :as views]
            [re-frame.core :as re-frame]
            [re-frisk.core :refer [enable-re-frisk!]]
            [reagent.core :as r]
            [taoensso.timbre :as log]))


(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (enable-re-frisk!)
    (println "dev mode")))


(defn mount-root []
  (re-frame/clear-subscription-cache!)
  (r/render [views/main-panel]
            (.getElementById js/document "app")))


(def noty-appender
  (fn [data]
    (let [{:keys [level output_]} data
          formatted-output-str    (-> (force output_)
                                      (string/split #"] -")
                                      second)]
      (views/notification level formatted-output-str))))


(log/merge-config!
 {:appenders
  {:noty
   {:enabled?   true
    :async?     false
    :min-level  nil
    :rate-limit [[1 250] [10 5000]]
    :output-fn  :inherit
    :fn         noty-appender}}})


(defn ^:export init []
  (dev-setup)
  (re-frame/dispatch-sync [:db/initialize-db])

  ;; Wait for IOTA MAM to be compiled...
  (js/setTimeout
   #(re-frame/dispatch [:iota/initialize])
   1000)

  (mount-root))
