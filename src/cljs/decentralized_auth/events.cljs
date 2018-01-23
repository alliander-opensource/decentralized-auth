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


;;;; Initialize database event handlers

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


;;;; Initialization of smart contract

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


;;;; Smart contract stateful event handlers (change blockchain state)

;; TODO: on-success and on-tx-receipt handlers should be implemented
;;       See https://github.com/district0x/re-frame-web3-fx/blob/master/README.md

(re-frame/reg-event-fx
 :do-nothing
 (fn [_ _]))


(re-frame/reg-event-db
 :blockchain/log-error
 (fn [db errors]
   (log/error "something went wrong" errors)
   db))


;;; Remove contract (only possible by address that created it)
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
 :blockchain/claim-data-provider
 (fn [{{:keys [db/active-address
               db/web3-instance
               blockchain/max-gas-limit
               contracts/contracts]} :db}
      [_ contract-key prosumer]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:claim-data-provider-fn]
       :fns     [{:instance      contract
                  :method        :claim-data-provider
                  :args          [prosumer]
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
      [_ contract-key data-provider service-provider]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:claim-data-provider-fn]
       :fns     [{:instance      contract
                  :method        :authorize
                  :args          [data-provider service-provider]
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
      [_ contract-key data-provider service-provider]]
   (let [tx-opts            {:gas  max-gas-limit
                             :from active-address}
         {:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/state-fns
      {:web3    web3-instance
       :db-path [:claim-data-provider-fn]
       :fns     [{:instance      contract
                  :method        :revoke
                  :args          [data-provider service-provider]
                  :tx-opts       tx-opts
                  :on-success    [:do-nothing]
                  :on-error      [:blockchain/log-error]
                  :on-tx-receipt [:do-nothing]}]}})))



;;;; Smart contract constant event handlers (query things on the blockchain)

(re-frame/reg-event-fx
 :blockchain/is-authorized?
 (fn [{{:keys [contracts/contracts]} :db}
      [_ contract-key service-provider]]
   (let [{:keys [contract]} (contract-key contracts)]
     {:web3-fx.contract/constant-fns
      {:fns [{:instance   contract
              :method     :is-authorized
              :args       [service-provider]
              :on-success [:db/add-authorization service-provider]
              :on-error   [:blockchain/log-error]}]}})))


(re-frame/reg-event-db
 :db/add-authorization
 (fn [db [_ service-provider authorized?]]
   (assoc-in db [:blockchain/authorizations service-provider] authorized?)))
