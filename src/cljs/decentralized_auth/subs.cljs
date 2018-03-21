(ns decentralized-auth.subs
  (:require [re-frame.core :refer [reg-sub]]))


;;;;
;;;; Data provider (Raspberry Pi)

(reg-sub
 :data-provider/root
 (fn [{:keys [data-provider/root] :as db}]
   root))


(reg-sub
 :data-provider/side-key
 (fn [{:keys [data-provider/side-key] :as db}]
   side-key))


(reg-sub
 :data-provider/authorized-service-providers
 (fn [{:keys [data-provider/authorized-service-providers] :as db}]
   authorized-service-providers))


;;;;
;;;; Service Provider: Grandma app

(reg-sub
 :service-provider.grandma-app/root
 (fn [{:keys [service-provider.grandma-app/root] :as db}]
   root))


(reg-sub
 :service-provider.grandma-app/side-key
 (fn [{:keys [service-provider.grandma-app/side-key] :as db}]
   side-key))


(reg-sub
 :service-provider.grandma-app/messages
 (fn [{:keys [service-provider.grandma-app/messages] :as db}]
   messages))


(reg-sub
 :service-provider.grandma-app/latest-msg-timestamp
 (fn [{:keys [service-provider.grandma-app/latest-msg-timestamp] :as db}]
   (when latest-msg-timestamp
     (.toLocaleTimeString latest-msg-timestamp))))


(reg-sub
 :service-provider.grandma-app/authorized?
 (fn [{:keys [service-provider.grandma-app/messages] :as db}]
   (not-empty messages)))


;;;;
;;;; Service Provider: Wattapp

(reg-sub
 :service-provider.wattapp/root
 (fn [{:keys [service-provider.wattapp/root] :as db}]
   root))


(reg-sub
 :service-provider.wattapp/side-key
 (fn [{:keys [service-provider.wattapp/side-key] :as db}]
   side-key))


(reg-sub
 :service-provider.wattapp/messages
 (fn [{:keys [service-provider.wattapp/messages] :as db}]
   messages))


(reg-sub
 :service-provider.wattapp/latest-msg-timestamp
 (fn [{:keys [service-provider.wattapp/latest-msg-timestamp] :as db}]
   (when latest-msg-timestamp
     (.toLocaleTimeString latest-msg-timestamp))))


(reg-sub
 :service-provider.wattapp/authorized?
 (fn [{:keys [service-provider.wattapp/messages] :as db}]
   (not-empty messages)))


;;;;
;;;; Prosumer


(reg-sub
 :prosumer/authorized-service-providers
 (fn [{:keys [prosumer/authorized-service-providers] :as db}]
   authorized-service-providers))
