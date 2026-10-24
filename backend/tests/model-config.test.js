import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectModel } from '../engine/modelRouter.js';
import { generatePdf } from '../services/pdfGeneration.js';
import { createSecureDownloadToken, getSecureDownloadEntry } from '../services/generatedFiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const loginScreen = readFileSync(path.join(__dirname, '../../src/app/login.tsx'), 'utf8');
const engineSource = readFileSync(path.join(__dirname, '../engine/zuriEngine.js'), 'utf8');
const environmentSource = readFileSync(path.join(__dirname, '../config/environment.js'), 'utf8');

test('complex reasoning uses the configured high-quality OpenAI model', () => {
  const result = selectModel({ tool: 'reasoning' });
  assert.equal(result.provider, 'openai');
  assert.equal(result.model, 'gpt-4.1');
});

test('simple message routing prefers the configured fast model', () => {
  const result = selectModel({ tool: 'search' });
  assert.equal(result.provider, 'openai');
  assert.equal(result.model, 'gpt-4.1-mini');
});

test('research citations are threaded through the engine response payload', () => {
  assert.match(engineSource, /sources:\s*researchSources\s*\|\|\s*\[\]/);
  assert.match(engineSource, /sources:\s*context\.sources\s*\|\|\s*\[\]/);
});

test('the login screen does not render the Google sign-in UI', () => {
  assert.doesNotMatch(loginScreen, /Continue with Google|googleButton|googleText|googleG/);
});

test('environment defaults are configured for the supported OpenAI models', () => {
  assert.match(environmentSource, /OPENAI_MODEL:\s*process\.env\.OPENAI_MODEL \|\| "gpt-4\.1"/);
  assert.match(environmentSource, /OPENAI_FAST_MODEL:\s*process\.env\.OPENAI_FAST_MODEL \|\| "gpt-4\.1-mini"/);
  assert.match(environmentSource, /OPENAI_TTS_MODEL:\s*process\.env\.OPENAI_TTS_MODEL \|\| "gpt-4o-mini-tts"/);
});

test('FAL and voice model defaults are centralized in server config', () => {
  assert.match(environmentSource, /FAL_MODEL:\s*process\.env\.FAL_MODEL \|\| "fal-ai\/flux\/schnell"/);
  assert.match(environmentSource, /FAL_COMIC_MODEL:\s*process\.env\.FAL_COMIC_MODEL \|\| "fal-ai\/flux-2-lora-gallery\/digital-comic-art"/);
  assert.match(environmentSource, /ELEVENLABS_MODEL_ID:\s*process\.env\.ELEVENLABS_MODEL_ID \|\| "eleven_v3"/);
  assert.match(environmentSource, /GROQ_TRANSCRIPTION_MODEL:\s*process\.env\.GROQ_TRANSCRIPTION_MODEL \|\| "whisper-large-v3"/);
});

test('generated file storage settings include a production R2/S3 adapter and public upload URL base', () => {
  assert.match(environmentSource, /PDF_STORAGE_PROVIDER:\s*process\.env\.PDF_STORAGE_PROVIDER \|\| "local"/);
  assert.match(environmentSource, /PUBLIC_BASE_URL:\s*process\.env\.PUBLIC_BASE_URL \|\| "http:\/\/localhost:3001"/);
  assert.match(environmentSource, /R2_ENDPOINT:\s*process\.env\.R2_ENDPOINT/);
  assert.match(environmentSource, /R2_BUCKET_NAME:\s*process\.env\.R2_BUCKET_NAME/);
  assert.match(environmentSource, /R2_ACCESS_KEY_ID:\s*process\.env\.R2_ACCESS_KEY_ID/);
  assert.match(environmentSource, /R2_SECRET_ACCESS_KEY:\s*process\.env\.R2_SECRET_ACCESS_KEY/);
});

test('PDF generation creates a valid document buffer and secure download token', async () => {
  const pdfBuffer = await generatePdf({
    title: 'Quarterly Summary',
    content: 'Revenue increased after the launch.\n\nThis is a test PDF.',
  });

  assert.ok(pdfBuffer instanceof Buffer);
  assert.match(pdfBuffer.toString('latin1').slice(0, 5), /^%PDF/);

  const token = createSecureDownloadToken({
    filename: 'quarterly-summary.pdf',
    filePath: path.join(__dirname, '../generated/quarterly-summary.pdf'),
  });

  const entry = getSecureDownloadEntry(token, 'quarterly-summary.pdf');
  assert.ok(entry);
  assert.equal(entry.filename, 'quarterly-summary.pdf');
  assert.equal(entry.filePath.endsWith('quarterly-summary.pdf'), true);
});
