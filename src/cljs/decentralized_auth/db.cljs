(ns decentralized-auth.db)


(def default-db
  {;; Application state obtained from the blockchain
   :blockchain/service-providers {}
   :blockchain/authorizations    {}
   :blockchain/data-providers    {}

   :db/iota-instance  nil})
