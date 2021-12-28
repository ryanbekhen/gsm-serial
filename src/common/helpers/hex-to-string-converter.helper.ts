export const HexToStringConverter = (hex: string) => {
  return Buffer.from(hex, 'hex').toString('utf-8').replace(/\n\r/gi, '');
}