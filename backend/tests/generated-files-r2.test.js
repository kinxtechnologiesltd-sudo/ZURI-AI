import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { app } from '../server.js';
import {
  createSecureDownloadToken,
  getSecureDownloadEntry,
  getStorageProvider,
  readGeneratedFileStream,
  saveGeneratedFile,
} from '../services/generatedFiles.js';

const endpoint = 'http://r2.mock.invalid';
const configKeys = [
  'PDF_STORAGE_PROVIDER',
  'R2_ENDPOINT',
  'R2_BUCKET_NAME',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_REGION',
];
const originalConfig = new Map(
  configKeys.map((key) => [key, process.env[key]])
);
const originalFetch = globalThis.fetch;
const objects = new Map();
const requests = [];
let uploadFailureStatus = 0;
let retrievalFailureStatus = 0;
let server;
let baseUrl;

before(async () => {
  process.env.PDF_STORAGE_PROVIDER = 'r2';
  process.env.R2_ENDPOINT = endpoint;
  process.env.R2_BUCKET_NAME = 'test-bucket';
  process.env.R2_ACCESS_KEY_ID = 'test-access-key';
  process.env.R2_SECRET_ACCESS_KEY = 'test-secret-key';
  process.env.R2_REGION = 'auto';

  globalThis.fetch = async (input, init = {}) => {
    const requestUrl = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    );

    if (requestUrl.origin !== endpoint) {
      return originalFetch(input, init);
    }

    const method = String(init.method || 'GET').toUpperCase();
    requests.push({ method, url: requestUrl.toString(), headers: init.headers });

    if (method === 'PUT') {
      if (uploadFailureStatus) {
        return new Response('simulated provider detail', { status: uploadFailureStatus });
      }

      const body = Buffer.from(init.body);
      objects.set(requestUrl.pathname, body);
      return new Response(null, { status: 200 });
    }

    if (retrievalFailureStatus) {
      return new Response('simulated provider detail', { status: retrievalFailureStatus });
    }

    const body = objects.get(requestUrl.pathname);
    if (!body) {
      return new Response('not found', { status: 404 });
    }

    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-length': String(body.length),
      },
    });
  };

  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
      });
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of originalConfig) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});

test('R2 provider precedence uploads and serves the same bytes through a secure token', async () => {
  assert.equal(getStorageProvider(), 'r2');
  process.env.PDF_STORAGE_PROVIDER = 'local';
  assert.equal(getStorageProvider(), 'local');
  process.env.PDF_STORAGE_PROVIDER = 'r2';

  const filename = 'mock-r2-document.pdf';
  const pdfBytes = Buffer.from('%PDF-1.7\nmock PDF payload for R2 round trip\n%%EOF', 'ascii');
  const stored = await saveGeneratedFile({ filename, buffer: pdfBytes });
  const uploadRequest = requests.find((request) => request.method === 'PUT');

  assert.equal(stored.provider, 'r2');
  assert.equal(stored.bucket, 'test-bucket');
  assert.equal(stored.filePath, null);
  assert.ok(stored.objectKey);
  assert.ok(uploadRequest);
  assert.equal(
    new URL(uploadRequest.url).pathname,
    `/test-bucket/${stored.objectKey}`
  );
  assert.equal(
    uploadRequest.headers['x-amz-content-sha256'],
    createHash('sha256').update(pdfBytes).digest('hex')
  );
  assert.match(uploadRequest.headers.authorization, /^AWS4-HMAC-SHA256 Credential=test-access-key\//);
  assert.match(
    uploadRequest.headers.authorization,
    /SignedHeaders=host;x-amz-content-sha256;x-amz-date/
  );
  assert.deepEqual(objects.get(new URL(uploadRequest.url).pathname), pdfBytes);

  const token = createSecureDownloadToken({ filename, ...stored, userId: 'test-user' });
  const entry = getSecureDownloadEntry(token, filename);
  assert.equal(entry.objectKey, stored.objectKey);
  assert.equal(getSecureDownloadEntry('invalid-token', filename), null);
  assert.equal(getSecureDownloadEntry(token, 'different.pdf'), null);

  const response = await originalFetch(
    `${baseUrl}/generated/${token}/${encodeURIComponent(filename)}`
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /application\/pdf/i);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), pdfBytes);

  const invalidResponse = await originalFetch(
    `${baseUrl}/generated/invalid-token/${encodeURIComponent(filename)}`
  );
  assert.equal(invalidResponse.status, 403);
});

test('R2 upload failures return a useful status without provider response details', async () => {
  uploadFailureStatus = 503;
  await assert.rejects(
    saveGeneratedFile({ filename: 'failed-upload.pdf', buffer: Buffer.from('pdf') }),
    (error) => {
      assert.match(error.message, /R2 upload failed with HTTP 503/);
      assert.doesNotMatch(error.message, /simulated provider detail/);
      return true;
    }
  );
  uploadFailureStatus = 0;
});

test('R2 retrieval failures return a useful status without provider response details', async () => {
  retrievalFailureStatus = 502;
  await assert.rejects(
    readGeneratedFileStream({
      provider: 'r2',
      filename: 'missing.pdf',
      bucket: 'test-bucket',
      objectKey: 'generated/missing.pdf',
    }),
    (error) => {
      assert.match(error.message, /R2 retrieval failed with HTTP 502/);
      assert.doesNotMatch(error.message, /simulated provider detail/);
      return true;
    }
  );
  retrievalFailureStatus = 0;
});
