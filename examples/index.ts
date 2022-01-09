import { GSMSerial } from "../src";

async function bootstrap() {
  const gsm: GSMSerial = new GSMSerial(
    "/dev/ttyXRUSB15",
    {
      baudRate: 115200,
      timeout: 10000,
      interval: 100,
    }
  );
  try {
    await gsm.initialize();
    if(await gsm.check()) {
      console.log(await GSMSerial.ports());
      console.log(await gsm.deviceInfo());
      console.log(await gsm.getAllMessages({
        unreadOnly: false
      }));
      console.log((await gsm.getUSSD('*888*7#')));
    } else {
      console.log('device is inactive');
    }
    await gsm.close();
  } catch (ex) {
    console.log('test', ex);
  } finally {
    process.exit(1);
  }
}

bootstrap();