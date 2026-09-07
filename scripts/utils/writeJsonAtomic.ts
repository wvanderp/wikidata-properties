import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeJsonFilesAtomic(files: ReadonlyMap<string, unknown>): Promise<void> {
    const staged = new Map<string, string>();

    try {
        for (const [destination, value] of files) {
            const temporary = path.join(
                path.dirname(destination),
                `.${path.basename(destination)}.${randomUUID()}.tmp`
            );
            await fs.writeFile(temporary, JSON.stringify(value, null, 4), { flag: 'wx' });
            staged.set(destination, temporary);
        }

        for (const [destination, temporary] of staged) {
            await fs.rename(temporary, destination);
            staged.delete(destination);
        }
    } finally {
        await Promise.allSettled([...staged.values()].map((temporary) => fs.rm(temporary, { force: true })));
    }
}