export function isImage(mimetype) {
  return mimetype?.startsWith("image/");
}

export function isPdf(mimetype) {
  return mimetype === "application/pdf";
}

export function truncate(text, max = 500) {
  if (!text) return "";

  return text.length > max
    ? text.slice(0, max) + "..."
    : text;
}