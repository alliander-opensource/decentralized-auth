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