# decentralized-auth

A prototype to test the authorization and access to energy data flow using IOTA.

The ClojureScript architecture uses [re-frame](https://github.com/Day8/re-frame).


## Development Mode

### Start Cider from Emacs:

Put this in your Emacs config file:

```
(setq cider-cljs-lein-repl "(do (use 'figwheel-sidecar.repl-api) (start-figwheel!) (cljs-repl))")
```

Navigate to a ClojureScript file and start a figwheel REPL with `cider-jack-in-clojurescript` or (`C-c M-J`)

### Run application:

```
java -jar iri-<version>.jar -p 14265 # start local node
lein clean
lein figwheel dev
```

Figwheel will automatically push cljs changes to the browser.

Wait a bit, then browse to [http://localhost:3449](http://localhost:3449).

## Usage

To interact with the smart contract, three IOTA addresses are necessary:

- Data Provider
- Prosumer
- Service Provider

The Data Provider can be claimed with the address of the Prosumer, then the Prosumer can authorize the Service provider to access the Data Provider.

## Production Build

To compile ClojureScript to JavaScript:

```
lein clean
lein cljsbuild once min
```
