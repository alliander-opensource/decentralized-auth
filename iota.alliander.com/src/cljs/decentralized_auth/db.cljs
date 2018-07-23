(ns decentralized-auth.db
  (:require [goog.string :as string]))

(def default-db
  {:iota/provider      "http://node02.iotatoken.nl:14265"
   :iota/iota-instance nil
   :mapbox/access-token (string/buildString
                         "pk.eyJ1IjoiZXJ3aW5hbGxpYW5kZXIiLCJhIjoiY2pqaWRwdmF"
                         "pNWNmcjNyczJ0aDJpZzE0byJ9.AIp1C3D3wCjbPvfpOShydg")
   ;; :iota.mam/mam-state nil
})
