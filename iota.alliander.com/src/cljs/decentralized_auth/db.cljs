(ns decentralized-auth.db)


(def default-db
  {:iota/provider       "http://node02.iotatoken.nl:14265"
   :iota/iota-instance  nil
   :mapbox/access-token (str
                         "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmF"
                         "pNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")

   :map/policies #{{:smart-meter      {:latlng     #js [53.458177 5.655188]
                                       :meter-name "Smart meter 1"
                                       :address    (str "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNA"
                                                        "WIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP")}
                    :service-provider {:latlng #js [53.368346 5.926277]}
                    :active?          false}
                   {:smart-meter      {:latlng     #js [53.437087 5.633132]
                                       :meter-name "Smart meter 1"}
                    :service-provider {:latlng #js [53.368346 5.926277]}
                    :active?          false}
                   {:smart-meter      {:latlng     #js [53.445156 5.720864]
                                       :meter-name "Smart meter 1"}
                    :service-provider {:latlng #js [53.368346 5.926277]}
                    :active?          false}
                   {:smart-meter      {:latlng     #js [53.446079 5.831414]
                                       :meter-name "Smart meter 1"}
                    :service-provider {:latlng #js [53.368346 5.926277]}
                    :active?          false}}
   ;; :iota.mam/mam-state nil
   })
