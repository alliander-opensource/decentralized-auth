(ns decentralized-auth.subs
  (:require [re-frame.core :refer [reg-sub]]))


(reg-sub
 :mapbox/access-token
 (fn [{:keys [mapbox/access-token] :as db}]
   access-token))


(reg-sub
 :map/policy-latlngs
 (fn [{:keys [map/policy-latlngs] :as db}]
   policy-latlngs))
