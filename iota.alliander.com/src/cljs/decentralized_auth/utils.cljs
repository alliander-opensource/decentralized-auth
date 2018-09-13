(ns decentralized-auth.utils
  (:require-macros [hiccups.core :as hiccups])
  (:require [cljs.pprint :refer [pprint]]
            [hiccups.runtime]))


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


(defn to-html [{{smart-meter-latlng :latlng
                 meter-name         :meter-name
                 meter-address      :address}    :smart-meter
                {service-provider-latlng  :latlng
                 service-provider-address :address
                 service-provider-name    :name} :service-provider
                goal :goal
                :as                              policy}]
  (hiccups/html [:div
                 [:h1 (str "Allow " service-provider-name " to retrieve data of " meter-name "?")]
                 [:p (str "You are the owner of "
                          meter-name
                          " (as proven by "
                          (hiccups/html
                           [:a {:href "https://privacybydesign.foundation/irma-en/"}
                            "IRMA"])
                          " or a "
                          (hiccups/html
                           [:a {:href "https://github.com/Alliander/decentralized-auth/blob/master/docs/scenarios.md#pairing-with-a-device"}
                            "shared secret)"])
                          "."
                          (hiccups/html [:br])
                          (hiccups/html [:br])
                          (hiccups/html [:strong "Do you accept this access request?"])
                          (hiccups/html [:br])
                          (hiccups/html [:br])
                          (hiccups/html
                           [:i
                            "Accepting the request will lead to the publishing of a policy on a "
                            (hiccups/html [:a {:href "https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e#7036"} "restricted MAM channel"])
                            " (a message channel only readable by those who have the address and the side key) "
                            "on the IOTA Tangle. Only you and the service provider will have the address and side key. "
                            "Because it is published on the IOTA Tangle this message is part of an immutable audit log both you and "
                            service-provider-name
                            " can point to this policy to prove access to the P1 data was allowed or not."]))]
                 [:p [:i (str service-provider-name " wants to use its data for " goal".")]]]))


;; :id 0, :smart-meter {:latlng #js [53.458177 5.655188], :meter-name "Smart meter 1", :address "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNAWIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP"}, :service-provider {:latlng #js [53.368346 5.926277], :address "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNAWIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP", :name "Holwerd P1 Data Graphing Service"}, :goal "graphing energy data", :address "VSSQCMYLXOGATMLAEH9FRVUZTWQBJQQOYDRNUDLBAWHWKUYQQFHBCQTGVUYLOWIEVWNGJFMYLJUMOCUVZ", :active? false}
