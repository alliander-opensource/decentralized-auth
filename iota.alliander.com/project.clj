(defproject decentralized-auth "0.1.0-SNAPSHOT"
  :dependencies [[org.clojure/clojure "1.9.0-alpha16"] ; latest version that works with Figwheel
                 [org.clojure/clojurescript "1.9.946"]

                 ;; IOTA interaction
                 [cljs-iota "1.0.1"]
                 [cljs-iota-mam "1.0.8"]

                 ;; HTTP
                 [cljs-ajax "0.7.3"]
                 [org.clojure/core.async "0.4.474"]

                 ;; Logging
                 [com.taoensso/timbre "4.10.0"]

                 ;; Frontend
                 [cljsjs/leaflet "1.2.0-0"]
                 [cljsjs/leaflet-polylinedecorator "1.6.0-0"]
                 [cljsjs/toastr "2.1.2-1"]
                 [hiccups "0.3.0"]
                 [re-frame "0.10.2"]
                 [re-frisk "0.5.3"]
                 [reagent "0.7.0"]]

  :plugins [[lein-auto "0.1.3"]
            [lein-cljsbuild "1.1.7"]
            [lein-shell "0.5.0"]]

  :min-lein-version "2.5.3"

  :source-paths ["src/cljs"]

  :clean-targets ^{:protect false} ["resources/public/js/compiled" "target"
                                    "test/js"]

  :figwheel {:css-dirs ["resources/public/css"]}

  :repl-options {:nrepl-middleware [cemerick.piggieback/wrap-cljs-repl]}

  :profiles
  {:dev
   {:dependencies [[binaryage/devtools "0.9.9"]
                   [figwheel-sidecar "0.5.14"]
                   [com.cemerick/piggieback "0.2.1"]]

    :plugins [[lein-figwheel "0.5.14"]
              [lein-doo "0.1.8"]]}}

  :cljsbuild
  {:builds
   [{:id           "dev"
     :source-paths ["src/cljs"]
     :figwheel     {:on-jsload "decentralized-auth.core/mount-root"}
     :compiler     {:main                 decentralized-auth.core
                    :output-to            "resources/public/js/compiled/app.js"
                    :output-dir           "resources/public/js/compiled/out"
                    :asset-path           "js/compiled/out"
                    :source-map-timestamp true
                    :preloads             [devtools.preload]
                    :external-config      {:devtools/config {:features-to-install :all}}}}

    {:id           "min"
     :source-paths ["src/cljs"]
     :compiler     {:main            decentralized-auth.core
                    :output-to       "resources/public/js/compiled/app.js"
                    :asset-path      "js/compiled/out"
                    :optimizations   :advanced
                    :closure-defines {goog.DEBUG false}
                    :pretty-print    false}}

    {:id           "test"
     :source-paths ["src/cljs" "test/cljs"]
     :compiler     {:main          decentralized-auth.runner
                    :output-to     "resources/public/js/compiled/test.js"
                    :output-dir    "resources/public/js/compiled/test/out"
                    :optimizations :none}}]})
