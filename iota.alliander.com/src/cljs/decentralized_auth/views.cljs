(ns decentralized-auth.views
  (:require cljsjs.noty
            [decentralized-auth.utils :refer [debug-panel json-encode]]
            [re-frame.core :refer [dispatch subscribe]]
            [reagent.core :as r]))


(defn format-root [root]
  (str (->> root (take 10) (apply str)) "......"))


(defn decrypt-side-key
  "Decrypting now means removing the \"public key\" prefix. (the \"x\" and
  \"y\")"
  [side-key]
  (when side-key (subs side-key 1)))


(defn notification
  "Displays the msg in a Noty notification with type `:info`, `:warning` or
  `:error`."
  [type msg]
  (.show (js/Noty. #js {:text    (str "<span>" msg "</span>")
                        :theme   "mint"
                        :type    (name type)
                        :layout  "bottomRight"
                        :timeout 10000})))


(defn authorizations-panel [authorizations]
  [:div
   "Authorized service providers:"
   (->> authorizations
        (map (fn [sp] [:li ^{:key sp} sp]))
        (into [:span>ul]))])


(defn data-providers []
  (let [root           (subscribe [:data-provider/root])
        side-key       (subscribe [:data-provider/side-key])
        authorizations (subscribe [:data-provider/authorized-service-providers])]
    [:div.box.data-providers "Prosumer's Data Providers"
     [:br]
     [:span [:ul>li "Raspberry Pi"
             [authorizations-panel @authorizations]]]]))


(defn service-providers []
  [:div.box.service-providers "Independent Service Providers"

   [:div
    (let [public-key "x"]
      [:div {:style {:display "inline-block"}}
       [:br]
       [:span [:strong "Grandma app."]]
       [:br]
       [:span "Public key: " public-key]])

    (let [public-key "y"]
      [:div {:style {:display "inline-block" :padding-left "10px"}}
       [:br]
       [:span [:strong "Wattapp."]]
       [:br]
       [:span "Public key: " public-key]])]])


(defn raspberry-pi-image []
  [:img {:src "images/raspi.png" :alt "Raspberry Pi" :width "25%"}])


(defn grandma-app-image []
  [:img {:src "images/grandma.png" :alt "Grandma app" :width "25%"}])


(defn wattapp-image []
  [:img {:src "images/wattapp.png" :alt "Wattapp" :width "25%"}])


(defn prosumer-image []
  [:img {:src "images/prosumer.png" :alt "Prosumer" :width "10%"}])


(defn data-provider []
  (let [message        (r/atom "some energy data")
        side-key       (subscribe [:data-provider/side-key])
        root           (subscribe [:data-provider/root])
        authorizations (subscribe [:data-provider/authorized-service-providers])]
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
        {:on-click #(dispatch [:data-provider/publish (json-encode
                                                       {:type  "data"
                                                        :value @message})])}
        "Publish"]
       [:br]
       [:span "MAM root: " (format-root @root)]
       [:br]
       [:span "Claim token: 9ABC?"]
       [:br]
       [:br]
       [authorizations-panel @authorizations]])))


(defn grandma-app-data-flow []
  (let [authorized?          (subscribe [:service-provider.grandma-app/authorized?])
        latest-msg-timestamp (subscribe [:service-provider.grandma-app/latest-msg-timestamp])]
    (if @authorized?
      [:div.box.grandma-app-data-flow.authorized
       [:br]
       [:br]
       "Data flow allowed"
       [:br]
       "(authorized)"
       [:br]
       (when @latest-msg-timestamp
         [:span "Last message: " @latest-msg-timestamp])]
      [:div.box.grandma-app-data-flow
       [:br]
       [:br]
       "Data flow disallowed"
       [:br]
       "(unauthorized)"
       [:br]
       (when @latest-msg-timestamp
         [:span "Last message: " @latest-msg-timestamp])])))


(defn wattapp-data-flow []
  (let [authorized?          (subscribe [:service-provider.wattapp/authorized?])
        latest-msg-timestamp (subscribe [:service-provider.wattapp/latest-msg-timestamp])]
    (if @authorized?
      [:div.box.wattapp-data-flow.authorized
       [:br]
       [:br]
       "Data flow allowed"
       [:br]
       "(authorized)"
       [:br]
       (when @latest-msg-timestamp
         [:span "Last message: " @latest-msg-timestamp])]
      [:div.box.wattapp-data-flow
       [:br]
       [:br]
       "Data flow disallowed"
       [:br]
       "(unauthorized)"
       [:br]
       (when @latest-msg-timestamp
         [:span "Last message: " @latest-msg-timestamp])])))


(defn messages-panel [messages]
  [:span "Messages: "
   (into [:ul]
    (map (fn [msg] [:li ^{:key msg} msg])
         messages))])


(defn grandma-app []
  (let [root     (subscribe [:service-provider.grandma-app/root])
        side-key (subscribe [:service-provider.grandma-app/side-key])
        messages (subscribe [:service-provider.grandma-app/messages])]
    [:div.box.grandma-app "Service Provider 1 (Grandma app)"
     [:br]
     [grandma-app-image]
     [:br]
     [messages-panel @messages]
     [:br]
     [:span "Next MAM root: " (format-root @root)]
     [:br]
     [:span "Side key (encrypted): " @side-key]
     [:br]
     [:button.btn.btn-default
      {:on-click #(dispatch [:prosumer/authorize "grandma-app" "x"])}
      "Authorize"]
     " "
     [:button.btn.btn-default
      {:on-click #(dispatch [:service-provider.grandma-app/fetch
                             @root
                             (decrypt-side-key @side-key)])}
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
     [:span "Next MAM root: " (format-root @root)]
     [:br]
     [:span "Side key (encrypted): " @side-key]
     [:br]
     [:button.btn.btn-default
      {:on-click #(dispatch [:prosumer/authorize "wattapp" "y"])}
      "Authorize"]
     [:span " "]
     [:button.btn.btn-default
      {:on-click #(dispatch [:service-provider.wattapp/fetch
                             @root
                             (decrypt-side-key @side-key)])}
      "Fetch"]]))


(defn prosumer []
  (let [authorizations (subscribe [:prosumer/authorized-service-providers])]
    [:div.box.prosumer "Prosumer"
     [:br]
     [prosumer-image]
     [:br]
     "Data providers"
     [:span [:ul>li "Raspberry Pi"
             [authorizations-panel @authorizations]]]
     [:br]
     [:button.btn.btn-default
      {:on-click #(dispatch [:prosumer/claim-pi])}
      "Claim Pi"]
     [:span " "]
     [:button.btn.btn-default
      {:on-click #(dispatch [:prosumer/revoke "grandma-app" "x"])}
      "Revoke access for Oma app"]
     [:span " "]
     [:button.btn.btn-default
      {:on-click #(dispatch [:prosumer/revoke "wattapp" "y"])}
      "Revoke access for Wattapp"]]))


(defn smart-authorization-grid []
  [:div.wrapper
   [service-providers]
   [data-provider] [grandma-app-data-flow] [grandma-app]
   [prosumer]      [wattapp-data-flow]     [wattapp]])


(defn main-panel []
  [smart-authorization-grid])
