(ns decentralized-auth.policy
  (:require-macros [hiccups.core :as hiccups])
  (:require [hiccups.runtime]))


(defn to-string [{:keys [goal smart-meter service-provider] :as policy}]
  (str (:name service-provider)
       " can access "
       (:meter-name smart-meter)
       " with the goal of "
       goal))


(defn request-html [{{smart-meter-latlng :latlng
                      meter-name         :meter-name
                      meter-address      :address}    :smart-meter
                     {service-provider-latlng  :latlng
                      service-provider-address :address
                      service-provider-name    :name} :service-provider
                     goal                             :goal
                     :as                              policy}]
  (hiccups/html [:div
                 [:h1 (str "Allow " service-provider-name " to retrieve data of " meter-name "?")]
                 [:p "You are the owner of "
                  meter-name
                  " (as proven by "
                  [:a {:href "https://privacybydesign.foundation/irma-en/" :target "_blank"}
                   "IRMA"]
                  " or a "
                  [:a {:href   "https://github.com/Alliander/decentralized-auth/blob/master/docs/scenarios.md#pairing-with-a-device"
                       :target "_blank"}
                   "shared secret)"]
                  "."
                  [:br]
                  [:br]
                  (to-string policy)
                  [:br]
                  [:br]
                  [:strong "Do you accept this request?"]
                  [:br]
                  [:br]
                  [:i
                   "Accepting the request will lead to the publishing of a
                   policy on a "
                   [:a {:href   "https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e#7036"
                        :target "_blank"}
                    "restricted MAM channel"]
                   " (a message channel only readable by those who have the
                   address and the side key) on the "
                   [:a {:href "https://www.iota.org/" :target "_blank"}
                    "IOTA Tangle"]
                   ". Only you and the service provider will have the address
                   and side key. Because it is published on the IOTA Tangle this
                   policy is part of an immutable audit log. Only you and "
                   service-provider-name
                   " can decrypt this audit log to prove access to the P1 data was
                   authorized or not. For all others without the address and key
                   the data is gibberish."]]
                 [:p
                  [:i
                   "Once the policy is published the smart meter will know to
                   send the (encrypted) access key to its measurement data (also
                   published on the IOTA Tangle) to "
                   service-provider-name "."]]]))


(defn revoke-html [{{smart-meter-latlng :latlng
                     meter-name         :meter-name
                     meter-address      :address}    :smart-meter
                    {service-provider-latlng  :latlng
                     service-provider-address :address
                     service-provider-name    :name} :service-provider
                    goal                             :goal
                    :as                              policy}]
  (hiccups/html [:div
                 [:h1 (str "Revoke access of " service-provider-name " to retrieve data of " meter-name "?")]
                 [:p [:strong "Do you want to revoke the access?"]
                  [:br]
                  [:br]
                  [:i
                   "Revoking the authorization will lead to the publishing of a policy on a "
                   [:a {:href   "https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e#7036"
                        :target "_blank"}
                    "restricted MAM channel"]
                   " (a message channel only readable by those who have the
                   address and the side key) on the IOTA Tangle. Only you and
                   the service provider will have the address and side key.
                   Because it is published on the IOTA Tangle this policy is
                   part of an immutable audit log. Only you and "
                   service-provider-name
                   " can decrypt this audit log to prove access to the P1 data
                   was authorized or not. For all others without the address and
                   key the data is gibberish."]]
                 [:p [:div
                      "When the policy is revoked "
                      service-provider-name
                      " will no longer be able to fetch data."]]]))
