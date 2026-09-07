import { describe, expect, it } from 'vitest';

import { buildSiteDetail, parseSiteMatrix, validateSiteDetails } from '../scripts/siteDetails';

describe('site detail generation', () => {
    it('includes public language and special sites while filtering unavailable sites', () => {
        const sites = parseSiteMatrix({ sitematrix: {
            count: 4,
            0: { site: [{ url: 'https://en.wikipedia.org', dbname: 'enwiki', code: 'wiki', sitename: 'Wikipedia' }] },
            specials: [
                { url: 'https://www.wikidata.org', dbname: 'wikidatawiki', code: 'wikidata', sitename: 'Wikidata' },
                { url: 'https://private.invalid', dbname: 'privatewiki', code: 'private', sitename: 'Private', private: true },
                { url: 'https://closed.invalid', dbname: 'closedwiki', code: 'closed', sitename: 'Closed', closed: true }
            ]
        } });

        expect(sites.map(({ dbname }) => dbname)).toEqual(['enwiki', 'wikidatawiki']);
    });

    it('builds optional runtime fields and validates required special sites', () => {
        const site = buildSiteDetail(
            { url: 'https://www.wikidata.org', dbname: 'wikidatawiki', code: 'wikidata', sitename: 'Wikidata' },
            { query: { general: { sitename: 'Wikidata', server: '//www.wikidata.org', articlepath: '/wiki/$1', scriptpath: '/w', lang: 'en', wikiid: 'wikidatawiki', logo: '/logo.svg' } } }
        );
        expect(site).toMatchObject({ id: 'wikidatawiki', apiUrl: '//www.wikidata.org/w/api.php', logo: '/logo.svg' });
        expect(() => validateSiteDetails([site])).toThrow(/commonswiki, metawiki/);
    });
});