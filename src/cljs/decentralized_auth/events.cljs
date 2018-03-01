(ns decentralized-auth.events
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [taoensso.timbre :as log])
  (:require [cljs-iota-mam.core :as iota-mam]
            [cljs-iota.core :as iota]
            [cljs.core.async :as async :refer [<!]]
            [clojure.string :as string]
            [decentralized-auth.config :as config]
            [decentralized-auth.db :as db]
            [re-frame.core :as re-frame]
            [taoensso.timbre :as log]))


;;;; Initialize database event handlers

(re-frame/reg-event-db
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


(re-frame/reg-event-db
  :db/initialize-iota
  (fn [db [_ iota-provider]]
    (let [iota-instance (iota/create-iota iota-provider)]
      (assoc db :iota/iota-instance iota-instance))))


;; TODO: reg-fx for init and change-mode

(re-frame/reg-event-db
 :db/initialize-iota-mam
 (fn [{:keys [iota/iota-instance] :as db} _]
   (let [side-key  "SECRET"
         seed      (gen-seed)
         mam-state (-> (iota-mam/init iota-instance seed 2)
                       (iota-mam/change-mode :restricted side-key))]
     (assoc db :iota.mam/mam-state mam-state))))


(re-frame/reg-event-db
 :data-provider/side-key-changed
 (fn [{:keys [iota.mam/mam-state] :as db} [_ side-key]]
   (let [new-mam-state (cond-> mam-state
                         (not (string/blank? side-key))
                         (iota-mam/change-mode :restricted side-key))]
     (assoc db
            :iota.mam/mam-state new-mam-state
            :data-provider/side-key side-key))))


;; TODO: reg-fx for create

(re-frame/reg-event-db
 :data-provider/publish
 (fn [{:keys [iota.mam/mam-state] :as db} [_ message]]
   (let [{:keys [payload root address]} (iota-mam/create mam-state message)]
     (log/infof "Attaching message %s at root %s" message root)
     (iota-mam/attach payload address)
     (assoc db :data-provider/root root))))


(re-frame/reg-fx
 :iota-mam-fx/fetch
 (fn [{:keys [root mode side-key on-success]}]
   (iota-mam/fetch root mode side-key #(re-frame/dispatch (conj on-success %)))))


(re-frame/reg-event-fx
 :service-provider/fetch
 (fn [{{:keys [iota.mam/mam-state] :as db} :db :as cofx} [_ root]]
   (let [{:keys [mode side-key]} (:channel mam-state)]
     (log/info "Fetching message from root" root "using side key" side-key)
     {:iota-mam-fx/fetch {:root       root
                          :mode       mode
                          :side-key   side-key
                          :on-success [:service-provider/add-message]}
      :db                db})))


(re-frame/reg-event-db
 :service-provider/add-message
 (fn [db [_ message]]
   (log/info "Adding message" message)
   (assoc db :service-provider/message message)))
