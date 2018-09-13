(ns decentralized-auth.subs
  (:require [re-frame.core :refer [reg-sub]]))


(reg-sub
 :mapbox/access-token
 (fn [{:keys [mapbox/access-token] :as db}]
   access-token))


(reg-sub
 :map/policies
 (fn [{:keys [map/policies] :as db}]
   policies))


(reg-sub
 :map/service-provider
 (fn [{:keys [service-provider] :as db}]
   service-provider))


(reg-sub
 :map/smart-meters
 (fn [{:keys [smart-meters] :as db}]
   smart-meters))
