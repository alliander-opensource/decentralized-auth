(ns decentralized-auth.subs
  (:require [re-frame.core :refer [reg-sub]]))


(reg-sub
 :mapbox/access-token
 (fn [{:keys [mapbox/access-token] :as db}]
   (println access-token)
   (println (type access-token))
   access-token))
