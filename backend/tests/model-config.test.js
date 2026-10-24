import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectModel } from '../engine/modelRouter.js';

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
