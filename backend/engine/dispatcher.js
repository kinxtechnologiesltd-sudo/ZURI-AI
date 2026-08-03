// engine/dispatcher.js

import { runProvider, streamProvider } from "../providers/index.js";

/**
 * ============================================
 * Execute a provider request
 * ============================================
 */
export async function dispatch(context) {
  const {
    provider,
    model,
    messages,
    stream = false,
  } = context;

  try {
    if (stream) {
      return await streamProvider({
        provider,
        model,
        messages,
      });
    }

    return await runProvider({
      provider,
      model,
      messages,
    });
  } catch (error) {
    console.error(
      `[Dispatcher] ${provider} failed`,
      error
    );

    throw error;
  }
}