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


(reg-event-db
 :data-provider/notify-new-side-key
 (fn [{:keys [data-provider/authorized-service-providers] :as db} [_ side-key]]
   (log/infof "Informing service providers %s about new side key"
              authorized-service-providers)
   (let [db-authorization-keys
         (map (fn [asp]
                (keyword (str "service-provider." asp "/side-key")))
              authorized-service-providers)]
     (apply assoc (cons db (interleave db-authorization-keys (repeat side-key)))))))


(reg-fx
 :iota-mam-fx/fetch
 (fn [{:keys [iota-instance root mode side-key on-success on-next-root]}]
   (go (let [{:keys [next-root]}
             (<! (iota-mam/fetch root mode side-key
                                 #(let [msg (iota-utils/from-trytes iota-instance %)]
                                    (dispatch (conj on-success msg)))))]
         (dispatch (conj on-next-root next-root))))))


(reg-event-fx
 :service-provider.wattapp/fetch
 (fn [{{:keys [iota.mam/mam-state
               iota/iota-instance] :as db} :db
       :as cofx}
      [_ root side-key]]

   (log/infof "Fetching message for wattapp from root %s using side key %s"
              root side-key)

   {:iota-mam-fx/fetch {:iota-instance iota-instance
                        :root          root
                        :mode          (-> mam-state :channel :mode)
                        :side-key      side-key
                        :on-success    [:service-provider.wattapp/add-message]
                        :on-next-root  [:service-provider.wattapp/change-root]}
    :db                db}))


(reg-event-fx
 :service-provider.grandma-app/fetch
 (fn [{{:keys [iota.mam/mam-state
               iota/iota-instance] :as db} :db
       :as cofx}
      [_ root side-key]]

   (log/infof "Fetching message for grandma-app from root %s using side key %s"
              root side-key)

   {:iota-mam-fx/fetch {:iota-instance iota-instance
                        :root          root
                        :mode          (-> mam-state :channel :mode)
                        :side-key      side-key
                        :on-success    [:service-provider.grandma-app/add-message]
                        :on-next-root  [:service-provider.grandma-app/change-root]}
    :db                db}))


(reg-event-db
 :prosumer/authorize
 (fn [{:keys [data-provider/side-key data-provider/root] :as db} [_ service-provider]]

   (log/infof "Authorizing %s" service-provider)

   (-> (case service-provider
           "grandma-app"
         (assoc db
                :service-provider.grandma-app/side-key side-key
                :service-provider.grandma-app/root root)

         "wattapp"
         (assoc db
                :service-provider.wattapp/side-key side-key
                :service-provider.wattapp/root root)

         #_default
         (throw (js/Error. (str "Unknown service provider: " service-provider))))

       (update
        :data-provider/authorized-service-providers conj service-provider))))


(reg-event-db
 :prosumer/revoke
 (fn [{:keys [data-provider/side-key data-provider/root] :as db} [_ service-provider]]

   (log/infof "Revoking access for %s" service-provider)

   ;; TODO: inform authorized service providers of new side key
   (-> db
       (update :data-provider/side-key str "9")
       (update :data-provider/authorized-service-providers disj service-provider))))


(reg-event-db
 :service-provider.wattapp/add-message
 (fn [db [_ message]]
   (log/infof "Adding message %s for wattapp" message)
   (-> db
       (assoc :service-provider.wattapp/latest-msg-timestamp (js/Date.))
       (update :service-provider.wattapp/messages conj message))))


(reg-event-db
 :service-provider.wattapp/change-root
 (fn [db [_ root]]
   (log/infof "Changing root to %s for wattapp" root)
   (assoc db :service-provider.wattapp/root root)))


(reg-event-db
 :service-provider.grandma-app/add-message
 (fn [db [_ message]]
   (log/infof "Adding message %s for grandma-app" message)
   (-> db
       (assoc :service-provider.grandma-app/latest-msg-timestamp (js/Date.))
       (update :service-provider.grandma-app/messages conj message))))


(reg-event-db
 :service-provider.grandma-app/change-root
 (fn [db [_ root]]
   (log/infof "Changing root to %s for grandma-app" root)
   (assoc db :service-provider.grandma-app/root root)))
