(ns decentralized-auth.workers
  "Listeners to the Smart Energy Authorizations contract"
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [ajax.core :as ajax]
            [cljs-web3.core :as web3]
            [cljs-web3.eth :as web3-eth]
            [cljs.core.async :as async]
            [re-frame.core :as re-frame]))

(defn worker
  "Calls function f every 3 seconds."
  [f]
  (go-loop []
    (async/<! (async/timeout 3000))
    (f)
    (recur)))


;; Query the chain periodically to update the visible state

(worker (fn [] (re-frame/dispatch [:blockchain/is-authorized?
                                   :smart-energy-authorizations
                                   "0x4053e580c8aA07c3A2eB8F0d41bE1f380d29c374"])))
