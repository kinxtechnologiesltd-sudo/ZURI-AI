export function startTimer() {
  return Date.now();
}

export function endTimer(start) {
  return `${Date.now() - start}ms`;
}