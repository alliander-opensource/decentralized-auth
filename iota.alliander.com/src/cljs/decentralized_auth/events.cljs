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
 (fn [{{:keys [iota/provider data-provider/default-side-key]
        :as   db}
       :db
       :as cofx} _]

   (log/infof "Initializing IOTA with provider %s..."
              provider)

   (let [iota-instance (iota/create-iota provider)
         seed          (gen-seed)]
     {:db (assoc db
                 :iota/iota-instance iota-instance)})))


(defn attach-to-tangle [payload address]
  (go (let [depth                6
            min-weight-magnitude 9
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


(reg-event-db
 :policy/selected
 (fn [{:keys [map/policies]
       :as   db}
      [_ policy]]
   (assoc db :map/policies
          (map #(assoc % :active? (= % policy))
               policies))))
