(ns decentralized-auth.views
  (:require [re-frame.core :as re-frame]
            [reagent.core :as r]))

(defn no-web3-explanation []
  [:div.box.consumer
   "This website works with Web3.js for interaction with
    Ethereum smart contracts. Please install the "
   [:a {:href "https://metamask.io/"} "MetaMask extension"]
   ", "
   [:a {:href "https://github.com/ethereum/mist"} "Mist Browser"]
   " or "
   [:a {:href "https://parity.io/"} "Parity Browser"]
   " and refresh."])

(def key-pair
  [:img {:src "images/keys.png" :alt "Key pair"}])

(defn device []
  (let [consumer (r/atom "0xbC965738eAbb38d15dc5d0B63Ec1420EAb5df2BC")]
    (fn []
      [:div.box.device "Device 0x85d..."
       [:br]
       key-pair
       [:br]
       [:button.btn.btn-default
        {:on-click #(re-frame/dispatch [:blockchain/claim-device
                                        :smart-energy-authorizations
                                        @consumer])}
        "Claim"]
       [:span " Consumer: "]
       [:input {:type        "text"
                :value       @consumer
                :on-change   #(reset! consumer
                                      (-> % .-target .-value))}]])))

(defn data []
  (let [authorizations (re-frame/subscribe [:blockchain/authorizations])]
    (fn []
      (if (get @authorizations "0x4053e580c8aA07c3A2eB8F0d41bE1f380d29c374")
        [:div.box.data-flow.authorized "Data flow allowed" [:br] "(authorized)"]
        [:div.box.data-flow "Data flow disallowed" [:br] "(unauthorized)"]))))

(defn app []
  [:div.box.app "App 0x40..."
   [:br]
   key-pair])

(defn consumer []
  (let [device (r/atom "0x85d85715218895AE964A750D9A92F13a8951dE3d")
        app    (r/atom "0x4053e580c8aA07c3A2eB8F0d41bE1f380d29c374")]
    (fn []
      [:div.box.consumer "Consumer 0xbC..."
       [:br]
       key-pair
       [:br]
       [:button.btn.btn-default
        {:on-click #(re-frame/dispatch [:blockchain/authorize
                                        :smart-energy-authorizations
                                        @device
                                        @app])}
        "Authorize"]
       [:span " Device: "]
       [:input {:type      "text"
                :value     @device
                :on-change #(reset! device (-> % .-target .-value))}]
       [:span " App: "]
       [:input {:type      "text"
                :value     @app
                :on-change #(reset! app (-> % .-target .-value))}]
       [:br]
       [:button.btn.btn-default
        {:style {:margin-top :5px}
         :on-click #(re-frame/dispatch [:blockchain/revoke
                                        :smart-energy-authorizations
                                        @device
                                        @app])}
        "Revoke authorization"]])))

(defn smart-authorization-grid []
  [:div.wrapper
   ;; FIXME: find out how to dynamically create more [device,data,app]s in CSS
   ;; Grid Layout
   [device]
   [data]
   [app]
   [consumer]])

(defn main-panel []
  (let [provides-web3? (re-frame/subscribe [:db/provides-web3?])]
    (fn []
      (if @provides-web3?
        [smart-authorization-grid]
        [no-web3-explanation]))))
