import path from 'node:path';
import { fileURLToPath } from 'node:url';
import axios from 'axios';

import { getProperties } from './getProperties';
import getSiteDetails from './siteDetails';
import { retry } from './utils/retry';
import { writeJsonFilesAtomic } from './utils/writeJsonAtomic';

const axiosConfig = {
    timeout: 60_000,
    headers: {
        'User-Agent': 'wikidata-properties/1.0.0 (https://github.com/wvanderp/wikidata-properties)'
    }
};

interface Language {
    code: string;
    autonym: string;
    name: string;
}

interface LanguageResponse {
    query?: { wbcontentlanguages?: Record<string, Language> };
}

interface GeneralResponse {
    query?: { general?: { 'wikibase-propertytypes'?: Record<string, unknown> } };
}

async function getLanguages(context: 'monolingualtext' | 'label'): Promise<Language[]> {
    console.log(`Getting ${context} languages...`);
    const response = await retry(() => axios.get<LanguageResponse>('https://www.wikidata.org/w/api.php', {
        ...axiosConfig,
        params: {
            action: 'query',
            format: 'json',
            formatversion: 2,
            meta: 'wbcontentlanguages',
            wbclprop: 'code|autonym|name',
            ...(context === 'monolingualtext' ? { wbclcontext: context } : {})
        }
    }));
    const languages = Object.values(response.data.query?.wbcontentlanguages ?? {});
    if (languages.length === 0) throw new Error(`No ${context} languages were returned`);
    return languages;
}

async function getDataTypes(): Promise<string[]> {
    console.log('Getting Wikidata datatypes...');
    const response = await retry(() => axios.get<GeneralResponse>('https://www.wikidata.org/w/api.php', {
        ...axiosConfig,
        params: { action: 'query', meta: 'siteinfo', siprop: 'general', format: 'json', formatversion: 2 }
    }));
    const datatypes = Object.keys(response.data.query?.general?.['wikibase-propertytypes'] ?? {});
    if (datatypes.length === 0) throw new Error('No Wikidata datatypes were returned');
    return datatypes;
}

export async function main(): Promise<void> {
    const dataDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../data');

    const [properties, monolingualLanguages, labelLanguages, datatypeTypes, siteDetails] = await Promise.all([
        getProperties(),
        getLanguages('monolingualtext'),
        getLanguages('label'),
        getDataTypes(),
        getSiteDetails()
    ]);

    const unknownDatatypes = [...new Set(properties.map(({ datatype }) => datatype))]
        .filter((datatype) => !datatypeTypes.includes(datatype));
    if (unknownDatatypes.length) throw new Error(`Unknown property datatypes: ${unknownDatatypes.join(', ')}`);

    await writeJsonFilesAtomic(new Map<string, unknown>([
        [path.join(dataDirectory, 'properties.json'), properties],
        [path.join(dataDirectory, 'MonolingualLanguages.json'), monolingualLanguages],
        [path.join(dataDirectory, 'LabelLanguages.json'), labelLanguages],
        [path.join(dataDirectory, 'datatypeTypes.json'), datatypeTypes],
        [path.join(dataDirectory, 'SiteDetails.json'), siteDetails]
    ]));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch((error: unknown) => {
        console.error(error);
        process.exitCode = 1;
    });
}
