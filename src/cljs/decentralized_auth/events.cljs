(ns decentralized-auth.events
  (:require-macros [taoensso.timbre :as log])
  (:require [cljs.spec.alpha]
            [decentralized-auth.blockchain :as blockchain]
            [decentralized-auth.db :as db]
            [re-frame.core :as re-frame]
            [taoensso.timbre :as log]))


;;;; Initialize database event handlers

(re-frame/reg-event-db
 :db/initialize-db
 (fn [_ _]
   db/default-db))
