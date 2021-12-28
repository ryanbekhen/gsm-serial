import { ICMGLResponse } from "../interfaces";
import { HexToStringConverter } from "./";

export const CMGLFormat = (data: string[]) => {
  let temp = data.slice(1, data.length - 1);
  let result = [];
  for (let i = 0; i < temp.length; i++) {
    const str = temp[i];
    if (str.search(/\+CMGL/gi) >= 0) {
      const cmgl: string[] = [];
      str.split(',').forEach((val) => {
        cmgl.push(val.replace(/\+CMGL: /gi, '').replace(/\"/g, ''));
      })
      result.push(<ICMGLResponse>{
        id: parseInt(cmgl[0]),
        stat: cmgl[1],
        oa: HexToStringConverter(cmgl[2]),
        alpha: cmgl[3],
        scts: cmgl[4],
        data: HexToStringConverter(temp[i + 1]),
      });
    } else {
      continue;
    }
  }
  return result;
};