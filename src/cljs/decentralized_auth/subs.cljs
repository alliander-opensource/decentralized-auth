(ns decentralized-auth.subs
  (:require-macros [reagent.ratom :refer [reaction]]
                   [taoensso.timbre :as log])
  (:require [clojure.string :as string]
            [re-frame.core :refer [reg-sub]]))


(reg-sub
 :iota.mam/root
 (fn [{{{:keys [next-root]} :channel} :iota.mam/iota-mam :as db}]
   next-root))


(reg-sub
 :data-provider/root
 (fn [{:keys [data-provider/root] :as db}]
   root))


(reg-sub
 :service-provider/root
 (fn [{:keys [service-provider/root] :as db}]
   root))


(reg-sub
 :data-provider/side-key
 (fn [{:keys [data-provider/side-key] :as db}]
   side-key))


(reg-sub
 :service-provider/side-key
 (fn [{:keys [service-provider/side-key] :as db}]
   side-key))


(reg-sub
 :service-provider/messages
 (fn [{:keys [service-provider/messages] :as db}]
   messages))


(reg-sub
 :service-provider/latest-msg-timestamp
 (fn [{:keys [service-provider/latest-msg-timestamp] :as db}]
   (when latest-msg-timestamp
     (.toLocaleTimeString latest-msg-timestamp))))


(reg-sub
 :service-provider/authorized?
 (fn [{:keys [service-provider/messages] :as db}]
   (not-empty messages)))
