(ns decentralized-auth.events
  (:require-macros [taoensso.timbre :as log])
  (:require [cljs-web3.core :as web3]
            [cljs-web3.eth :as web3-eth]
            [cljs.spec.alpha]
            [decentralized-auth.blockchain :as blockchain]
            [decentralized-auth.db :as db]
            [madvas.re-frame.web3-fx :as web3-fx]
            [re-frame.core :as re-frame]
            [taoensso.timbre :as log]))


;;; INITIALIZE DATABASE EVENT HANDLERS

(re-frame/reg-event-db
 :db/initialize-db
 (fn [_ _]
   db/default-db))

(re-frame/reg-event-fx
 :db/provide-web3
 (fn [{:keys [db]} [_ provides-web3? web3-instance]]
   (merge
    {:db (assoc db :db/provides-web3? provides-web3?)}
    (when provides-web3?
      {:dispatch [:db/store-web3-instance web3-instance]}))))

(re-frame/reg-event-fx
 :db/store-web3-instance
 (fn [{:keys [db]} [_ web3-instance]]
   {:db       (assoc db :db/web3-instance web3-instance)
    :dispatch [:db/add-active-address]}))

(re-frame/reg-event-fx
 :db/add-active-address
 (fn [{{:keys [db/web3-instance] :as db} :db}]
   (let [active-address (blockchain/get-active-address web3-instance)]
     {:db (assoc db :db/active-address active-address)
      :dispatch [:db/add-contracts]})))


;;; INITIALIZATION OF SMART CONTRACT

(re-frame/reg-event-fx
 :db/add-contracts
 (fn [{{:keys [contracts/contracts db/web3-instance]} :db}]
   (doseq [[contract-key {:keys [address]}] contracts]
     (blockchain/add-ropsten-contract web3-instance
                                      contract-key
                                      address))))

(re-frame/reg-event-db
 :db/add-contract
 (fn [db [_ contract-key abi contract]]
   (update-in db [:contracts/contracts contract-key]
              assoc
              :abi abi
              :contract contract)))


;;; SMART CONTRACT STATEFUL EVENT HANDLERS (change something on the blockchain)

;; TODO: on-success and on-tx-receipt handlers should do implemented
;;       See https://github.com/district0x/re-frame-web3-fx/blob/master/README.md

(re-frame/reg-event-fx
 :do-nothing
 (fn [_ _]))

(re-frame/reg-event-db
 :blockchain/log-error
 (fn [db errors]
   (log/error "something went wrong" errors)
   db))

(re-frame/reg-event-fx
 :blockchain/remove
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:remove-fn]
       :fns     [{:instance      contract
                  :method        :remove
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))

(re-frame/reg-event-fx
 :blockchain/register-device
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:register-device-fn]
       :fns     [{:instance      contract
                  :method        :register-device
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))

(re-frame/reg-event-fx
 :blockchain/register-app
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:register-device-fn]
       :fns     [{:instance      contract
                  :method        :register-app
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))

(re-frame/reg-event-fx
 :blockchain/register-consumer
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:register-consumer-fn]
       :fns     [{:instance      contract
                  :method        :register-consumer
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))

(re-frame/reg-event-fx
 :blockchain/claim-device
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key consumer]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:claim-device-fn]
       :fns     [{:instance      contract
                  :method        :claim-device
                  :args          [consumer]
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))

(re-frame/reg-event-fx
 :blockchain/authorize
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key device app]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:claim-device-fn]
       :fns     [{:instance      contract
                  :method        :authorize
                  :args          [device app]
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))

(re-frame/reg-event-fx
 :blockchain/revoke
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key device app]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:claim-device-fn]
       :fns     [{:instance      contract
                  :method        :revoke
                  :args          [device app]
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))


;;; SMART CONTRACT CONSTANT EVENT HANDLERS (query things on the blockchain)

(re-frame/reg-event-fx
 :blockchain/is-authorized?
 (fn [{{:keys [contracts/contracts]} :db}
      [_ contract-key app]]
   (let [{:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/constant-fns
      {:fns [{:instance   contract
              :method     :is-authorized
              :args       [app]
              :on-success [:db/add-authorization app]
              :on-error   [:blockchain/log-error]}]}})))

(re-frame/reg-event-db
 :db/add-authorization
 (fn [db [_ app authorized?]]
   (assoc-in db [:blockchain/authorizations app] authorized?)))
