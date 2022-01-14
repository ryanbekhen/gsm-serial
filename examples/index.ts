import { GSMSerial } from "../src";

async function bootstrap() {
  const gsm: GSMSerial = new GSMSerial(
    "/dev/ttyXRUSB22",
    {
      baudRate: 115200,
      timeout: 1000,
      interval: 100,
    }
  );
  
  try {
    await gsm.initialize();
    if(await gsm.check()) {
      // console.log(await GSMSerial.ports());
      // console.log(await gsm.deviceInfo());
      // console.log(await gsm.getAllMessages({
      //   unreadOnly: false
      // }));
      // const response = await gsm.getUSSD('*888#');
      // console.log(response);
      // const response1 = await gsm.getUSSD('*888#');
      // console.log(response1);
      // const response2 = await gsm.getUSSD('7', response1.session);
      // console.log(response2);
    // } else {
    //   console.log('device is inactive');
    }
    await gsm.close();
  } catch (ex: any) {
    console.log('test', ex);
  }
}

bootstrap();