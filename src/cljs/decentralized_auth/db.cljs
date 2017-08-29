(ns decentralized-auth.db)

(def default-db
  {;; Application state obtained from the blockchain
   :blockchain/authorizations {}

   ;; The maximum number of computational steps the transaction execution is
   ;; allowed to take
   :blockchain/max-gas-limit  4000000

   ;; Add the address of the existing smart contract on the Ropsten test
   :contracts/contracts {:smart-energy-authorizations
                         {:address "0xde34e63b35c17f54e22253b90ec2b97baf221271"}}

   ;; Web3 instance and active account for blockchain interactions via the
   ;; browser
   :db/provides-web3? false
   :db/web3-instance  nil
   :db/active-address nil})
