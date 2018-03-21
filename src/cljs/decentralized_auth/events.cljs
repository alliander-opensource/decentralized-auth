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
 (fn [{:keys [iota.mam/mam-state
              data-provider/authorized-service-providers]
       :as   db}
      [_ mam-mode side-key]]

   (log/infof "Changing MAM mode to %s and side key to %s "
              (name mam-mode) side-key)

   (let [new-mam-state (cond-> mam-state
                         (not (and (= mam-mode :restricted)
                                   (string/blank? side-key)))
                         (iota-mam/change-mode mam-mode side-key))]
     (assoc db
            :iota.mam/mam-state new-mam-state
            :data-provider/side-key side-key))))


(defn side-key-msg
  "Create a message for key rotation. Encrypt the side keys with the public keys
  of authorized service providers."
  [side-key authorized-service-providers]
  (-> {"grandma-app" (str "x" side-key)
       "wattapp"     (str "y" side-key)}
      (select-keys authorized-service-providers)))


(reg-event-fx
 :data-provider/rotate-key
 (fn [{{:keys [iota.mam/mam-state]
        :as   db}
       :db :as cofx}
      [_ authorized-service-providers side-key]]

   (log/infof "Informing authorized data providers %s of new side key %s"
              authorized-service-providers
              side-key)

   ;; Encrypt side keys using public keys of authorized service providers
   ;; Add them into data structure, publish that message, change mode
   (let [new-side-key-msg (json-encode
                           {:type "key-rotation"
                            :value  (side-key-msg side-key
                                                  authorized-service-providers)})]

     {:dispatch-later [{:ms       0
                        :dispatch [:data-provider/publish new-side-key-msg]}
                       ;; Bit hacky way to change the mode AFTER the
                       ;; new-side-key msg has been published.
                       {:ms       2000
                        :dispatch [:data-provider/change-mode :restricted side-key]}]})))


(defn attach-to-tangle [payload address]
  (go (let [depth                6
            min-weight-magnitude 3
            transactions         (<! (iota-mam/attach payload
                                                      address
                                                      depth
                                                      min-weight-magnitude))]
        (log/infof "Transactions attached to tangle: %s" transactions))))


(reg-event-db
 :data-provider/publish
 (fn [{:keys [iota.mam/mam-state iota/iota-instance] :as db} [_ packet]]
   (let [trytes                               (iota-utils/to-trytes iota-instance packet)
         {:keys [state payload root address]} (iota-mam/create mam-state trytes)]

     (log/infof "Attaching message %s at root %s with address %s"
                packet root address)

     (attach-to-tangle payload address)
     (assoc db
            :data-provider/root root
            :iota.mam/mam-state state))))


(reg-fx
 :iota-mam-fx/fetch
 (fn [{:keys [iota-instance root mode side-key on-success on-next-root]}]
   (go (let [callback            #(let [msg (iota-utils/from-trytes iota-instance %)]
                                    (dispatch (conj on-success msg)))
             {:keys [next-root]} (<! (iota-mam/fetch root mode side-key callback))]
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
                :service-provider.grandma-app/side-key (str "x" side-key)
                :service-provider.grandma-app/root root)

         "wattapp"
         (assoc db
                :service-provider.wattapp/side-key (str "y" side-key)
                :service-provider.wattapp/root root)

         #_default
         (throw (js/Error. (str "Unknown service provider: " service-provider))))

       (update
        :data-provider/authorized-service-providers conj service-provider)
       (update
        :prosumer/authorized-service-providers conj service-provider))))


(defn gen-key []
  (->> (random-uuid) str (take 8) (apply str) string/upper-case))


(reg-event-fx
 :prosumer/revoke
 (fn [{{:keys [data-provider/side-key
               data-provider/root
               data-provider/authorized-service-providers]
        :as   db}
       :db :as cofx}
      [_ service-provider]]

   (let [new-authorized-service-providers
         (disj authorized-service-providers service-provider)
         new-side-key (gen-key)]

     (log/infof "Revoking access for %s" service-provider)

     {:db       (assoc db :data-provider/side-key new-side-key
                       :data-provider/authorized-service-providers
                       new-authorized-service-providers
                       :prosumer/authorized-service-providers
                       new-authorized-service-providers)
      :dispatch [:data-provider/rotate-key
                 new-authorized-service-providers
                 new-side-key]})))


(reg-event-db
 :service-provider.wattapp/add-message
 (fn [db [_ message]]

   (let [{:keys [type value]} (json-decode message)]

     (log/infof "Adding message %s for wattapp" message)

     (when (= type "key-rotation")
       (log/info "Rotating keys"))

     (cond-> db
       (= type "key-rotation") (assoc :service-provider.wattapp/side-key
                                      (:wattapp value))
       true (assoc :service-provider.wattapp/latest-msg-timestamp (js/Date.))
       true (update :service-provider.wattapp/messages conj message)))))


(reg-event-db
 :service-provider.wattapp/change-root
 (fn [db [_ root]]
   (log/infof "Changing root to %s for wattapp" root)
   (assoc db :service-provider.wattapp/root root)))


(reg-event-db
 :service-provider.grandma-app/add-message
 (fn [db [_ message]]

   (let [{:keys [type value]} (json-decode message)]

     (log/infof "Adding message %s for grandma-app" message)

     (when (= type "key-rotation")
       (log/info "Rotating keys"))

     (cond-> db
       (= type "key-rotation") (assoc :service-provider.grandma-app/side-key
                                      (:grandma-app value))
       true (assoc :service-provider.grandma-app/latest-msg-timestamp (js/Date.))
       true (update :service-provider.grandma-app/messages conj message)))))


(reg-event-db
 :service-provider.grandma-app/change-root
 (fn [db [_ root]]
   (log/infof "Changing root to %s for grandma-app" root)
   (assoc db :service-provider.grandma-app/root root)))
