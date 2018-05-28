# Technologies used

This document describes the major technologies used in this project.

## IOTA

IOTA provides an open source, quantum proof, feeless and scalable distributed ledger aimed at IOT devices called the IOTA Tangle.

For more information on IOTA, see the [White Paper](https://iotatoken.com/IOTA_Whitepaper.pdf) and the [IOTA Foundation](https://www.iota.org/).

## IOTA MAM

IOTA Masked Authenticated Messaging (MAM) is an IXI (extensible interface) module on top of the IOTA Tangle. MAM provides the ability to publish and fetch encrypted messages over the IOTA Tangle. MAM provides data integrity and access control. There are three types of MAM message streams:

### Public
Someone stumbling upon the MAM stream can view the messages by decrypting it with the address. For public information broadcasted like a radio.

### Private
Messages are not decryptable by the address. Only someone who knows the root can decrypt the messages. For private communication between devices.

### Restricted
Messages are private (a listener must know the root to be able to decrypt it) but also encrypted with a side key. A listener much know the root and side key to be able to decrypt the messages. This can be used to revoke access to a listener.

The JavaScript client can be found at [mam.client.js](https://www.github.com/iotaledger/mam.client.js).
For more information on MAM, see [Introducing Masked Authenticated Messaging](https://blog.iota.org/introducing-masked-authenticated-messaging-e55c1822d50e).

## NTRU

When using restricted or private MAM between two parties first a key exchange needs to take place. The root (in private) and root and side key (restricted) of the MAM channel needs to be communicated. To exchange keys in a quantum proof way we use the quantum proof asymmetric encryption of NTRUEncrypt. The MAM root and side key are encrypted with the public key.

The idea to use NTRUEncrypt for IOTA and generate key pairs from an IOTA seed is based on the [CHIOTA healthcare chat application](https://github.com/Noc2/Chiota/wiki/NTRU-Key-Exchange-for-IOTA]).

NTRU consists of NTRUEncrypt for asymmetric encryption and NTRUSign for digital signatures. This project uses NTRUEncrypt for assymetric encryption. NTRUEncrypt is asymmetric encryption that is assumed to be quantum proof. NTRU stands for Nth Degree Truncated Polynomial Ring. This refers to the underlying calculation that needs to be done for decryption and encryption. This is assumed to be difficult and quantum computing safe. Variants of NTRU exists for which it is proven to be quantum proof (for example [Stehle-Steinfeld](https://www.iacr.org/archive/eurocrypt2011/66320027/66320027.pdf)).

Compared to RSA, NTRU is faster and uses less memory. NTRU keys are longer.

Disadvantage is that roughly 111 characters can be encoded over one IOTA message before the limit is reached that fits in one IOTA message.

For more information about NTRUEncrypt, see: [NTRUEncrypt Wikipedia's page](https://en.wikipedia.org/wiki/NTRUEncrypt). For more information on using NTRU with IOTA see [NTRU Key Exchange for IOTA](https://github.com/Noc2/Chiota/wiki/NTRU-Key-Exchange-for-IOTA).

The library used in this project is [ntrujs](https://github.com/IDWMaster/ntrujs).

## IRMA

IRMA (I Reveal My Attributes) can be used for the identification layer. How can someone proof that he or she lives on a certain address without releaving any other information?

IRMA provides a decentralized solution for this where cryptographically verifiable attributes are stored on the phone.

For more information about IRMA, see: [Privacy by Design Foundation: About IRMA](https://privacybydesign.foundation/irma/)

Sovrin is a similar solution in the same space, see: [sovrin.org](https://sovrin.org).
