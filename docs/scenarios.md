# Scenarios

This document describes the various scenarios.

## Claiming ownership of a device

![sequence diagram pairing](assets/sequence-diagram-pairing.png)

## Authorizing a Service Provider

![sequence diagram give consent](assets/sequence-diagram-give-consent.png)

## Revoking access for a Service Provider

![sequence diagram give consent](assets/sequence-diagram-revoke-consent.png)

## Deleting a device

When a device (raspberry-pi-client) is deleted a message with type `DEVICE_DELETED` is published on the MAM channel of My Home. This way My Home knows to no longer display the device, and the raspberry-pi-client knows that it should revoke all current authorizations.

