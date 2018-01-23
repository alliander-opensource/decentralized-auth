(ns decentralized-auth.db)


(def default-db
  {;; Application state obtained from the blockchain
   :blockchain/apps           {}
   :blockchain/authorizations {}
   :blockchain/devices        {}

   :db/iota-instance  nil})
