(ns decentralized-auth.db)


(def default-db
  {:directory/service-providers {}
   :directory/data-providers    {}

   :iota/provider      "https://testnet140.tangle.works"
   :iota/iota-instance nil
   :iota.mam/mam-state nil

   :data-provider/default-side-key             "SECRET"
   :data-provider/side-key                     ""
   :data-provider/root                         ""
   :data-provider/authorized-service-providers #{}

   :service-provider.grandma-app/messages             []
   :service-provider.grandma-app/latest-msg-timestamp nil
   :service-provider.grandma-app/side-key             ""
   :service-provider.grandma-app/root                 ""

   :service-provider.wattapp/messages             []
   :service-provider.wattapp/latest-msg-timestamp nil
   :service-provider.wattapp/side-key             ""
   :service-provider.wattapp/root                 ""})
