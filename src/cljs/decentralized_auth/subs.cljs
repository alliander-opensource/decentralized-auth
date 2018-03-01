(ns decentralized-auth.subs
  (:require-macros [reagent.ratom :refer [reaction]]
                   [taoensso.timbre :as log])
  (:require [re-frame.core :as re-frame]))


(re-frame/reg-sub
 :view/authorizations
 (fn [db]
   (:view/authorizations db)))


(re-frame/reg-sub
 :iota.mam/root
 (fn [{{{:keys [next-root]} :channel} :iota.mam/iota-mam :as db}]
   next-root))


(re-frame/reg-sub
 :data-provider/root
 (fn [{:keys [data-provider/root] :as db}]
   root))


(re-frame/reg-sub
 :data-provider/side-key
 (fn [{:keys [data-provider/side-key] :as db}]
   side-key))


(re-frame/reg-sub
 :service-provider/message
 (fn [{:keys [service-provider/message] :as db}]
   message))
