# Energy usage data streams with consent of device owner


## Known Issues

### State of app
Only the happy flow works at the moment. Edge cases and error handling still need to be implemented.

###  NTRU backend keeps session via URL, this can be sniffed
Which means an attacker can use the backend to decrypt the MAM data.

### DDOS attacks
Addresses are public. So service providers and Raspberry Pi Energy Data Readers can easily be DDOSed.

### IOTA timestamps cannot be trusted
Since timestamps are not verifiable a dishonest node can fake them. The getLastMessage implementation tries to retrieve the last message. In theory a device can for example be spammed with messages in the past. A device cannot be claimed by an attacker because he or she has to intercept the SIGNED_CHALLENGE and replay it quicker than the original message arrives.
