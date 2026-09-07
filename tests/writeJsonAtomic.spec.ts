import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { writeJsonFilesAtomic } from '../scripts/utils/writeJsonAtomic';

const directories: string[] = [];

afterEach(async () => {
    await Promise.all(directories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

describe('writeJsonFilesAtomic', () => {
    it('replaces every staged JSON file', async () => {
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wikidata-properties-'));
        directories.push(directory);
        const first = path.join(directory, 'first.json');
        const second = path.join(directory, 'second.json');
        await fs.writeFile(first, '{"old":true}');

        await writeJsonFilesAtomic(new Map([
            [first, { updated: true }],
            [second, ['value']]
        ]));

        expect(JSON.parse(await fs.readFile(first, 'utf8'))).toEqual({ updated: true });
        expect(JSON.parse(await fs.readFile(second, 'utf8'))).toEqual(['value']);
        expect((await fs.readdir(directory)).some((name) => name.endsWith('.tmp'))).toBe(false);
    });

    it('does not replace existing files when staging fails', async () => {
        const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'wikidata-properties-'));
        directories.push(directory);
        const existing = path.join(directory, 'existing.json');
        await fs.writeFile(existing, '{"old":true}');

        await expect(writeJsonFilesAtomic(new Map([
            [existing, { updated: true }],
            [path.join(directory, 'missing', 'failed.json'), { value: true }]
        ]))).rejects.toThrow();

        expect(await fs.readFile(existing, 'utf8')).toBe('{"old":true}');
        expect((await fs.readdir(directory)).some((name) => name.endsWith('.tmp'))).toBe(false);
    });
});