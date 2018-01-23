(ns decentralized-auth.db)


(def default-db
  {;; Application state obtained from the blockchain
   :blockchain/service-providers {}
   :blockchain/authorizations    {}
   :blockchain/data-providers    {}

   ;; The maximum number of computational steps the transaction execution is
   ;; allowed to take
   :blockchain/max-gas-limit 400000

   ;; Add the address of the existing smart contract on the Ropsten test
   :contracts/contracts {:smart-energy-authorizations
                         {:address "0x628c6a1d1eb60e838e58c7cc5e32b3659c1c5221"}}

   ;; Web3 instance and active account for blockchain interactions via the
   ;; browser
   :db/provides-web3? false
   :db/web3-instance  nil
   :db/active-address nil})
