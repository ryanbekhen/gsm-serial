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
    if(await gsm.check()) {
      console.log(await GSMSerial.ports());
      console.log(await gsm.deviceInfo());
      console.log(await gsm.getAllMessages({
        unreadOnly: false
      }));
      await gsm.sendMessage('+628xxxxxxxxxx', 'gsm serial testing sent message.')
      const response = await gsm.getUSSD('*888#');
      console.log(response);
      const response1 = await gsm.getUSSD('7', response1.session);
      console.log(response1);
    } else {
      console.log('device is inactive');
    }
    await gsm.close();
  } catch(ex) {
    console.log(ex);
  } finally {
    process.exit(1);
  }
}

bootstrap();
```

## Contributing

Questions, comments, bug reports, and pull requests are all welcome.