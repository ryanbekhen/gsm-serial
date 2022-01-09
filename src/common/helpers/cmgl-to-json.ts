import { IMessage } from '../interfaces';
import { HexToAscii } from '../utils';

export const CMGLToJson = (data: string[]): IMessage[] => {
  const temp = data.slice(1, data.length - 1);
  const result = [];
  for (let i = 0; i < temp.length; i++) {
    const str = temp[i];
    if (str.search(/\+CMGL/gi) >= 0 && !str.match(/AT\+CMGL/gi)) {
      const cmgl: string[] = [];
      str.split(',').forEach((val) => {
        cmgl.push(val.replace(/\+CMGL: /gi, '').replace(/\"/g, ''));
      });
      result.push({
        id: cmgl[0],
        stat: cmgl[1],
        oa: HexToAscii(cmgl[2]),
        alpha: cmgl[3],
        scts: cmgl[4],
        data: HexToAscii(temp[i + 1]),
      });
    } else {
      continue;
    }
  }
  return result;
};
