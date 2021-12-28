export interface IGSMSerialOptions {
  baudRate?: 115200|57600|38400|19200|9600|4800|2400|1800|1200|600|300|200|150|134|110|75|50|number|undefined;
  dataBits?: 8|7|6|5 | undefined; 
  parity?: 'none'|'even'|'mark'|'odd'|'space'|undefined;  
  stopBits?: 1|2 | undefined;
  xon?: boolean | undefined;
  xoff?: boolean | undefined;
  rtscts?: boolean | undefined;
  xany?: boolean | undefined;
}