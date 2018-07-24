(ns decentralized-auth.db)

(def default-db
  {:iota/provider       "http://node02.iotatoken.nl:14265"
   :iota/iota-instance  nil
   :mapbox/access-token (str
                         "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmF"
                         "pNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")

   :map/smart-meter-latlngs      [#js [53.458177 5.655188]
                                  #js [53.437087 5.633132]
                                  #js [53.441155 5.664031]
                                  #js [53.447545 5.669134]
                                  #js [53.445156 5.720864]
                                  #js [53.446079 5.831414]]
   :map/service-provider-latlngs [#js [53.452177 5.699188]
                                  #js [53.442504 5.774766]
                                  #js [53.445380 5.776408]
                                  #js [53.458258 5.902841]]
   ;; :iota.mam/mam-state nil
   })
