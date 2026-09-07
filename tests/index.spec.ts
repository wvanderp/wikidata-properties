import { describe, expect, test } from 'vitest';
import properties from '../src/index';

test('should return a property', () => {
    const property = properties.getProperty('P6');

    expect(property?.id).to.be.equal('P6');
    expect(property?.datatype).to.be.equal('wikibase-item');
});

test('returns null for an unknown property', () => {
    expect(properties.getProperty('P0')).toBeNull();
});

describe('generated data invariants', () => {
    test('property IDs are unique and datatypes are recognized', () => {
        const ids = properties.properties.map(({ id }) => id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.every((id) => /^P[1-9]\d*$/.test(id))).toBe(true);
        expect(properties.properties.every(({ datatype }) => properties.datatypeTypes.includes(datatype))).toBe(true);
    });

    test('language and site records have usable values', () => {
        expect(properties.labelLanguages.some(({ code }) => code === 'en')).toBe(true);
        expect(properties.siteDetails.enwiki?.apiUrl).toContain('/api.php');
    });
});