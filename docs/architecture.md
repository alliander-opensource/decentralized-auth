# Architecture

## Component diagram

![component diagram](assets/component-diagram.png)

The Raspberry Pi publishes P1 data to a restricted MAM channel. My Home can pair with a device using a shared secret (described later). 

Once the Pi is paired it starts listening to My Home's private MAM channel. When a user uses a service provider (e.g., an app) that wants to access data, it redirects to My Home to request consent. When consent is given an `AUTHORIZED` message is published on My Home's private MAM channel (containing the public key and IOTA address of the service provider). This is a trigger for the Raspberry Pi to send an IOTA transaction containing the root and side key to this service provider, encrypted with the service provider's public key so it cannot be read by others. The service provider can then decrypt the root and side key and fetch the messages from the Raspberry Pi's restricted MAM channel. 

If the user decides on My Home to revoke the consent policy an `AUTHORIZATION_REVOKED` message is published. This is the trigger for the Raspberry Pi to attach a `KEY_ROTATION` message on its restricted MAM channel. This contains the new key, encrypted with the public key of all service providers who are still authorized. So that those who are still authorized can switch the side key and keep on listening, and others have their consent revoked.

For more information on NTRU key pairs, MAM channels, and Event Stores see [technologies used](technologies.md).

## Sequence Diagram

The full sequence diagram.

![sequence diagram](assets/sequence-diagram.png)

For descriptions of every subheader see [scenarios](scenarios.md).
