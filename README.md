# Energy usage data streams with consent of device owner


## Advantages of using IOTA energy data streams

### Device and My Home are in sync since they use the same backend (the MAM stream)
Because of distributed ledger technology.

### Relatively simple to access data for a service provider
Only need to MAM root and side key (and a decrypting backend). No need for complicated backends that fetch data.

### Relatively simple to access data for a data provider
Only need MAM library and address of an IOTA node.

### Multiplexing
Once the data is published on a MAM address multiple authorized listeners can fetch the data.

## Disadvantages of using IOTA for GDPR proof energy data streams

### Proof of Work
Older Dutch smart meters (DSRM 2.0, 2.2 and 4.0) send one message every 10 seconds. Newer models (DSRM 5.0) every second.

It is not possible to send a P1 energy data message every 10 seconds, let alone every second with MAM using a standard node. The Proof of Work for attaching MAM message takes on average 20 seconds on mainnet.

### Right to be forgotten
Data is immutable and will always be available in the Tangle. The service provider has to be trusted that the root and side key will be removed. This is similar as in the case of a non immutable ledger situations, where the service provider has to be trusted that the data is removed. In this case the service provider needs to be trusted to have removed the data and the side keys.

There is a risk that the encryption (although we use the quantum proof NTRU) will be broken in the future. This means data in an encrypted cloud is no longer unreadable. Because of snapshots that remove the data (zero value transactions) automatically a permanode is necessary for being able to decrypt older data.

## Known Issues

### State of app
Only the happy flow works at the moment. Edge cases and error handling still need to be implemented.

###  NTRU backend keeps session via URL, this can be sniffed
Which means an attacker can use the backend to decrypt the MAM data.

### DDOS attacks
Addresses are public. So service providers and Raspberry Pi Energy Data Readers can easily be DDOSed.

### IOTA timestamps cannot be trusted
Since timestamps are not verifiable a dishonest node can fake them. The getLastMessage implementation tries to retrieve the last message. In theory a device can for example be spammed with messages in the past. A device cannot be claimed by an attacker because he or she has to intercept the SIGNED_CHALLENGE and replay it quicker than the original message arrives.
