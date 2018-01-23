(ns decentralized-auth.subs
  (:require-macros [reagent.ratom :refer [reaction]])
  (:require [re-frame.core :as re-frame]))


(re-frame/reg-sub
 :blockchain/authorizations
 (fn [db]
   (:blockchain/authorizations db)))
