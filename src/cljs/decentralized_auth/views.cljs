(ns decentralized-auth.views
  (:require [re-frame.core :refer [dispatch subscribe]]
            [reagent.core :as r]))


(defn format-root [root]
  (str (->> root (take 10) (apply str)) "......"))


(defn data-providers []
  (let [root     (subscribe [:data-provider/root])
        side-key (subscribe [:data-provider/side-key])]
    [:div.box.data-providers "Prosumer's Data Providers"
     [:br]
     [:span [:ul>li "Raspberry Pi"]]]))


(defn service-providers []
  [:div.box.service-providers "Independent Service Providers"

   [:div
    (let [side-key   (subscribe [:service-provider.grandma-app/side-key])
          root       (subscribe [:service-provider.grandma-app/root])
          public-key "x"]
      [:div {:style {:display "inline-block"}}
       [:br]
       [:span [:strong "Oma app."]]
       [:br]
       [:span "Public key: " public-key]
       [:br]
       [:span "Side key (encrypted): "
        (when (not-empty @side-key)
          (str public-key @side-key))]
       [:br]
       [:span "Next MAM root: " (format-root @root)]])

    (let [side-key   (subscribe [:service-provider.wattapp/side-key])
          root       (subscribe [:service-provider.wattapp/root])
          public-key "y"]
      [:div {:style {:display "inline-block"}}
       [:br]
       [:span [:strong "Wattapp."]]
       [:br]
       [:span "Public key: " public-key]
       [:br]
       [:span "Side key (encrypted): "
        (when (not-empty @side-key)
          (str public-key @side-key))]
       [:br]
       [:span "Next MAM root: " (format-root @root)]])]])


(defn raspberry-pi-image []
  [:img {:src "images/raspi.png" :alt "Raspberry Pi" :width "25%"}])


(defn grandma-app-image []
  [:img {:src "images/grandma.png" :alt "Grandma app" :width "25%"}])


(defn wattapp-image []
  [:img {:src "images/wattapp.png" :alt "Wattapp" :width "25%"}])


(defn prosumer-image []
  [:img {:src "images/prosumer.png" :alt "Prosumer" :width "10%"}])


(defn data-provider []
  (let [message  (r/atom "9ENERGYDATA9")
        side-key (subscribe [:data-provider/side-key])
        root     (subscribe [:data-provider/root])]
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
       [:span " Side key: "]
       [:input {:type      "text"
                :value     @side-key
                :size      32
                :on-change #(dispatch
                             [:data-provider/change-mode
                              :restricted
                              (-> % .-target .-value)])}]
       [:br]
       [:button.btn.btn-default
        {:on-click #(dispatch [:data-provider/publish @message])}
        "Publish"]
       [:br]
       [:span "MAM root: " (format-root @root)]])))


(defn grandma-app-data-flow []
  (let [authorized?          (subscribe [:service-provider.grandma-app/authorized?])
        latest-msg-timestamp (subscribe [:service-provider.grandma-app/latest-msg-timestamp])]
    (if @authorized?
      [:div.box.grandma-app-data-flow.authorized [:br] [:br] "Data flow allowed" [:br] "(authorized)"
       [:br]
       [:span "Last message: " @latest-msg-timestamp]]
      [:div.box.grandma-app-data-flow [:br] [:br] "Data flow disallowed" [:br] "(unauthorized)"])))


(defn wattapp-data-flow []
  (let [authorized?          (subscribe [:service-provider.wattapp/authorized?])
        latest-msg-timestamp (subscribe [:service-provider.wattapp/latest-msg-timestamp])]
    (if @authorized?
      [:div.box.wattapp-data-flow.authorized [:br] [:br] "Data flow allowed" [:br] "(authorized)"
       [:br]
       [:span "Last message: " @latest-msg-timestamp]]
      [:div.box.wattapp-data-flow [:br] [:br] "Data flow disallowed" [:br] "(unauthorized)"])))


(defn messages-panel [messages]
  [:span "Messages: "
   (into [:ul]
    (map (fn [msg] [:li ^{:key msg} msg])
         messages))])


(defn grandma-app []
  (let [root     (subscribe [:service-provider.grandma-app/root])
        side-key (subscribe [:service-provider.grandma-app/side-key])
        messages (subscribe [:service-provider.grandma-app/messages])]
    [:div.box.grandma-app "Service Provider 1 (Oma app)"
     [:br]
     [grandma-app-image]
     [:br]
     [messages-panel @messages]
     [:br]
     [:button.btn.btn-default
      {:on-click #(dispatch [:service-provider.grandma-app/fetch @root @side-key])}
      "Fetch"]]))


(defn wattapp []
  (let [root     (subscribe [:service-provider.wattapp/root])
        side-key (subscribe [:service-provider.wattapp/side-key])
        messages (subscribe [:service-provider.wattapp/messages])]
    [:div.box.wattapp "Service Provider 2 (Wattapp)"
     [:br]
     [wattapp-image]
     [:br]
     [messages-panel @messages]
     [:br]
     [:button.btn.btn-default
      {:on-click #(dispatch [:service-provider.wattapp/fetch @root @side-key])}
      "Fetch"]]))


(defn prosumer []
  [:div.box.prosumer "Prosumer"
   [:br]
   [prosumer-image]
   [:br]
   [:button.btn.btn-default
    {:on-click #(dispatch [:prosumer/claim-pi])}
    "Claim Pi"]
   [:span " "]
   [:button.btn.btn-default
    {:on-click #(dispatch [:prosumer/authorize "grandma-app" "x"])}
    "Authorize Oma app"]
   [:span " "]
   [:button.btn.btn-default
    {:on-click #(dispatch [:prosumer/revoke "grandma-app" "x"])}
    "Revoke access for Oma app"]
   [:span " "]
   [:button.btn.btn-default
    {:on-click #(dispatch [:prosumer/authorize "wattapp" "y"])}
    "Authorize Wattapp"]
   [:span " "]
   [:button.btn.btn-default
    {:on-click #(dispatch [:prosumer/revoke "wattapp" "y"])}
    "Revoke access for Wattapp"]])


(defn smart-authorization-grid []
  [:div.wrapper
   [data-providers]                        [service-providers]
   [data-provider] [grandma-app-data-flow] [grandma-app]
   [prosumer]      [wattapp-data-flow]     [wattapp]])


(defn main-panel []
  [smart-authorization-grid])
