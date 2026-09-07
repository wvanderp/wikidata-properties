import axios, { type AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';

import { retry } from '../scripts/utils/retry';

function axiosError(status?: number, retryAfter?: string): AxiosError {
    return new axios.AxiosError(
        'request failed',
        undefined,
        undefined,
        undefined,
        status === undefined
            ? undefined
            : { status, headers: retryAfter ? { 'retry-after': retryAfter } : {}, data: {}, statusText: '', config: {} as never }
    );
}

describe('retry', () => {
    it('retries transient failures', async () => {
        const operation = vi.fn().mockRejectedValueOnce(axiosError(503)).mockResolvedValue('ok');
        const sleep = vi.fn().mockResolvedValue(undefined);

        await expect(retry(operation, { sleep, random: () => 0 })).resolves.toBe('ok');
        expect(operation).toHaveBeenCalledTimes(2);
        expect(sleep).toHaveBeenCalledWith(500);
    });

    it('honors Retry-After', async () => {
        const operation = vi.fn().mockRejectedValueOnce(axiosError(429, '2')).mockResolvedValue('ok');
        const sleep = vi.fn().mockResolvedValue(undefined);

        await retry(operation, { sleep });
        expect(sleep).toHaveBeenCalledWith(2000);
    });

    it('does not retry permanent client failures', async () => {
        const operation = vi.fn().mockRejectedValue(axiosError(404));
        await expect(retry(operation)).rejects.toThrow('request failed');
        expect(operation).toHaveBeenCalledTimes(1);
    });
});