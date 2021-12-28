import { GSMSerial } from "../src/gsm-serial";

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