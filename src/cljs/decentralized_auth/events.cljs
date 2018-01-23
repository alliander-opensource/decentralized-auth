(ns decentralized-auth.events
  (:require-macros [taoensso.timbre :as log])
  (:require [cljs-web3.core :as web3]
            [cljs-web3.eth :as web3-eth]
            [cljs.spec.alpha]
            [decentralized-auth.blockchain :as blockchain]
            [decentralized-auth.db :as db]
            [madvas.re-frame.web3-fx :as web3-fx]
            [re-frame.core :as re-frame]
            [taoensso.timbre :as log]))


;;;; Initialize database event handlers

(re-frame/reg-event-db
 :db/initialize-db
 (fn [_ _]
   db/default-db))
