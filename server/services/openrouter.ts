import OpenAI from 'openai';
import { logError, logWarn } from './logger';

/**
 * Shared OpenRouter client configuration.
 * All AI service modules should import this client instead of creating their own.
 */

const API_KEY = process.env.OPENROUTER_API_KEY;

export const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-sonnet-4';
export const FALLBACK_MODEL = process.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-4o-mini';
export const DEFAULT_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '15000', 10);
export const DEFAULT_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '500', 10);

/**
 * Create the OpenRouter client instance
 */
export function createOpenRouterClient(): OpenAI {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.FRONTEND_URL || 'https://soulsanctuary.app',
      'X-Title': 'SoulSanctuary',
    },
  });
}

/** Singleton client instance */
export const openrouter = createOpenRouterClient();

/**
 * Check if a valid OpenRouter API key is configured
 */
export function hasValidApiKey(): boolean {
  return !!API_KEY && API_KEY.startsWith('sk-');
}

/**
 * Call the OpenRouter API with a timeout and automatic retry on failure.
 * 
 * @param messages - OpenAI-compatible message array
 * @param model - Model ID to use (defaults to DEFAULT_MODEL)
 * @param timeoutMs - Request timeout in milliseconds
 * @returns The generated text content, or null on failure
 */
export async function callAIWithTimeout(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string = DEFAULT_MODEL,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<string | null> {
  if (!hasValidApiKey()) {
    logWarn('OpenRouter API key missing or invalid');
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const completion = await openrouter.chat.completions.create(
      {
        model,
        messages,
        max_tokens: DEFAULT_MAX_TOKENS,
        temperature: 0.7,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    clearTimeout(timeoutId);

    // Try fallback model if primary fails
    if (model !== FALLBACK_MODEL) {
      logWarn(`Primary model ${model} failed, trying fallback ${FALLBACK_MODEL}`);
      return callAIWithTimeout(messages, FALLBACK_MODEL, timeoutMs);
    }

    logError('OpenRouter API call failed', error as Error, { model });
    return null;
  }
}
