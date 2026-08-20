export function logInfo(title, data = "") {
  console.log(
    `\n🟢 ${title}`,
    data
  );
}

export function logWarning(title, data = "") {
  console.warn(
    `\n🟡 ${title}`,
    data
  );
}

export function logError(title, error) {
  console.error(
    `\n🔴 ${title}`,
    error
  );
}