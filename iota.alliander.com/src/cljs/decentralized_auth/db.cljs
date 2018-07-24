(ns decentralized-auth.db
  (:require [goog.string :as string]))

(def default-db
  {:iota/provider      "http://node02.iotatoken.nl:14265"
   :iota/iota-instance nil
   :mapbox/access-token (string/buildString
                         "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmF"
                         "pNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")

   :smart-meter-lat-lngs      [#js [53.437087 5.633132]
                               #js [53.441155 5.664031]
                               #js [53.447545 5.669134]
                               #js [53.445156 5.720864]
                               #js [53.446079 5.831414]]
   :service-provider-lat-lngs [#js [53.442504 5.774766]
                               #js [53.445380 5.776408]
                               #js [53.458258 5.902841]]
   ;; :iota.mam/mam-state nil
})
