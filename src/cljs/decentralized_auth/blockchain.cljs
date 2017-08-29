(ns decentralized-auth.blockchain
  (:require-macros [cljs.core.async.macros :refer [go go-loop]]
                   [re-frame.core :as re-frame])
  (:require [ajax.core :as ajax]
            [camel-snake-kebab.core :refer [->PascalCase]]
            [cljs-web3.core :as web3]
            [cljs-web3.eth :as web3-eth]
            [cljs-web3.personal :as web3-personal]
            [cljs-web3.utils :as web3-utils]
            [cljs.core.async :as async]
            [goog.string :as string]
            [goog.string.format]
            [re-frame.core :as re-frame]))

(def provides-web3?
  (boolean (aget js/window "web3")))

(def web3-instance
  (new (aget js/window "Web3")
       (web3/current-provider (aget js/window "web3"))))

;; (def network-type
;;   (case (web3/version-network web3-instance)
;;     "1" :local-development ; FIXME: same as main-net
;;     "2" :morden-network    ; deprecated
;;     "3" :ropsten-network
;;     :unknown-network))

(defn- fetch-abi
  "Retrieves abi of compiled smart contract"
  [contract-key]
  (let [result-chan (async/chan)
        handler     (fn [[ok abi]]
                      (if ok
                        (go (async/>! result-chan abi)
                            (async/close! result-chan))
                        (println "error fetching" contract-key)))
        request     {:method          :get
                     :uri             (string/format "./contracts/build/%s.abi"
                                                     (->PascalCase (name contract-key)))
                     :timeout         6000
                     :response-format (ajax/json-response-format)
                     :handler         handler}]
    (ajax/ajax-request request)
    result-chan))

(defn add-ropsten-contract
  "Adds the abi and contract belonging to `contract-key` to the db.

  Address should be the address of an existing smart contract on the Ropsten
  test network."
  [web3-instance contract-key address]
  (go (let [abi      (async/<! (fetch-abi contract-key))
            contract (web3-eth/contract-at web3-instance
                                           abi
                                           address)]
        (re-frame/dispatch [:db/add-contract contract-key abi contract]))))

(defn get-active-address [web3-instance]
  (first (web3-eth/accounts web3-instance)))
