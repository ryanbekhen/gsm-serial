export const CUSDToJson = (data: string[]): string[] => {
  const array = data[1].substring(data.indexOf(':')).split(',');
  return array;
};
