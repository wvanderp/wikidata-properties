import type { Property as WikibaseProperty } from '@wvanderp/wikibase-datamodel-types';
import { describe, expect, it } from 'vitest';

import { parseProperty, validatePropertyIds } from '../scripts/getProperties';

describe('property generation', () => {
    it('parses nullable metadata and claim-derived fields safely', () => {
        const property = {
            type: 'property',
            id: 'P2',
            datatype: 'external-id',
            claims: {
                P1630: [{
                    type: 'statement',
                    rank: 'normal',
                    mainsnak: { snaktype: 'value', property: 'P1630', datavalue: { value: 'https://x/$1', type: 'string' } },
                    qualifiers: {
                        P407: [{ snaktype: 'value', property: 'P407', datavalue: { value: { 'entity-type': 'item', id: 'Q1860', 'numeric-id': 1860 }, type: 'wikibase-entityid' } }],
                        P8460: [{ snaktype: 'novalue', property: 'P8460' }]
                    }
                }]
            }
        } as WikibaseProperty;

        expect(parseProperty(property)).toMatchObject({
            id: 'P2',
            label: null,
            description: null,
            urlFormat: [{ value: 'https://x/$1', rank: 'normal', language: ['Q1860'], appliesWhenRegex: [] }]
        });
    });

    it('rejects missing, unexpected, and duplicate entities', () => {
        const property = (id: string) => ({ type: 'property', id, datatype: 'string' }) as WikibaseProperty;
        expect(() => validatePropertyIds(['P2', 'P10'], [property('P2')])).toThrow(/missing: P10/);
        expect(() => validatePropertyIds(['P2'], [property('P2'), property('P3')])).toThrow(/unexpected: P3/);
        expect(() => validatePropertyIds(['P2'], [property('P2'), property('P2')])).toThrow(/duplicates: P2/);
    });
});