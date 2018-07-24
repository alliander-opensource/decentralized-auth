(ns decentralized-auth.subs
  (:require [re-frame.core :refer [reg-sub]]))


(reg-sub
 :mapbox/access-token
 (fn [{:keys [mapbox/access-token] :as db}]
   access-token))


(reg-sub
 :map/smart-meter-latlngs
 (fn [{:keys [map/smart-meter-latlngs] :as db}]
   smart-meter-latlngs))


(reg-sub
 :map/service-provider-latlngs
 (fn [{:keys [map/service-provider-latlngs] :as db}]
   service-provider-latlngs))
