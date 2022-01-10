import * as SerialPort from 'serialport';
import { CMGLToJson, CUSDToJson } from './common/helpers';
import { IMessage, IGSMSerialOptions, IGetAllMessageOptions, IDeviceInfo, IUSSDMessage } from './common/interfaces';
import { timeout, sessionID} from './common/utils';

/**
 * Simple library which allows to use GSM Modem using NodeJS via serial port.
 * @public
 */

export class GSMSerial {
  private serialPort: SerialPort;
  private options: IGSMSerialOptions;
  private lastSession: string = sessionID();
  public device: string;

  /**
   * Instance of GSMSerial
   * @param device - path string of device
   * @param options - GSM Serial configuration options
   */
  constructor(device: string, options: IGSMSerialOptions) {
    this.device = device;
    this.options = Object.assign(
      {},
      {
        autoOpen: true,
        lock: true,
      },
      options,
    );
    this.serialPort = new SerialPort(device, this.options);
  }

  /**
   * Get available paths for serial port
   * @returns array string
   */
  static ports(): Promise<string[]> {
    return new Promise((resolve) => {
      SerialPort.list().then((data) => {
        const ports = data.filter((port) => port.manufacturer && port.productId && port.vendorId && port.path);
        resolve(ports.map(({ path }) => path));
      });
    });
  }

  /**
   * GSM Serial Initialization
   * @returns promise void
   */
  initialize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.serialPort.on('open', async () => {
        const initcommand = ['ATZ', 'AT+CMEE=1', 'AT+CREG=2', 'AT+CMGF=1'];
        await this.ATCommand(initcommand.join('\r\n'));
        resolve();
      });
      this.serialPort.on('error', reject);
    });
  }

  /**
   * Close connection to GSM devices
   * @returns promise void
   */
  close(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.serialPort.close((err) => (err ? reject(err) : resolve()));
    });
  }

  /**
   * Check device response
   * @returns returns true if it can respond
   */
  check(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.ATCommand('AT')
        .then((response) => resolve(response[response.length - 1] === 'AT' ? false : true))
        .catch(reject);
    });
  }

  /**
   * Get GSM Device detail information
   * @returns device info object
   */
  deviceInfo(): Promise<IDeviceInfo> {
    return new Promise<IDeviceInfo>(async (resolve, reject) => {
      const command = ['AT+CGMI', 'AT+CGMM', 'AT+CGMR', 'AT+CIMI'];
      const keyInfo = ['manufacture', 'model', 'revision', 'imsi'];
      this.ATCommand(command.join('\r\n'))
        .then((ports) => ports.filter((port) => !command.concat(['OK']).includes(port.trim())))
        .then((ports) => {
          const temp: IDeviceInfo = {};
          keyInfo.forEach((key, index) => Object.assign(temp, { [key]: ports[index].trim() }));
          resolve(temp);
        })
        .catch(reject);
    });
  }

  /**
   * Send SMS
   * @param phone - phone number
   * @param message - message
   * @returns promise void
   */
  sendMessage(phone: string, message: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ATCommand('AT+CSCS="IRA"', 'OK');
        await this.ATCommand(`AT+CMGS="${phone}"\r\n\r\n ${message}\r\n\x1A`);
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  /**
   * Get Unstructured Supplementary Service Data (USSD)
   * @param code - ussd code or reply messages
   * @returns message from service operator with ussd session to reply to operator message
   */
  getUSSD(code: string, session?: string): Promise<IUSSDMessage> {
    return new Promise<IUSSDMessage>(async (resolve, reject) => {
      try {
        if (session && session !== this.lastSession || !session) {
          await this.ATCommand('AT+CUSD=2', 'OK');
        }

        await this.ATCommand(`AT+CSCS="GSM"`, 'OK');
        const response = await this.ATCommand(`AT+CUSD=1,\"${code}\",15`, 'OK');
        const message = CUSDToJson(response)[1];

        const isCanReply = CUSDToJson(response)[2] === '0' ? true : false;


        console.log(response)
        if (isCanReply) {
          this.lastSession = sessionID();
          resolve({
            message,
            session: this.lastSession,
          });
        } else {
          resolve({ message })
        }
      } catch (ex) {
        reject(ex);
      }
    });
  }

  /**
   * Delete messages without deleting unread messages
   * @returns promise void
   */
  deleteAllMessages(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ATCommand('AT+CMGD=1,2', 'OK')
        .then(() => resolve())
        .catch(reject);
    });
  }

  /**
   * Get all messages by option
   * @param options option for message retrieval on SIM Card
   * @returns string array of all messages
   */
  getAllMessages(options?: IGetAllMessageOptions): Promise<IMessage[]> {
    return new Promise<IMessage[]>(async (resolve, reject) => {
      try {
        const status = options?.unreadOnly ? 'REC UNREAD' : 'ALL';
        await this.ATCommand('AT+CSCS="HEX"', 'OK');
        const data = await this.ATCommand('AT+CMGL="' + status + '"', 'OK');
        resolve(CMGLToJson(data));
      } catch (ex) {
        reject(ex);
      }
    });
  }

  private ATCommand(command: string, readUntil?: string): Promise<string[]> {
    const response = new Promise<string[]>((resolve, reject) => {
      let time: [number, number];

      const result: any[] = [];
      const reader = new SerialPort.parsers.Readline({ delimiter: '\r\n' });

      reader.on('data', (chunk) => {
        time = process.hrtime();

        if (chunk.trim().match('ERROR')) {
          reject(new Error('Something wrong with result ' + chunk.trim()));
        }

        result.push(chunk);

        if (readUntil && chunk.trim() === readUntil) {
          this.serialPort.unpipe();
          resolve(result);
        }
      });

      this.serialPort.pipe(reader);
      this.serialPort.write(`${command}\r\n`, (err) => {
        if (err) return reject(err);

        this.serialPort.drain((_) => {
          if (!readUntil) {
            const ms = this.options.interval ? this.options.interval : 1000;
            const interval = setInterval(() => {
              if (!time) return;
              const diff = process.hrtime(time);
              const diffMs = diff[0] * 1000 + Math.round(diff[1] / 1000000);

              if (diffMs > ms) {
                clearInterval(interval);
                this.serialPort.unpipe();
                resolve(result);
              }
            }, ms);
          }
        });
      });
    });
    return timeout(response, this.options.timeout);
  }
}
