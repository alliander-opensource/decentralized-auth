(ns decentralized-auth.db)


(def default-db
  {:iota/provider       "http://node02.iotatoken.nl:14265"
   :iota/iota-instance  nil
   :mapbox/access-token (str
                         "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmF"
                         "pNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")

   :map/policies [[#js [53.458177 5.655188] #js [53.368346 5.926277]
                   {:smart-meter-name "Smart meter 1" :active? false}]
                  [#js [53.437087 5.633132] #js [53.368346 5.926277]
                   {:smart-meter-name "Smart meter 2" :active? false}]
                  [#js [53.445156 5.720864] #js [53.368346 5.926277]
                   {:smart-meter-name "Smart meter 3" :active? false}]
                  [#js [53.446079 5.831414] #js [53.368346 5.926277]
                   {:smart-meter-name "Smart meter 4" :active? false}]]
   ;; :iota.mam/mam-state nil
   })
