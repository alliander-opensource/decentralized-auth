(ns decentralized-auth.views
  (:require [re-frame.core :as re-frame]
            [reagent.core :as r]))


(defn format-root [root]
  (str (->> root (take 10) (apply str)) "......"))


(defn data-providers []
  (let [root     (re-frame/subscribe [:data-provider/root])
        side-key (re-frame/subscribe [:data-provider/side-key])]
    [:div.box.data-providers "Prosumer's Data Providers"
     [:br]
     [:span [:strong "Raspberry Pi"]]
     [:br]
     [:span "Root: " (format-root @root)]
     [:br]
     [:span "Side key: " @side-key]]))


(defn service-providers []
  (let [side-key (re-frame/subscribe [:data-provider/side-key])]
    [:div.box.service-providers "Independent Service Providers"
     [:br]
     [:span "Oma app. Public key: x"]
     [:br]
     [:span "Side key: " @side-key]]))


(defn raspberry-pi-image []
  [:img {:src "images/raspi.png" :alt "Raspberry Pi" :width "25%"}])


(defn grandma-app-image []
  [:img {:src "images/grandma.png" :alt "Grandma app" :width "25%"}])


(defn prosumer-image []
  [:img {:src "images/prosumer.png" :alt "Prosumer" :width "10%"}])


(defn data-provider []
  (let [message (r/atom "GRANDMA9MAKES9COFFEE")]
    (fn []
      [:div.box.data-provider "Data Provider (Raspberry Pi)"
       [:br]
       [raspberry-pi-image]
       [:br]
       [:span " Message: "]
       [:input {:type      "text"
                :value     @message
                :size      32
                :on-change #(reset! message (-> % .-target .-value))}]
       [:br]
       [:button.btn.btn-default
        {:on-click #(re-frame/dispatch [:data-provider/publish @message])}
        "Publish"]])))


(defn data []
  (let [authorizations (re-frame/subscribe [:view/authorizations])]
    (if (get @authorizations "0x4053e580c8aA07c3A2eB8F0d41bE1f380d29c374")

        ;;; TODO: make it into an arrow?
      [:div.box.data-flow.authorized "Data flow allowed" [:br] "(authorized)"]
      [:div.box.data-flow "Data flow disallowed" [:br] "(unauthorized)"])))


(defn service-provider []
  (let [root    (re-frame/subscribe [:data-provider/root])
        message (re-frame/subscribe [:service-provider/message])]
    [:div.box.service-provider "Service Provider (Oma app)"
     [:br]
     [grandma-app-image]
     [:br]
     [:span " Message: "]
     [:input {:type      "text"
              :value     @message
              :size      32
              :on-change identity}]
     [:br]
     [:button.btn.btn-default
      {:on-click #(re-frame/dispatch [:service-provider/fetch @root])}
      "Fetch"]
     [:br]]))


(defn prosumer []
  (let [root     (re-frame/subscribe [:data-provider/root])
        side-key (re-frame/subscribe [:data-provider/side-key])]
    [:div.box.prosumer "Prosumer"
     [:br]
     [prosumer-image]
     [:br]
     [:span " Side key: "]
     [:input {:type      "text"
              :value     @side-key
              :size      32
              :on-change #(re-frame/dispatch
                           [:data-provider/side-key-changed
                            (-> % .-target .-value)])}]
     [:br]
     [:button.btn.btn-default
      {:on-click #(re-frame/dispatch [:iota/authorize
                                      @root
                                      @side-key])}
      "Authorize Oma app"]]))


(defn smart-authorization-grid []
  [:div.wrapper
   [data-providers] [service-providers]
   [data-provider] [data] [service-provider]
   [prosumer]])


(defn main-panel []
  [smart-authorization-grid])
