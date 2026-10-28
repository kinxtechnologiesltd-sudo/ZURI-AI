import { ENV } from "../config/environment.js";

export const MAX_CHAT_UPLOAD_BYTES = ENV.CHAT_UPLOAD_MAX_BYTES;

const SUPPORTED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function getSupportedChatFileType(file) {
  if (!file?.buffer?.length) {
    return null;
  }

  if (file.buffer.length > MAX_CHAT_UPLOAD_BYTES) {
    const limitMb = Math.ceil(MAX_CHAT_UPLOAD_BYTES / (1024 * 1024));
    const error = new Error(
      `File is larger than the ${limitMb} MB upload limit.`
    );
    error.statusCode = 413;
    throw error;
  }

  const buffer = file.buffer;
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  const isPng =
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";

  if (isJpeg) return "image/jpeg";
  if (isPng) return "image/png";
  if (isWebp) return "image/webp";
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }

  return null;
}

export function getChatFileCategory(file) {
  const detectedType = getSupportedChatFileType(file);

  if (!detectedType) {
    const error = new Error(
      "Unsupported or invalid file. Attach a JPEG, PNG, WebP, or PDF file."
    );
    error.statusCode = 415;
    throw error;
  }

  if (
    detectedType.startsWith("image/") &&
    file.mimetype !== detectedType
  ) {
    const error = new Error(
      "The uploaded file type does not match its contents."
    );
    error.statusCode = 415;
    throw error;
  }

  if (
    detectedType === "application/pdf" &&
    file.mimetype !== "application/pdf"
  ) {
    const error = new Error(
      "The uploaded file type does not match its contents."
    );
    error.statusCode = 415;
    throw error;
  }

  return {
    mimeType: detectedType,
    category: detectedType === "application/pdf" ? "pdf" : "image",
  };
}

export function getImageEditRequest(message = "") {
  const text = String(message).toLowerCase();
  const resize = text.match(
    /\bresize\b[\s\S]{0,50}\b(\d{1,4})\s*(?:x|by)\s*(\d{1,4})\b/
  );

  if (resize) {
    const width = Number(resize[1]);
    const height = Number(resize[2]);

    if (
      width > 0 &&
      height > 0 &&
      width <= 4096 &&
      height <= 4096
    ) {
      return {
        type: "resize",
        width,
        height,
      };
    }

    return { type: "unsupported" };
  }

  if (/\b(?:crop|make|turn)\b[\s\S]{0,40}\b(square|1:1)\b/.test(text)) {
    return { type: "square-crop" };
  }

  if (
    /\b(?:remove|replace|change|blur)\b[\s\S]{0,40}\bbackground\b/.test(text) ||
    /\b(?:retouch|enhance|upscale|restore|rotate|crop|resize|edit|modify|adjust|remove|replace|add)\b/.test(text) ||
    /\b(?:black and white|grayscale|colourize|colorize|style transfer)\b/.test(text)
  ) {
    return { type: "unsupported" };
  }

  return null;
}

export function getChatImageExtension(mimeType) {
  return SUPPORTED_IMAGE_TYPES.get(mimeType) || null;
}
