export async function timeout<T>(promise: Promise<T>, ms?: number): Promise<T> {
  let timer: any = null;
  return await Promise.race<T>([
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error('The operation has timed out.'));
      }, ms ? ms : 5000);
      return timer;
    }),
    promise.then((value) => {
      clearTimeout(timer);
      return value;
    }),
  ]);
}