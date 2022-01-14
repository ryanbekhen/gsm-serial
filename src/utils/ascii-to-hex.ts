export const AsciiToHex = (ascii: string) => {
  const arr: string[] = [];
  for (let n = 0, l = ascii.length; n < l; n++) {
    const hex = Number(ascii.charCodeAt(n)).toString(16);
    arr.push(hex);
  }
  return arr.join('');
};
