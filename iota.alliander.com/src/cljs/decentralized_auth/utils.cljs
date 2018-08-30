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

(defn to-string [{:keys [goal smart-meter] :as policy}]
  (str (:meter-name smart-meter) " can access service provider 1 with the goal of " goal))
