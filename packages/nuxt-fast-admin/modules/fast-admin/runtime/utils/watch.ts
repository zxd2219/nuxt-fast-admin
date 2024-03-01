export function until(condition: () => boolean, timeout = 100) {
  return new Promise<void>((resolve) => {
    const handler = () => {
      if (condition()) {
        resolve();
        return;
      }
      setTimeout(handler, timeout);
    };
    handler();
  });
}
