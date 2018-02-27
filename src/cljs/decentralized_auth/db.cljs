(ns decentralized-auth.db
  (:require [cljs-iota.core :as iota]))


(def default-db
  {;; Application state obtained from the blockchain
   :view/service-providers {}
   :view/data-providers    {}

   :db/iota-instance nil
   :db/iota-mam      nil})
