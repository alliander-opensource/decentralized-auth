(ns decentralized-auth.views
  (:require [re-frame.core :as re-frame]
            [reagent.core :as r]))


(defn no-web3-explanation []
  [:div.box.prosumer
   "This website works with Web3.js for interaction with
    Ethereum smart contracts. Please install the "
   [:a {:href "https://metamask.io/"} "MetaMask extension"]
   ", "
   [:a {:href "https://github.com/ethereum/mist"} "Mist Browser"]
   ", or "
   [:a {:href "https://parity.io/"} "Parity Browser"]
   ", and refresh."])


(def key-pair
  [:img {:src "images/keys.png" :alt "Key pair"}])


(defn data-provider []
  (let [prosumer (r/atom "0xbC965738eAbb38d15dc5d0B63Ec1420EAb5df2BC")]
    (fn []
      [:div.box.data-provider "Data Provider 0x85d..."
       [:br]
       key-pair
       [:br]
       [:button.btn.btn-default
        {:on-click #(re-frame/dispatch [:blockchain/claim-data-provider
                                        :smart-energy-authorizations
                                        @prosumer])}
        "Claim"]
       [:span " Prosumer: "]
       [:input {:type        "text"
                :value       @prosumer
                :on-change   #(reset! prosumer
                                      (-> % .-target .-value))}]])))


(defn data []
  (let [authorizations (re-frame/subscribe [:blockchain/authorizations])]
    (fn []
      (if (get @authorizations "0x4053e580c8aA07c3A2eB8F0d41bE1f380d29c374")
        [:div.box.data-flow.authorized "Data flow allowed" [:br] "(authorized)"]
        [:div.box.data-flow "Data flow disallowed" [:br] "(unauthorized)"]))))


(defn service-provider []
  [:div.box.service-provider "Service Provider 0x40..."
   [:br]
   key-pair])


(defn prosumer []
  (let [data-provider    (r/atom "0x85d85715218895AE964A750D9A92F13a8951dE3d")
        service-provider (r/atom "0x4053e580c8aA07c3A2eB8F0d41bE1f380d29c374")]
    (fn []
      [:div.box.prosumer "Prosumer 0xbC..."
       [:br]
       key-pair
       [:br]
       [:button.btn.btn-default
        {:on-click #(re-frame/dispatch [:blockchain/authorize
                                        :smart-energy-authorizations
                                        @data-provider
                                        @service-provider])}
        "Authorize"]
       [:span " Data Provider: "]
       [:input {:type      "text"
                :value     @data-provider
                :on-change #(reset! data-provider (-> % .-target .-value))}]
       [:span " Service Provider: "]
       [:input {:type      "text"
                :value     @service-provider
                :on-change #(reset! service-provider (-> % .-target .-value))}]
       [:br]
       [:button.btn.btn-default
        {:style    {:margin-top :5px}
         :on-click #(re-frame/dispatch [:blockchain/revoke
                                        :smart-energy-authorizations
                                        @data-provider
                                        @service-provider])}
        "Revoke authorization"]])))


(defn footer []
  [:div.box.footer
   [:a
    {:href "contracts/src/SmartEnergyAuthorizations.sol"}
    "Smart contract code"]])


(defn smart-authorization-grid []
  [:div.wrapper
   ;; FIXME: find out how to dynamically create
   ;; more [data-provider,data,service-provider]s in CSS Grid Layout
   [data-provider]
   [data]
   [service-provider]
   [prosumer]
   [footer]])


(defn main-panel []
  (let [provides-web3? (re-frame/subscribe [:db/provides-web3?])]
    (fn []
      (if @provides-web3?
        [smart-authorization-grid]
        [no-web3-explanation]))))
