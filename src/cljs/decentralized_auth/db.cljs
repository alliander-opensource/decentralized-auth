(ns decentralized-auth.db
  (:require [cljs-iota.core :as iota]))


(def default-db
  {;; Application state obtained from the blockchain
   :blockchain/service-providers {}
   :blockchain/authorizations    {}
   :blockchain/data-providers    {}

   :db/iota-instance nil
   :db/iota-mam      nil})
