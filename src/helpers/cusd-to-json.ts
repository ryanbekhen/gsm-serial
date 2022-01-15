export const CUSDToJson = (data: string[]): string[] => {
  const start = data[1].indexOf(',');
  const end = data[1].lastIndexOf(',');

  const array = [];
  array.push(data[1].slice(0, start));
  array.push(data[1].slice(start + 1, end));
  array.push(data[1].slice(end + 1));
  return array;
};
