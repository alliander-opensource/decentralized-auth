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
            [decentralized-auth.utils :refer [json-encode json-decode to-string]]
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


(defn attach-policy [payload address policy-id]
  (go (let [depth                5
            min-weight-magnitude 15
            _                    (log/infof "Attaching policy at MAM root %s" (format-trytes address))
            result               (<! (iota-mam/attach payload
                                                      address
                                                      depth
                                                      min-weight-magnitude))]
        (if (seq? result)
          (let [[{iota-transaction-hash :hash
                  iota-bundle-hash      :bundle}
                 & more
                 :as transactions] result]
            (dispatch [:policy/add-iota-transaction-hash policy-id iota-transaction-hash])
            (dispatch [:policy/add-iota-bundle-hash policy-id iota-bundle-hash])
            (log/info "Transactions attached to Tangle"))
          (log/error
           (str "Failed to attach policy:<br/>"
                result
                "<br/>Please refresh (which updates provider)."))))))


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
      (assoc :description (to-string policy))))


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
 (fn [{:keys [iota-instance mam-instance mam-side-key policy policy-id]}]
   (let [{:keys [payload address state] :as message}
         (iota-mam/create mam-instance (to-trytes iota-instance policy))]
     (dispatch [:policy/upsert-mam-data policy-id mam-side-key state])
     (when (first-time? policy-id)
       (dispatch [:policy/add-mam-root policy-id (get-in mam-instance [:channel :next-root])]))
     (attach-policy payload address policy-id))))


(reg-event-fx
 :policy/publish
 (fn [{{:keys [map/policies iota/iota-instance] :as db} :db}
      [_ policy-id]]
   (let [{:keys [iota/mam-instance] :as policy} (get-policy policies policy-id)
         shareable-policy                       (format-authorized-policy policy)]
     {:iota-mam-fx/attach {:iota-instance iota-instance
                           :mam-instance  mam-instance
                           :mam-side-key  (:mam-side-key policy)
                           :policy        shareable-policy
                           :policy-id     policy-id}})))


(defn assoc-policy
  "assoc k and value to policy with policy-id in db."
  [db policy-id k v]
  (update db :map/policies
          (fn [policies]
            (map #(if (= (:id %) policy-id)
                    (assoc % k v)
                    %)
                 policies))))


(reg-event-fx
 :policy/revoke
 (fn [{{:keys [map/policies iota/iota-instance] :as db} :db}
      [_ policy-id]]
   (let [{:keys [iota/mam-instance] :as policy} (get-policy policies policy-id)
         shareable-policy                       (format-revoked-policy policy)]
     {:db                 (assoc-policy db policy-id :revoked? true)
      :iota-mam-fx/attach {:iota-instance iota-instance
                           :mam-instance  mam-instance
                           :mam-side-key  (:mam-side-key policy)
                           :policy        shareable-policy
                           :policy-id     policy-id}})))


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
 :policy/add-popup
 (fn [{:keys [map/policies] :as db} [_ policy-id popup]]
   (update db :map/policies
           (fn [policies]
             (map #(if (= (:id %) policy-id)
                      (assoc % :popup popup)
                      %)
                  policies)))))


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
