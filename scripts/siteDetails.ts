import axios from 'axios';

import { retry } from './utils/retry';

const requestConfig = {
    headers: {
        'User-Agent': 'wikidata-properties/1.0.0 (https://github.com/wvanderp/wikidata-properties)'
    },
    timeout: 60_000
};

interface MatrixSite {
    url: string;
    dbname: string;
    code: string;
    sitename: string;
    lang?: string;
    closed?: boolean;
    private?: boolean;
}

export interface SiteMatrixResponse {
    continue?: { smcontinue?: string; continue?: string };
    sitematrix: {
        [key: string]: unknown;
        count: number;
        specials?: MatrixSite[];
    };
}

interface SiteInfoResponse {
    query?: {
        general?: {
            sitename?: string;
            logo?: string;
            lang?: string;
            articlepath?: string;
            scriptpath?: string;
            server?: string;
            wikiid?: string;
            mobileserver?: string;
        };
    };
}

export interface SiteEntry {
    code: string;
    dbname: string;
    url: string;
    sitename: string;
    lang?: string;
}

export interface RichSite {
    shortName: string;
    name: string;
    id: string;
    pageUrl: string;
    apiUrl: string;
    languageCode: string;
    group: string;
    logo?: string;
    mobileUrl?: string;
}

const SITE_MATRIX_ENDPOINT = 'https://meta.wikimedia.org/w/api.php';

function isMatrixSite(value: unknown): value is MatrixSite {
    if (typeof value !== 'object' || value === null) return false;
    const site = value as Record<string, unknown>;
    return typeof site.url === 'string'
        && typeof site.dbname === 'string'
        && typeof site.code === 'string'
        && typeof site.sitename === 'string';
}

export function parseSiteMatrix(response: SiteMatrixResponse): SiteEntry[] {
    const candidates: MatrixSite[] = [];

    for (const [key, value] of Object.entries(response.sitematrix)) {
        if (key === 'count' || key === 'specials') continue;
        if (typeof value !== 'object' || value === null) continue;
        const sites = (value as { site?: unknown }).site;
        if (Array.isArray(sites)) candidates.push(...sites.filter(isMatrixSite));
    }
    if (Array.isArray(response.sitematrix.specials)) candidates.push(...response.sitematrix.specials);

    return candidates
        .filter((site) => !site.closed && !site.private)
        .map((site) => ({
            code: site.code,
            dbname: site.dbname,
            url: site.url.replace(/\/$/, ''),
            sitename: site.sitename,
            lang: site.lang
        }));
}

async function getSiteMatrix(): Promise<SiteEntry[]> {
    const sites = new Map<string, SiteEntry>();
    let smcontinue: string | undefined;

    do {
        const response = await retry(() => axios.get<SiteMatrixResponse>(SITE_MATRIX_ENDPOINT, {
            ...requestConfig,
            params: {
                action: 'sitematrix',
                format: 'json',
                formatversion: 2,
                smtype: 'language|special',
                smlimit: 'max',
                ...(smcontinue ? { smcontinue } : {})
            }
        }));
        for (const site of parseSiteMatrix(response.data)) sites.set(site.dbname, site);
        smcontinue = response.data.continue?.smcontinue;
    } while (smcontinue);

    return [...sites.values()].sort((a, b) => a.dbname.localeCompare(b.dbname));
}

export function buildSiteDetail(site: SiteEntry, data: SiteInfoResponse): RichSite {
    const general = data.query?.general;
    if (!general?.sitename || !general.server || !general.articlepath || !general.scriptpath || !general.lang) {
        throw new Error(`Incomplete siteinfo response for ${site.dbname}`);
    }

    return {
        shortName: general.sitename,
        name: general.sitename,
        id: general.wikiid ?? site.dbname,
        pageUrl: `${general.server}${general.articlepath}`,
        apiUrl: `${general.server}${general.scriptpath}/api.php`,
        languageCode: general.lang,
        group: site.code,
        ...(general.logo ? { logo: general.logo } : {}),
        ...(general.mobileserver ? { mobileUrl: general.mobileserver } : {})
    };
}

async function enrichSite(site: SiteEntry): Promise<RichSite> {
    console.log(`Fetching details for ${site.dbname}...`);
    const response = await retry(() => axios.get<SiteInfoResponse>(`${site.url}/w/api.php`, {
        ...requestConfig,
        params: { action: 'query', meta: 'siteinfo', siprop: 'general', format: 'json', formatversion: 2 }
    }));
    return buildSiteDetail(site, response.data);
}

async function mapConcurrent<T, R>(items: readonly T[], concurrency: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
    const results = new Array<R>(items.length);
    let nextIndex = 0;

    async function worker(): Promise<void> {
        while (nextIndex < items.length) {
            const index = nextIndex++;
            results[index] = await mapper(items[index]);
        }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
    return results;
}

export function validateSiteDetails(sites: readonly RichSite[], requireSpecialSites = true): void {
    const ids = sites.map(({ id }) => id);
    if (new Set(ids).size !== ids.length) throw new Error('Duplicate site IDs were generated');

    if (requireSpecialSites) {
        const required = ['wikidatawiki', 'commonswiki', 'metawiki'];
        const missing = required.filter((id) => !ids.includes(id));
        if (missing.length) throw new Error(`Required Wikimedia sites are missing: ${missing.join(', ')}`);
    }
}

export default async function getSiteDetails(): Promise<Record<string, RichSite>> {
    console.log('Getting SiteDetails...');
    const matrix = await getSiteMatrix();
    if (matrix.length === 0) throw new Error('The site matrix returned no active public sites');

    const sites = await mapConcurrent(matrix, 5, enrichSite);
    validateSiteDetails(sites);
    return Object.fromEntries(sites.map((site) => [site.id, site]));
}
