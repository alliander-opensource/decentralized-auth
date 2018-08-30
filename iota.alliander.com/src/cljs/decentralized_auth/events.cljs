(ns decentralized-auth.events
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [taoensso.timbre :as log])
  (:require [cljs-iota-mam.core :as iota-mam]
            [cljs-iota.core :as iota]
            [cljs-iota.utils :as iota-utils]
            [cljs.core.async :refer [<!]]
            [clojure.string :as string]
            [decentralized-auth.config :as config]
            [decentralized-auth.db :as db]
            [decentralized-auth.utils :refer [json-encode json-decode]]
            [re-frame.core :refer [reg-event-db reg-event-fx reg-fx dispatch]]))


;;;; Initialize database event handlers

(reg-event-db
 :db/initialize-db
 (fn [_ _]
   db/default-db))


(defn gen-seed
  "Insecure way to generate a seed.

  Insecure because fewer characters (no 9) and it uses JavaScript's `random()`."
  []
  (let [seed-length     81
        random-A-till-Z #(char (+ (rand-int 26) 65))]
    (->> (repeatedly random-A-till-Z)
         (take seed-length)
         (apply str))))


(reg-event-fx
 :iota/initialize
 (fn [{{:keys [iota/provider] :as db} :db :as cofx} _]

   (log/infof "Initializing IOTA with provider %s..." provider)

   (let [iota-instance (iota/create-iota provider)]
     {:db (assoc db :iota/iota-instance iota-instance)})))


;; seed              (gen-seed)
;; security-level    2
;; iota-mam-instance (iota-mam/init iota-instance seed security-level)

(defn attach-to-tangle [payload address]
  (go (let [depth                5
            min-weight-magnitude 15
            transactions         (<! (iota-mam/attach payload
                                                      address
                                                      depth
                                                      min-weight-magnitude))]
        (log/infof "Transactions attached to tangle: %s" transactions))))


(reg-fx
 :iota-mam-fx/fetch
 (fn [{:keys [iota-instance root mode side-key on-success on-next-root]}]
   (go (let [callback            #(let [msg (iota-utils/from-trytes iota-instance %)]
                                    (dispatch (conj on-success msg)))
             {:keys [next-root]} (<! (iota-mam/fetch root mode side-key callback))]
         (dispatch (conj on-next-root next-root))))))


(defn gen-key []
  (->> (random-uuid) str (take 8) (apply str) string/upper-case))


(reg-fx
 :policy/open-popup
 (fn [{:keys [popup] :as policy}]
   (.openPopup popup)))


(reg-event-fx
 :policy/selected
 (fn [{{:keys [map/policies] :as db} :db}
      [_ policy-id]]
   {:db                (assoc db :map/policies
                              (map #(assoc % :active? (= (:id %) policy-id))
                                   policies))
    :policy/open-popup (first (filter #(= (:id %) policy-id) policies))}))


(reg-event-db
 :policy/add-popup
 (fn [{:keys [map/policies] :as db} [_ policy-id popup]]
   (update db :map/policies
           (fn [policies]
             (map #(if (= (:id %) policy-id)
                      (assoc % :popup popup)
                      %)
                  policies)))))
