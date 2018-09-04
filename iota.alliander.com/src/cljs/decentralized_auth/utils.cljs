(ns decentralized-auth.utils
  (:require [cljs.pprint :refer [pprint]]))


(defn json-encode [m]
  (.stringify js/JSON (clj->js m)))


(defn json-decode [msg]
  (try
    (js->clj (.parse js/JSON msg) :keywordize-keys true)
    (catch :default _
      msg)))


(defn debug-panel [d]
  [:pre (with-out-str (pprint d))])


(defn jsx->clj
  [x]
  (into {} (for [k (.keys js/Object x)] [k (aget x k)])))


;;;; Policy

(defn to-string [{:keys [goal smart-meter service-provider] :as policy}]
  (str (:name service-provider) " can access " (:meter-name smart-meter) " with the goal of " goal))
