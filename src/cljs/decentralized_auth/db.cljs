(ns decentralized-auth.db)


(def default-db
  {;; Application state obtained from the blockchain
   :blockchain/apps           {}
   :blockchain/authorizations {}
   :blockchain/devices        {}

   ;; The maximum number of computational steps the transaction execution is
   ;; allowed to take
   :blockchain/max-gas-limit 40000

   ;; Add the address of the existing smart contract on the Ropsten test
   :contracts/contracts {:smart-energy-authorizations
                         {:address "0x6abe54fcddfc7b39728808e7092379892d30ef65"}}

   ;; Web3 instance and active account for blockchain interactions via the
   ;; browser
   :db/provides-web3? false
   :db/web3-instance  nil
   :db/active-address nil})
