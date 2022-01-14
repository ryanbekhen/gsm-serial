import { GSMSerial } from '../src/gsm-serial';

describe('GSM Serial Module', () => {
  let gsm: GSMSerial;

  beforeAll(async () => {
    gsm = new GSMSerial(
      "/dev/ttyXRUSB14",
      {
        baudRate: 115200,
        interval: 100,
        timeout: 5000
      }
    );

    await gsm.initialize();
  });

  it('device information', () => {
    return gsm.deviceInfo().then((data) => {
      expect(data).toHaveProperty('manufacture');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('revision');
      expect(data).toHaveProperty('imsi');
    });
  });

  it('read messsages', () => {
    return gsm.getAllMessages().then((data) => {
      expect(data).toBeInstanceOf(Array)
    });
  });

  it('sent message', () => {
    return expect(gsm.sendMessage('+6282395984045', 'gsm serial testing sent message.')).resolves.toBeUndefined()
  });

  it('read ussd', () => {
    return gsm.getUSSD('*888#').then(data => {
      expect(data).toHaveProperty('message');
    })
  }, 10000)

  it('delete all messages', () => {
    return expect(gsm.deleteAllMessages()).resolves.toBeUndefined();
  });

  afterAll( async () => {
    await gsm.close();
  });
});