(ns decentralized-auth.views
  (:require [re-frame.core :as re-frame]
            [reagent.core :as r]))


(defn data-providers []
  [:div.box.data-providers "Prosumer's Data Providers"
   [:br]
   [:span "Raspberry Pi. Root: x"]])


(defn service-providers []
  [:div.box.service-providers "Independent Service Providers"
   [:br]
   [:span "Oma app. Public key: x"]])


(def key-pair
  [:img {:src "images/keys.png" :alt "Key pair"}])


(defn data-provider []
  (let [payload  (r/atom "GRANDMA9IS9WALKING")
        side-key (re-frame/subscribe [:data-provider/side-key])
        root     (re-frame/subscribe [:data-provider/root])]
    (fn []
      [:div.box.data-provider "Data Provider (Raspberry Pi)"
       [:br]
       key-pair
       [:br]
       [:span " Payload: "]
       [:input {:type      "text"
                :value     @payload
                :size      32
                :on-change #(reset! payload (-> % .-target .-value))}]
       [:br]
       [:button.btn.btn-default
        {:on-click #(re-frame/dispatch [:data-provider/publish
                                        @payload
                                        @root
                                        @side-key])}
        "Publish"]])))


(defn data []
  (let [authorizations (re-frame/subscribe [:view/authorizations])]
    (fn []
      (if (get @authorizations "0x4053e580c8aA07c3A2eB8F0d41bE1f380d29c374")
        [:div.box.data-flow.authorized "Data flow allowed" [:br] "(authorized)"]
        [:div.box.data-flow "Data flow disallowed" [:br] "(unauthorized)"]))))


(defn service-provider []
  [:div.box.service-provider "Service Provider (Oma app)"
   [:br]
   key-pair])


(defn prosumer []
  (let [root     (r/atom "0x85d85715218895AE964A750D9A92F13a8951dE3d")
        side-key (r/atom "SECRET")]
    (fn []
      [:div.box.prosumer "Prosumer"
       [:br]
       key-pair
       [:br]
       [:span " Side key: "]
       [:input {:type      "text"
                :value     @side-key
                :size      32
                :on-change #(reset! side-key (-> % .-target .-value))}]
       [:br]
       [:button.btn.btn-default
        {:on-click #(re-frame/dispatch [:iota/authorize
                                        @root
                                        @side-key])}
        "Authorize Oma app"]])))


(defn smart-authorization-grid []
  [:div.wrapper
   [data-providers] [service-providers]
   [data-provider] [data] [service-provider]
   [prosumer]])


(defn main-panel []
  [smart-authorization-grid])
