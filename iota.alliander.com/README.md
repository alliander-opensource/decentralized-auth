# iota.alliander.com

Interactive website demonstrating the storing consent on IOTA and using IOTA MAM for data transport.

## Development Mode

### Start Cider from Emacs:

Put this in your Emacs config file:

```
(setq cider-cljs-lein-repl "(do (use 'figwheel-sidecar.repl-api) (start-figwheel!) (cljs-repl))")
```

Navigate to a ClojureScript file and start a figwheel REPL with `cider-jack-in-clojurescript` or (`C-c M-J`)

### Run application:

Either start local node

```
java -jar iri-<version>.jar -p 14265
```

or set `IOTA_PROVIDER` environment variable.

```
lein clean
lein figwheel dev
```

Figwheel will automatically push cljs changes to the browser.

Wait a bit, then browse to [http://localhost:3449](http://localhost:3449).

## Usage

The ClojureScript architecture uses [re-frame](https://github.com/Day8/re-frame).

## Production Build

To compile ClojureScript to JavaScript:

```
lein clean
lein cljsbuild once min
```

NOTE: not working at the moment because of extern conflict. Use `lein cljsbuild once dev` to build for production as well.

## Deployment

1. Push code to this repository
2. Press proceed at https://jenkins.appx.cloud/job/alliander/job/decentralized-auth-iota-demo-deploy/job/master/build?delay=0sec


## Licenses

Uses the [cross file svg](https://commons.wikimedia.org/wiki/File:Flat_cross_icon.svg) which is licensed under the Creative Commons Attribution-Share Alike 3.0 Unported license.
