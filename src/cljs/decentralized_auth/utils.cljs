(ns decentralized-auth.utils)


(defn json-encode [m]
  (.stringify js/JSON (clj->js m)))


(defn json-decode [msg]
  (try
    (js->clj (.parse js/JSON msg) :keywordize-keys true)
    (catch :default _
      msg)))
