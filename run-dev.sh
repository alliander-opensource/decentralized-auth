#!/bin/bash

```
export IOTA_PROVIDER=http://node01.testnet.iotatoken.nl:16265
export MIN_WEIGHT_MAGNITUDE=10
export P1_SERIAL_PORT=/dev/tty.usbserial-AC2F18XB
```

# Start Service Provider wattt.nl backend (which serves the frontend as well)
```
(cd service-provider/backend && npm start &)
```

# Start My Home consent management backend (which serves the frontend as well)

```
(cd my-home/backend && npm start &)
```

# Start the Raspberry Pi client locally with a fresh seed

```
(cd raspberry-pi-client && SEED=$(cat /dev/urandom | LC_ALL=C tr -dc 'A-Z9' | fold -w 81 | head -n 1) npm start &)
