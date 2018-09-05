(ns decentralized-auth.db)


(def holwerd-service-provider
  {:latlng  #js [53.368346 5.926277]
   :address (str "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNA"
                 "WIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP")
   :name    "Holwerd P1 Data Graphing Service"})


(def iota-providers
  ["https://nod3.theshock.de:443"
   #_"https://potato.iotasalad.org:14265"
   "https://beaker01.tangle-iotanode.eu:14267"
   "https://beaker02.tangle-iotanode.eu:14267"
   "https://beaker03.tangle-iotanode.eu:14267"])


(def default-db
  {:iota/provider       (get iota-providers (rand-int (count iota-providers)))
   :iota/iota-instance  nil
   :mapbox/access-token (str
                         "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmF"
                         "pNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")
   :map/policies #{{:id               0
                    :smart-meter      {:latlng     #js [53.458177 5.655188]
                                       :meter-name "Smart meter 1"
                                       :address    (str "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNA"
                                                        "WIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP")}
                    :service-provider holwerd-service-provider
                    :goal             "graphing energy data"
                    :address          "VSSQCMYLXOGATMLAEH9FRVUZTWQBJQQOYDRNUDLBAWHWKUYQQFHBCQTGVUYLOWIEVWNGJFMYLJUMOCUVZ"
                    :active?          false}
                   {:id               1
                    :smart-meter      {:latlng     #js [53.437087 5.633132]
                                       :meter-name "Smart meter 2"
                                       :address    (str "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNA"
                                                        "WIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP")}
                    :service-provider holwerd-service-provider
                    :goal             "graphing energy data"
                    :address          "VSSQCMYLXOGATMLAEH9FRVUZTWQBJQQOYDRNUDLBAWHWKUYQQFHBCQTGVUYLOWIEVWNGJFMYLJUMOCUVZ"
                    :active?          false}
                   {:id               2
                    :smart-meter      {:latlng     #js [53.445156 5.720864]
                                       :meter-name "Smart meter 3"
                                       :address    (str "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNA"
                                                        "WIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP")}
                    :service-provider holwerd-service-provider
                    :goal             "graphing energy data"
                    :address          "VSSQCMYLXOGATMLAEH9FRVUZTWQBJQQOYDRNUDLBAWHWKUYQQFHBCQTGVUYLOWIEVWNGJFMYLJUMOCUVZ"
                    :active?          false}
                   {:id               3
                    :smart-meter      {:latlng     #js [53.446079 5.831414]
                                       :meter-name "Smart meter 4"
                                       :address    (str "9QDNPW9YGZ9EMTQARJZGOZWEYQZX9NWLBPUNZSR9CNA"
                                                        "WIAABHSJMZLQEDYKQVLQSVIFMSQTBGXOGUBWBP")}
                    :service-provider holwerd-service-provider
                    :goal             "graphing energy data"
                    :address          "VSSQCMYLXOGATMLAEH9FRVUZTWQBJQQOYDRNUDLBAWHWKUYQQFHBCQTGVUYLOWIEVWNGJFMYLJUMOCUVZ"
                    :active?          false}}})
