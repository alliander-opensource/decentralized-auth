# decentralized-auth

A prototype to test the authorization of energy data flows using Ethereum smart contracts.

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
lein clean
lein figwheel dev
```

Figwheel will automatically push cljs changes to the browser.

Wait a bit, then browse to [http://localhost:3449](http://localhost:3449).

#### Auto-compile solidity Smart Contracts:

```
lein auto compile-contracts
```

#### Git setup
The project uses a GitHub and GitLab remote. Configure this as follows in .git/config:

```
[remote "origin"]
    url = git@gitlab.com:hellodata/decentralized-auth.git
	url = git@github.com:hellodata-org/decentralized-auth.git
	fetch = +refs/heads/*:refs/remotes/origin/*
```

## Usage

The prototype expects a web3.js object provided, for example via by the Chrome extension [MetaMask](https://metamask.io/). And to interact with the smart contract, two accounts are necesary:

- Device
- Consumer

And an App needs an address, but this does not necessarily need to exist.

The Device can be claimed with the address of the Consumer, then the Consumer can authorize the App to access the Device.

## Production Build

To compile ClojureScript to JavaScript:

```
lein clean
lein cljsbuild once min
```
