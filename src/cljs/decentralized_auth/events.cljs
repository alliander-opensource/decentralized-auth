(ns decentralized-auth.events
  (:require-macros [taoensso.timbre :as log])
  (:require [cljs-iota-mam.core :as iota-mam]
            [cljs-iota.core :as iota]
            [cljs.spec.alpha]
            [decentralized-auth.db :as db]
            [re-frame.core :as re-frame]
            [taoensso.timbre :as log]))


;;;; Initialize database event handlers

(re-frame/reg-event-db
 :db/initialize-db
 (fn [_ _]
   db/default-db))


(re-frame/reg-event-db
  :db/initialize-iota
  (fn [db [_ iota-provider]]
    (let [iota-instance (iota/create-iota iota-provider)
          seed          (apply str (repeat 81 "A"))
          mam           (iota-mam/init iota-instance seed 2)]
      {:db (assoc db :db/iota-instance iota-instance :db/iota-mam mam)})))
