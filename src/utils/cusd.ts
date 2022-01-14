import { ucs2 } from 'node:punycode';

export function toUCS2(code: string) {
  function toPaddedHexString(num: number, len: number) {
    const str = num.toString(16).toUpperCase();
    return '0'.repeat(len - str.length) + str;
  }
  const hexers = ucs2.decode(code);
  let ucs2str = '';
  hexers.forEach((i) => {
    ucs2str += toPaddedHexString(i, 4);
  });
  return ucs2str;
}

export function fromUCS2(code: string) {
  const txtCodes = code.match(/.{1,4}/g);
  const codes: number[] = [];
  if (txtCodes)
    txtCodes.forEach((i) => {
      codes.push(parseInt(i, 16));
    });
  return ucs2.encode(codes);
}
