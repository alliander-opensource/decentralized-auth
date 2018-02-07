(ns decentralized-auth.db
  (:require [cljs-iota.core :as iota]))


(def default-db
  {;; Application state obtained from the blockchain
   :blockchain/service-providers {}
   :blockchain/authorizations    {}
   :blockchain/data-providers    {}

   :db/iota-instance (iota/create-iota "http://localhost:14265")})
