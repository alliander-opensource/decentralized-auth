# Advantages and Disadvantages of using IOTA for GDPR proof energy data streams

## Advantages

### Device and IOTA UI (My Home) are in sync since they use the same backend
Because the energy reader device software, the IOTA UI for managing consent, and the service providers can view the same MAM channel, they have the same view of the world. This means that when the IOTA UI revokes an authorization this is irrefutably recorded in the distributed ledger - all players are aware of the revoked consent.

### Relatively simple to access data for a service provider
Only need to MAM root and side key (and a decrypting backend). No need for complicated backends that fetch data.

### Relatively simple to send data for a data provider
Only need MAM library, the raspberry-pi-client software installed, and an address of an IOTA node.

### Multiplexing
Once the data is published on an MAM address multiple authorized listeners can fetch the data.

## Disadvantages

### Proof of Work
Older Dutch smart meters (DSRM 2.0, 2.2 and 4.0) send one message every 10 seconds. Newer models (DSRM 5.0) every second.

It is not possible to send a P1 energy data message every 10 seconds, let alone every second with MAM using a standard node. The Proof of Work for attaching MAM message takes on average 20 seconds on mainnet.

### Right to be forgotten
Data is immutable and will always be available in the Tangle. The service provider has to be trusted that the root and side key will be removed. This is similar as in the case of a non immutable ledger situations, where the service provider has to be trusted that the data is removed. In this case the service provider needs to be trusted to have removed the data and the side keys.

There is a risk that the encryption (although we use the quantum proof NTRU) will be broken in the future. This means data in an encrypted cloud is no longer unreadable. Because of snapshots that remove the data (zero value transactions) automatically a permanode is necessary for being able to decrypt older data.

### Metadata published on the Tangle

`AUTHORIZED`, `AUTHORIZATION_REVOKED`, `DEVICE_ADDED` and `DEVICE_DELETED` events are published on a private MAM channel. This information will always be available for those that have the root. Arguably this data is personally identifiable (e.g., adding multiple service providers and devices, or observing someone when actions are taken, can create a profile of a user) and thus must adhere to the GDPR.
