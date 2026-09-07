import { createRequire } from 'node:module';

import esmPackage from '../lib/index.mjs';

const require = createRequire(import.meta.url);
const commonJsPackage = require('../lib/index.cjs');

for (const [format, packageApi] of [['ESM', esmPackage], ['CommonJS', commonJsPackage]]) {
    if (packageApi.getProperty('P6')?.id !== 'P6') {
        throw new Error(`${format} package entry did not expose the expected API`);
    }
}

console.log('ESM and CommonJS package entries are valid');