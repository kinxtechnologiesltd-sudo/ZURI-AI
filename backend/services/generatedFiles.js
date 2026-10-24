import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { Readable } from "node:stream";
import { fileURLToPath } from "url";

import { ENV } from "../config/environment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatedDirectory = path.join(__dirname, "..", "generated");

const downloadRegistry = new Map();
const TTL_MS = 1000 * 60 * 60 * 24;

export function getStorageProvider() {
  const value = String(
    process.env.PDF_STORAGE_PROVIDER || ENV.PDF_STORAGE_PROVIDER || "local"
  ).trim().toLowerCase();

  if (value === "s3" || value === "r2") {
    return "r2";
  }

  if (!value || value === "local") {
    return "local";
  }

  throw new Error('Unsupported PDF_STORAGE_PROVIDER. Use "local" or "r2".');
}

export function getPublicBaseUrl() {
  return String(
    process.env.PUBLIC_BASE_URL || ENV.PUBLIC_BASE_URL || "http://localhost:3001"
  )
    .trim()
    .replace(/\/$/, "");
}

function buildR2Client() {
  const endpoint = process.env.R2_ENDPOINT || ENV.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || ENV.R2_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.R2_SECRET_ACCESS_KEY || ENV.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || ENV.R2_BUCKET_NAME;

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 object storage is enabled but one or more required settings are missing: R2_ENDPOINT, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY."
    );
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    region: process.env.R2_REGION || ENV.R2_REGION || "auto",
    bucket,
  };
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function hmacSha256(key, value) {
  return crypto.createHmac("sha256", key).update(value).digest();
}

function signR2Request({ method, url, body, accessKeyId, secretAccessKey, region }) {
  const parsedUrl = new URL(url);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(body ?? "");
  const canonicalUri = `${parsedUrl.pathname || "/"}`;
  const canonicalQuery = parsedUrl.searchParams.toString();
  const canonicalHeaders = [
    `host:${parsedUrl.host.toLowerCase()}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
  ].join("\n") + "\n";
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, "s3");
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = hmacSha256(kSigning, stringToSign).toString("hex");

  return {
    headers: {
      host: parsedUrl.host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  };
}

async function putObjectToR2({ bucket, key, body, contentType }) {
  const config = buildR2Client();
  const url = new URL(`${config.endpoint.replace(/\/$/, "")}/${bucket}/${key}`);
  const { headers } = signR2Request({
    method: "PUT",
    url: url.toString(),
    body,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  });

  const response = await fetch(url.toString(), {
    method: "PUT",
    body,
    headers: {
      ...headers,
      "Content-Type": contentType,
    },
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed with HTTP ${response.status}.`);
  }

  return response;
}

async function getObjectFromR2({ bucket, key }) {
  const config = buildR2Client();
  const url = new URL(`${config.endpoint.replace(/\/$/, "")}/${bucket}/${key}`);
  const { headers } = signR2Request({
    method: "GET",
    url: url.toString(),
    body: undefined,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: config.region,
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`R2 retrieval failed with HTTP ${response.status}.`);
  }

  return response;
}

function normalizeFilename(filename) {
  return String(filename || "document.pdf")
    .replace(/\\/g, "/")
    .replace(/^\//, "")
    .split("/")
    .pop();
}

export async function saveGeneratedFile({ filename, buffer, title }) {
  const provider = getStorageProvider();
  const safeFilename = normalizeFilename(filename || title || "document.pdf");

  if (provider === "local") {
    const filePath = path.join(generatedDirectory, safeFilename);
    await fs.mkdir(generatedDirectory, { recursive: true });
    await fs.writeFile(filePath, buffer);

    return {
      provider,
      filename: safeFilename,
      filePath,
      objectKey: null,
      bucket: null,
    };
  }

  const { bucket } = buildR2Client();

  const objectKey = `generated/${Date.now()}-${safeFilename}`;

  await putObjectToR2({
    bucket,
    key: objectKey,
    body: buffer,
    contentType: safeFilename.toLowerCase().endsWith(".pdf")
      ? "application/pdf"
      : "application/octet-stream",
  });

  return {
    provider,
    filename: safeFilename,
    filePath: null,
    objectKey,
    bucket,
  };
}

export async function readGeneratedFileStream(entry) {
  if (entry.provider === "local") {
    if (!entry.filePath) {
      throw new Error("Local generated file entry is missing a file path.");
    }

    return {
      stream: await import("node:fs").then(({ createReadStream }) =>
        createReadStream(entry.filePath)
      ),
      contentType: entry.filename.endsWith(".pdf")
        ? "application/pdf"
        : "application/octet-stream",
      size: (await fs.stat(entry.filePath)).size,
    };
  }

  const { bucket: configuredBucket } = buildR2Client();
  const bucket = entry.bucket || configuredBucket;

  const object = await getObjectFromR2({
    bucket,
    key: entry.objectKey,
  });

  if (!object.body) {
    throw new Error("R2 retrieval returned an empty response body.");
  }

  return {
    stream: Readable.fromWeb(object.body),
    contentType: object.headers.get("content-type") || "application/octet-stream",
    size: Number(object.headers.get("content-length") || 0),
  };
}

export async function ensureGeneratedDirectory() {
  await fs.mkdir(generatedDirectory, { recursive: true });
}

export function createSecureDownloadToken({
  filename,
  filePath,
  userId = null,
  provider = getStorageProvider(),
  bucket = null,
  objectKey = null,
}) {
  const token = crypto.randomBytes(24).toString("hex");

  downloadRegistry.set(token, {
    filename,
    filePath,
    provider,
    bucket,
    objectKey,
    userId,
    createdAt: Date.now(),
  });

  const expiryTimer = setTimeout(() => {
    downloadRegistry.delete(token);
  }, TTL_MS);
  expiryTimer.unref?.();

  return token;
}

export function getSecureDownloadEntry(token, filename) {
  const entry = downloadRegistry.get(token);

  if (!entry) {
    return null;
  }

  if (Date.now() - entry.createdAt > TTL_MS) {
    downloadRegistry.delete(token);
    return null;
  }

  if (entry.filename !== filename) {
    return null;
  }

  return entry;
}

export async function cleanupExpiredDownloads() {
  for (const [token, entry] of downloadRegistry.entries()) {
    if (Date.now() - entry.createdAt > TTL_MS) {
      downloadRegistry.delete(token);
    }
  }
}
