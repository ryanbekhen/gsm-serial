import { GSMSerial } from '../src/gsm-serial';

describe('GSM Serial Module', () => {
  let gsm: GSMSerial;

  beforeAll(async () => {
    gsm = new GSMSerial(
      "/dev/ttyXRUSB13",
      {
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      }
    );

    await gsm.initialize();
  });

  it('device information', () => {
    return gsm.deviceInfo().then((data) => {
      expect(data).toHaveProperty('manufacture');
      expect(data).toHaveProperty('model');
      expect(data).toHaveProperty('revision');
    });
  });

  it('sent message', () => {
    return expect(gsm.sendMessage('+6282395984045', 'gsm serial testing sent message.')).resolves.toBeUndefined();
  });

  it('read messsages', () => {
    return expect(gsm.getAllMessages()).resolves.toBeInstanceOf(Array);
  });

  it('delete all messages', () => {
    return expect(gsm.deleteAllMessages()).resolves.toBeUndefined();
  });

  afterAll( async () => {
    await gsm.close();
  });
});