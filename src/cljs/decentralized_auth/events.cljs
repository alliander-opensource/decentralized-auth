(ns decentralized-auth.events
  (:require-macros [cljs.core.async.macros :refer [go]]
                   [taoensso.timbre :as log])
  (:require [cljs-iota-mam.core :as iota-mam]
            [cljs-iota.core :as iota]
            [cljs.core.async :refer [<!]]
            [clojure.string :as string]
            [decentralized-auth.config :as config]
            [decentralized-auth.db :as db]
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
       :as      cofx} _]

   (log/infof "Initializing IOTA and IOTA MAM with provider %s..."
              provider)

   (let [iota-instance    (iota/create-iota provider)
         seed             (gen-seed)
         mam-state        (iota-mam/init iota-instance seed 2)
         mam-mode         :restricted]
     {:db       (assoc db
                       :iota/iota-instance iota-instance
                       :iota.mam/mam-state mam-state)
      :dispatch [:data-provider/change-mode mam-mode default-side-key]})))


(reg-event-db
 :data-provider/change-mode
 (fn [{:keys [iota.mam/mam-state] :as db} [_ mam-mode side-key]]

   (log/infof "Changing MAM mode to %s and side key to %s "
              (name mam-mode) side-key)

   (let [new-mam-state (cond-> mam-state
                         (not (string/blank? side-key))
                         (iota-mam/change-mode mam-mode side-key))]
     (assoc db
            :iota.mam/mam-state new-mam-state
            :data-provider/side-key side-key))))


(defn attach-to-tangle [payload address]
  (go (let [transactions (<! (iota-mam/attach payload address))]
        (log/infof "Transactions attached to tangle: %s"
                   transactions))))


(reg-event-db
 :data-provider/publish
 (fn [{:keys [iota.mam/mam-state] :as db} [_ message]]
   (let [{:keys [state payload root address]} (iota-mam/create mam-state message)]

     (log/infof "Attaching message %s at root %s with address %s"
                message root address)

     (attach-to-tangle payload address)
     (assoc db
            :data-provider/root root
            :iota.mam/mam-state state))))


(reg-fx
 :iota-mam-fx/fetch
 (fn [{:keys [root mode side-key on-success]}]
   (go (let [{:keys [next-root]}
             (<! (iota-mam/fetch root mode side-key
                                 #(dispatch (conj on-success %))))]
         (dispatch [:service-provider/change-root next-root])))))


(reg-event-fx
 :service-provider/fetch
 (fn [{{:keys [iota.mam/mam-state] :as db} :db :as cofx} [_ root side-key]]

   (log/infof "Fetching message from root %s using side key %s" root side-key)

   {:iota-mam-fx/fetch {:root       root
                        :mode       (-> mam-state :channel :mode)
                        :side-key   side-key
                        :on-success [:service-provider/add-message]}
    :db                db}))


(reg-event-db
 :prosumer/authorize
 (fn [{:keys [data-provider/side-key data-provider/root] :as db} [_ app-name]]
   (log/infof "Authorizing %s" app-name)
   (assoc db
          :service-provider/side-key side-key
          :service-provider/root root)))


(reg-event-db
 :prosumer/revoke
 (fn [{:keys [data-provider/side-key data-provider/root] :as db} [_ app-name]]
   (log/infof "Revoking access for %s" app-name)
   (assoc db
          :data-provider/side-key "NEW9SECRET9KEY")))


(reg-event-db
 :service-provider/add-message
 (fn [db [_ message]]
   (log/info "Adding message" message)
   (-> db
       (assoc :service-provider/latest-msg-timestamp (js/Date.))
       (update :service-provider/messages conj message))))


(reg-event-db
 :service-provider/change-root
 (fn [db [_ root]]
   (log/infof "Changing root to %s for service provider" root)
   (assoc db :service-provider/root root)))
