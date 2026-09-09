export function validateMessage(message) {
  if (!message || !message.trim()) {
    throw new Error(
      "Message cannot be empty."
    );
  }

  return true;
}