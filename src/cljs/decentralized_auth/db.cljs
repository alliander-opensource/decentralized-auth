(ns decentralized-auth.db)


(def default-db
  {:directory/service-providers {}
   :directory/data-providers    {}

   :iota/provider      "https://testnet140.tangle.works"
   :iota/iota-instance nil
   :iota.mam/mam-state nil

   :data-provider/default-side-key "SECRET"
   :data-provider/side-key         ""
   :data-provider/root             ""

   :service-provider/messages             []
   :service-provider/latest-msg-timestamp nil
   :service-provider/side-key             ""
   :service-provider/root                 ""})
