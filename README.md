# GSM SERIAL

Simple library which allows to use GSM Modem using NodeJS via serial port.

## Features

* Read all messages
* Read all unread messages
* Send message
* Delete all messages

## Installing

```shell script#
yarn add @ryanbekhen/gsm-serial # yarn package manager

npm i @ryanbekhen/gsm-serial # npm package manager
```

## Example Code

```typescript
import { GSMSerial } from "@ryanbekhen/gsm-serial";

async function bootstrap() {
  const gsm: GSMSerial = new GSMSerial(
    "/dev/ttyXRUSB14",
    {
      baudRate: 115200,
      dataBits: 8,
      stopBits: 1,
      parity: "none",
    }
  );
  try {
    await gsm.initialize();
    console.log(await gsm.deviceInfo());
    console.log(await gsm.getAllMessages({
      unreadOnly: true
    }));
    await gsm.close();
  } catch(ex) {
    console.log(ex);
  }
}

bootstrap();
```

## Contributing

Questions, comments, bug reports, and pull requests are all welcome.