type PromiseFn = () => Promise<any>;

export async function promiseSequence(tasks: PromiseFn[]) {
  const results = [];
  for (const task of tasks) {
    const result = await task();
    results.push(result);
  }
  return results;
}
