import axios from 'axios';

import delay from './delay';

export interface RetryOptions {
    attempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    sleep?: (milliseconds: number) => Promise<void>;
    random?: () => number;
}

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);

function retryAfterMilliseconds(error: unknown): number | null {
    if (!axios.isAxiosError(error)) return null;

    const value = error.response?.headers['retry-after'];
    if (typeof value !== 'string' && typeof value !== 'number') return null;

    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);

    const date = Date.parse(String(value));
    return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

export function isRetryableError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) return false;
    if (!error.response) return true;
    return RETRYABLE_STATUS_CODES.has(error.response.status);
}

export async function retry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const attempts = options.attempts ?? 4;
    const baseDelayMs = options.baseDelayMs ?? 1000;
    const maxDelayMs = options.maxDelayMs ?? 30_000;
    const sleep = options.sleep ?? delay;
    const random = options.random ?? Math.random;

    if (!Number.isInteger(attempts) || attempts < 1) {
        throw new RangeError('Retry attempts must be a positive integer');
    }

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt === attempts || !isRetryableError(error)) throw error;

            const retryAfter = retryAfterMilliseconds(error);
            const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
            await sleep(retryAfter ?? Math.round(backoff * (0.5 + random() * 0.5)));
        }
    }

    throw new Error('Retry loop completed unexpectedly');
}