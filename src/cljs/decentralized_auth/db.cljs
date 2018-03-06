(ns decentralized-auth.db
  (:require [cljs-iota.core :as iota]))


(def default-db
  {:directory/service-providers {}
   :directory/data-providers    {}

   :iota/iota-instance nil
   :iota.mam/mam-state nil

   :data-provider/side-key "SECRET"
   :data-provider/root     ""

   :service-provider/messages []})
