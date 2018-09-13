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
            [decentralized-auth.policy :as policy]
            [decentralized-auth.utils :refer [json-encode json-decode]]
            [decentralized-auth.views :as views] ;; misuse some mapbox stuff
            [re-frame.core :refer [reg-event-db reg-event-fx reg-fx dispatch]]))


(reg-event-db
 :db/initialize-db
 (fn [_ _]
   db/default-db))


(reg-event-fx
 :iota/initialize
 (fn [{{:keys [iota/provider] :as db} :db :as cofx} _]

   (log/infof "Initializing IOTA with provider %s..." provider)

   (let [iota-instance (iota/create-iota provider)]
     {:db (assoc db :iota/iota-instance iota-instance)})))


(defn get-policy [policies policy-id]
  (first (filter #(= (:id %) policy-id) policies)))


(defn gen-seed
  "Insecure way to generate a seed.

  Insecure because fewer characters (no 9) and it uses JavaScript's `random()`."
  []
  (let [seed-length     81
        random-A-till-Z #(char (+ (rand-int 26) 65))]
    (->> (repeatedly random-A-till-Z)
         (take seed-length)
         (apply str))))


(defn gen-key []
  (let [possible-keys ["BANANA" "POTATO" "HUMMUS" "SWEETPOTATO" "TOMATO"]
        rand-idx      (rand-int (count possible-keys))]
    (get possible-keys rand-idx)))


(defn upsert-mam-data
  "Add MAM data to policy with policy-id and return updated policies"
  [policy-id policies side-key mam-instance]
  (map #(if (= (:id %) policy-id)
          (assoc %
                 :iota/mam-instance mam-instance
                 :mam-side-key side-key)
          %)
       policies))


(reg-event-db
 :policy/upsert-mam-data
 (fn [{:keys [map/policies] :as db} [_ policy-id side-key mam-instance]]
   (update db :map/policies
           (fn [policies]
             (upsert-mam-data policy-id policies side-key mam-instance)))))


(defn to-trytes [iota-instance payload]
  (->> (clj->js payload)
       (.stringify js/JSON)
       (iota-utils/to-trytes iota-instance)))


(reg-event-fx
 :policy/create-and-add-mam-instance
 (fn [{{:keys [iota/iota-instance map/policies] :as db} :db :as cofx} [_ policy-id]]
   (let [seed           (gen-seed)
         side-key       (gen-key)
         security-level 2
         mam-instance   (-> (iota-mam/init iota-instance seed security-level)
                            (iota-mam/change-mode :restricted side-key))
         ;; Initial create to have a next_root on the MAM state...
         {:keys [state]}    (iota-mam/create mam-instance (to-trytes iota-instance {:type "INIT"}))]

        ;; NOTE: For now do not dispatch to upsert-mam-data because of timing
        ;;       issues in add-policy-visualization (add-policy expect these
        ;;       events to have finished...).
        {:db (update db :map/policies
                     (fn [policies]
                       (upsert-mam-data policy-id policies side-key state)))})))


(defn format-trytes [trytes]
  (apply str (conj (vec (take 10 trytes)) "...")))


(defn show-data-polyline [mapbox iota-authorization-pattern polyline-decorator]
  (let [data-marker  (.marker js/L
                              #js {:icon views/arrow-icon})
        data-pattern #js {:offset "50%"
                          :repeat "100%"
                          :symbol data-marker}]
    (.setPatterns polyline-decorator #js [iota-authorization-pattern
                                          data-pattern])))


(defn attach-policy [payload address policy-id on-success]
  (go (let [depth                5
            min-weight-magnitude 15
            _                    (views/notification :success
                                                     (str "Attaching policy to Tangle at MAM root "
                                                          (format-trytes address)))
            _                    (dispatch [:policy/set-pending policy-id true])
            t1                   (.getTime (js/Date.))
            result               (<! (iota-mam/attach payload
                                                      address
                                                      depth
                                                      min-weight-magnitude))
            t2                   (.getTime (js/Date.))
            duration             (/ (- t2 t1) 1000)]
        (if (vector? result)
          (let [[{iota-transaction-hash :hash
                  iota-bundle-hash      :bundle}
                 & more
                 :as transactions] result]
            (dispatch [:policy/set-pending policy-id false])
            (dispatch [:policy/add-iota-transaction-hash policy-id iota-transaction-hash])
            (dispatch [:policy/add-iota-bundle-hash policy-id iota-bundle-hash])
            (log/infof "Transactions attached to Tangle in %s seconds" duration)
            (on-success))
          (do
            (dispatch [:policy/set-pending policy-id false])
            (dispatch [:policy/set-error policy-id])
            (log/error
             (str "Failed to attach policy:<br/>"
                  result
                  "<br/>Please refresh.")))))))


(defn format-policy
  "Only keep relevant non-privacy sensitive information for publishing on the
  Tangle and add a description."
  [policy]
  (-> policy
      (select-keys [:type
                    :id ;; Necessary for view
                    :smart-meter
                    :service-provider
                    :goal
                    :address])
      (update :smart-meter dissoc :latlng)
      (update :service-provider dissoc :latlng)
      (assoc :description (policy/to-string policy))))


(defn format-authorized-policy
  [policy]
  (format-policy (assoc policy :type "AUTHORIZED")))


(defn format-revoked-policy
  [policy]
  (format-policy (assoc policy :type "REVOKED")))


(def called-policy-ids (atom #{}))
(defn first-time? [policy-id]
  (if (contains? @called-policy-ids policy-id)
    false
    (do
      (swap! called-policy-ids conj policy-id)
      true)))


(reg-fx
 :iota-mam-fx/attach
 (fn [{:keys [iota-instance mam-instance mam-side-key policy policy-id on-success]
       :or   {on-success identity}}]
   (let [{:keys [payload address state] :as message}
         (iota-mam/create mam-instance (to-trytes iota-instance policy))]
     (dispatch [:policy/upsert-mam-data policy-id mam-side-key state])
     (when (first-time? policy-id)
       (dispatch [:policy/add-mam-root policy-id (get-in mam-instance [:channel :next-root])]))
     (attach-policy payload address policy-id on-success))))


(defn show-data-flow [mapbox iota-authorization-pattern polyline-decorator]
  (let [arrow-marker  (.marker (.-Symbol js/L)
                               #js {:markerOptions #js {:icon         views/arrow-icon
                                                        :zIndexOffset -1000}})
        arrow-pattern #js {:offset "10%"
                           :repeat "5%"
                           :symbol arrow-marker}]
    (.setPatterns polyline-decorator #js [iota-authorization-pattern
                                          arrow-pattern])))

(reg-event-fx
 :policy/publish
 (fn [{{:keys [map/policies map/mapbox iota/iota-instance] :as db} :db}
      [_ policy-id]]
   (let [{:keys [iota/mam-instance
                 iota-authorization-pattern
                 polyline-decorator] :as policy} (get-policy policies policy-id)
         shareable-policy                        (format-authorized-policy policy)]
     (letfn [(show-data-flow-fn [] (show-data-flow mapbox
                                                   iota-authorization-pattern
                                                   polyline-decorator))]
       {:iota-mam-fx/attach {:iota-instance iota-instance
                             :mam-instance  mam-instance
                             :mam-side-key  (:mam-side-key policy)
                             :policy        shareable-policy
                             :policy-id     policy-id
                             :on-success    show-data-flow-fn}}))))


(defn assoc-policy
  "assoc key k and value v to policy with policy-id in db."
  [db policy-id k v]
  (update db :map/policies
          (fn [policies]
            (map #(if (= (:id %) policy-id)
                    (assoc % k v)
                    %)
                 policies))))


(defn show-revoked-icon [mapbox iota-authorization-pattern polyline-decorator]
  (let [revoked-marker  (.marker (.-Symbol js/L)
                                 #js {:markerOptions #js {:icon views/revoked-icon}})
        revoked-pattern #js {:offset "50%"
                             :repeat "100%"
                             :symbol revoked-marker}]
    (.setPatterns polyline-decorator #js [iota-authorization-pattern
                                          revoked-pattern])))


(reg-event-fx
 :policy/revoke
 (fn [{{:keys [map/mapbox map/policies iota/iota-instance] :as db} :db}
      [_ policy-id]]
   (let [{:keys [iota/mam-instance
                 iota-authorization-pattern
                 polyline-decorator] :as policy} (get-policy policies policy-id)
         shareable-policy                        (format-revoked-policy policy)]
     (letfn [(show-revoked-icon-fn [] (show-revoked-icon mapbox
                                                         iota-authorization-pattern
                                                         polyline-decorator))]
       {:db                       (assoc-policy db policy-id :revoked? true)
        :iota-mam-fx/attach       {:iota-instance iota-instance
                                   :mam-instance  mam-instance
                                   :mam-side-key  (:mam-side-key policy)
                                   :policy        shareable-policy
                                   :policy-id     policy-id
                                   :on-success    show-revoked-icon-fn}}))))


(reg-fx
 :iota-mam-fx/fetch
 (fn [{:keys [iota-instance root mode side-key on-success]}]
   (let [msg (iota-mam/fetch root mode side-key)]
     (dispatch (on-success msg)))))


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
    :policy/open-popup (get-policy policies policy-id)}))


(reg-event-db
 :map/add-mapbox
 (fn [db [_ mapbox]]
   (assoc db :map/mapbox mapbox)))


(reg-event-db
 :policy/add-popup
 (fn [{:keys [map/policies] :as db} [_ policy-id popup]]
   (assoc-policy db policy-id :popup popup)))

(reg-event-db
 :policy/add-iota-transaction-hash
 (fn [{:keys [map/policies] :as db} [_ policy-id iota-transaction-hash]]
   (assoc-policy db policy-id :iota-transaction-hash iota-transaction-hash)))


(reg-event-db
 :policy/add-iota-bundle-hash
 (fn [{:keys [map/policies] :as db} [_ policy-id iota-bundle-hash]]
   (assoc-policy db policy-id :iota-bundle-hash iota-bundle-hash)))


(reg-event-db
 :policy/add-mam-root
 (fn [{:keys [map/policies] :as db} [_ policy-id mam-root]]
   (assoc-policy db policy-id :mam-root mam-root)))


(reg-event-db
 :policy/add-polyline
 (fn [{:keys [map/policies] :as db} [_ policy-id polyline]]
   (assoc-policy db policy-id :polyline polyline)))


(reg-event-db
 :policy/add-polyline-decorator
 (fn [{:keys [map/policies] :as db} [_ policy-id polyline-decorator]]
   (assoc-policy db policy-id :polyline-decorator polyline-decorator)))


(reg-event-db
 :policy/add-iota-authorization-pattern
 (fn [{:keys [map/policies] :as db} [_ policy-id iota-authorization-pattern]]
   (assoc-policy db policy-id :iota-authorization-pattern iota-authorization-pattern)))


(reg-event-db
 :policy/set-pending
 (fn [{:keys [map/policies] :as db} [_ policy-id pending?]]
   (assoc-policy db policy-id :pending? pending?)))


(reg-event-db
 :policy/set-error
 (fn [{:keys [map/policies] :as db} [_ policy-id]]
   (assoc-policy db policy-id :error? true)))


(reg-event-db
 :policy/accept
 (fn [{:keys [map/policies] :as db} [_ policy-id]]
   (assoc-policy db policy-id :accepted? true)))
