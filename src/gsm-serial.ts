import * as SerialPort from 'serialport';
import { CMGLFormat } from './common/helpers';
import { ICMGLResponse, IGSMSerialOptions, IGetAllMessageOptions } from './common/interfaces';

export class GSMSerial {
  private serialPort: SerialPort;
  private options: SerialPort.OpenOptions;
  public device: string;

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

  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serialPort.on('open', async () => resolve());
      this.serialPort.on('error', (err) => reject(err));
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.serialPort.close((err) => (err ? reject(err) : resolve()));
    });
  }

  deviceInfo(): Promise<{
    manufacture: string;
    model: string;
    revision: string;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const manufacture = await this.ATCommand('AT+CGMI');
        const model = await this.ATCommand('AT+CGMM');
        const revision = await this.ATCommand('AT+CGMR');
        resolve({
          manufacture: manufacture[1],
          model: model[1],
          revision: revision[1],
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  sendMessage(phone: string, message: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ATCommand(
          `AT+CMEE=1;+CREG=2\r\nAT+CSCS=\"IRA\"\r\nAT+CMGF=1\r\nAT+CMGS="${phone}"\r\n\r\n${message}\r\n\x1A`,
        );
        resolve();
      } catch (ex: any) {
        reject(ex.message);
      }
    });
  }

  deleteAllMessages(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.ATCommand('AT+CMGD=1,2', 'OK');
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  getAllMessages(options?: IGetAllMessageOptions): Promise<ICMGLResponse[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const status = options?.unreadOnly ? 'REC UNREAD' : 'ALL';
        await this.ATCommand('AT+CSCS="HEX"', 'OK');
        resolve(CMGLFormat(await this.ATCommand('AT+CMGL="' + status + '"', 'OK')));
      } catch (ex) {
        reject(ex);
      }
    });
  }

  private ATCommand(command: string, readUntil?: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let time: [number, number];

      const result: any[] = [];
      const reader = new SerialPort.parsers.Readline({ delimiter: '\r\n' });

      let isError: boolean = false;
      let errorMessage: string = '';

      reader.on('data', (chunk) => {
        time = process.hrtime();

        if (chunk.indexOf('ERROR') >= 0) {
          isError = true;
          errorMessage = chunk;
        }

        result.push(chunk);

        if ((readUntil && chunk.trim() === readUntil) || isError) {
          this.serialPort.unpipe();
          if (isError) reject(new Error(errorMessage));
          resolve(result);
        }
      });

      this.serialPort.pipe(reader);
      this.serialPort.write(`${command}\r\n`, (err) => {
        if (err) return reject(err);

        this.serialPort.drain((_) => {
          if (!readUntil) {
            const interval = setInterval(() => {
              if (!time) return;
              const diff = process.hrtime(time);
              const diffMs = diff[0] * 1000 + Math.round(diff[1] / 1000000);

              if (diffMs > 50 || isError) {
                clearInterval(interval);
                this.serialPort.unpipe();
                if (isError) reject(new Error(errorMessage));
                resolve(result);
              }
            }, 50);
          }
        });
      });
    });
  }
}
