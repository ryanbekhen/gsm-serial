export function timeout<T>(promise: Promise<T>, ms?: number): Promise<T> {
  return Promise.race<T>([
    new Promise<T>((_, reject) => {
      const id = setTimeout(
        () => {
          clearTimeout(id);
          reject(new Error('The operation has timed out.'));
        },
        ms ? ms : 5000,
      );
    }),
    promise,
  ]);
}
