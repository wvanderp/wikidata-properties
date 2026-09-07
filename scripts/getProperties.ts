import axios from 'axios';
import type {
    Property as WikibaseProperty,
    Snak,
    Statement,
    WikidataResponse
} from '@wvanderp/wikibase-datamodel-types';

import { chunk, fromPairs } from './utils/arrayUtils';
import { retry } from './utils/retry';

const axiosConfig = {
    headers: {
        'User-Agent': 'wikidata-properties/1.0.0 (https://github.com/wvanderp/wikidata-properties)'
    },
    timeout: 120_000
};

interface SparqlResponse {
    results: {
        bindings: Array<{ property?: { value?: string } }>;
    };
}

export interface GeneratedUrlFormat {
    value?: string;
    rank: Statement['rank'];
    language?: string[];
    appliesWhenRegex?: string[];
}

export interface GeneratedProperty {
    id: string;
    label: string | null;
    description: string | null;
    alias: string[] | null;
    labels: Record<string, string>;
    descriptions: Record<string, string>;
    aliases: Record<string, string[]>;
    urlFormat?: GeneratedUrlFormat[];
    urlFormatThirdParty?: GeneratedUrlFormat[];
    formatRegex?: string[];
    datatype: string;
}

function stringValue(snak: Snak | undefined): string | undefined {
    const value = snak?.datavalue?.value;
    return typeof value === 'string' ? value : undefined;
}

function itemId(snak: Snak | undefined): string | undefined {
    const value = snak?.datavalue?.value;
    if (typeof value !== 'object' || value === null) return undefined;
    const entity = value as Record<string, unknown>;
    return entity['entity-type'] === 'item' && typeof entity.id === 'string' ? entity.id : undefined;
}

function parseFormats(statements: Statement[] | undefined): GeneratedUrlFormat[] | undefined {
    return statements?.map((statement) => ({
        value: stringValue(statement.mainsnak),
        rank: statement.rank,
        language: statement.qualifiers?.P407?.map(itemId).filter((id): id is string => id !== undefined),
        appliesWhenRegex: statement.qualifiers?.P8460
            ?.map(stringValue)
            .filter((value): value is string => value !== undefined)
    }));
}

export function parseProperty(item: WikibaseProperty): GeneratedProperty {
    return {
        id: item.id,
        label: item.labels?.en?.value ?? null,
        description: item.descriptions?.en?.value ?? null,
        alias: item.aliases?.en?.map((alias) => alias.value) ?? null,
        labels: fromPairs(Object.values(item.labels ?? {}).map((label) => [label.language, label.value])),
        descriptions: fromPairs(
            Object.values(item.descriptions ?? {}).map((description) => [description.language, description.value])
        ),
        aliases: fromPairs(
            Object.values(item.aliases ?? {})
                .filter((aliases) => aliases.length > 0)
                .map((aliases) => [aliases[0].language, aliases.map((alias) => alias.value)])
        ),
        urlFormat: parseFormats(item.claims?.P1630),
        urlFormatThirdParty: parseFormats(item.claims?.P3303),
        formatRegex: item.claims?.P1793
            ?.map((claim) => stringValue(claim.mainsnak))
            .filter((value): value is string => value !== undefined),
        datatype: item.datatype
    };
}

export function validatePropertyIds(expectedIds: readonly string[], properties: readonly WikibaseProperty[]): void {
    const expected = new Set(expectedIds);
    const actual = new Set(properties.map(({ id }) => id));
    const duplicates = properties.map(({ id }) => id).filter((id, index, ids) => ids.indexOf(id) !== index);
    const missing = [...expected].filter((id) => !actual.has(id));
    const unexpected = [...actual].filter((id) => !expected.has(id));

    if (duplicates.length || missing.length || unexpected.length) {
        throw new Error(
            `Incomplete property response (missing: ${missing.slice(0, 10).join(', ') || 'none'}; ` +
            `unexpected: ${unexpected.slice(0, 10).join(', ') || 'none'}; ` +
            `duplicates: ${[...new Set(duplicates)].slice(0, 10).join(', ') || 'none'})`
        );
    }
}

export async function getProperties(): Promise<GeneratedProperty[]> {
    console.log('Getting properties...');
    const page = await retry(() => axios.get<SparqlResponse>('https://query.wikidata.org/sparql', {
        ...axiosConfig,
        params: {
            query: 'SELECT DISTINCT ?property WHERE { ?property wikibase:propertyType ?propertyType. }',
            format: 'json'
        }
    }));

    const ids = [...new Set(page.data.results.bindings.map(({ property }) => {
        const parts = property?.value?.split('/');
        const id = parts?.[parts.length - 1];
        if (!id || !/^P[1-9]\d*$/.test(id)) throw new Error(`Invalid property binding: ${property?.value}`);
        return id;
    }))];
    if (ids.length === 0) throw new Error('The property query returned no IDs');

    const properties: WikibaseProperty[] = [];
    const batches = chunk(ids, 50);
    for (const [index, batch] of batches.entries()) {
        console.log(`Fetching property batch ${index + 1}/${batches.length}...`);
        const response = await retry(() => axios.get<WikidataResponse>('https://www.wikidata.org/w/api.php', {
            ...axiosConfig,
            params: { action: 'wbgetentities', format: 'json', formatversion: 2, ids: batch.join('|') }
        }));
        for (const entity of Object.values(response.data.entities)) {
            if (entity.type !== 'property') throw new Error(`Expected a property entity, received ${entity.type}`);
            properties.push(entity);
        }
    }

    validatePropertyIds(ids, properties);
    return properties
        .map(parseProperty)
        .sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
}
