(ns decentralized-auth.subs
  (:require-macros [reagent.ratom :refer [reaction]])
  (:require [re-frame.core :as re-frame]))


(re-frame/reg-sub
 :view/authorizations
 (fn [db]
   (:view/authorizations db)))


(re-frame/reg-sub
 :data-provider/root
 (fn [db]
   (:data-provider/root db)))


(re-frame/reg-sub
 :data-provider/side-key
 (fn [db]
   (:data-provider/side-key db)))
