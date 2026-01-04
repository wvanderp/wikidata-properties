import axios from "axios";
import fs from "fs";
import path from "path";

const headers = {
    'User-Agent': 'wikidata-properties/1.0.0 (https://github.com/wvanderp/wikidata-properties)'
};

// API response types
export interface SiteMatrix {
    sitematrix: {
        [key: number]: {
            code: string;
            name: string;
            site?: {
                url: string;
                dbname: string;
                code: string;
                sitename: string;
                closed?: string;
            }[];
            dir: string;
            localname: string;
        };
        count: number;
        specials?: {
            url: string;
            dbname: string;
            code: string;
            lang: string;
            sitename: string;
            private?: string;
            closed?: string;
            fishbowl?: string;
        }[];
    };
}

export interface Siteinfo {
    batchcomplete: string;
    query: {
        general: {
            mainpage: string;
            base: string;
            sitename: string;
            logo: string;
            generator: string;
            phpversion: string;
            phpsapi: string;
            dbtype: string;
            dbversion: string;
            langconversion: string;
            linkconversion: string;
            titleconversion: string;
            linkprefixcharset: string;
            linkprefix: string;
            linktrail: string;
            legaltitlechars: string;
            invalidusernamechars: string;
            fixarabicunicode: string;
            fixmalayalamunicode: string;
            "git-hash": string;
            "git-branch": string;
            case: string;
            lang: string;
            fallback?: (null)[] | null;
            fallback8bitEncoding: string;
            writeapi: string;
            maxarticlesize: number;
            timezone: string;
            timeoffset: number;
            articlepath: string;
            scriptpath: string;
            script: string;
            variantarticlepath: boolean;
            server: string;
            servername: string;
            wikiid: string;
            time: string;
            misermode: string;
            maxuploadsize: number;
            minuploadchunksize: number;
            galleryoptions: {
                imagesPerRow: number;
                imageWidth: number;
                imageHeight: number;
                captionLength: string;
                showBytes: string;
                mode: string;
                showDimensions: string;
            };
            thumblimits?: (number)[] | null;
            imagelimits?: ({
                width: number;
                height: number;
            })[] | null;
            favicon: string;
            centralidlookupprovider: string;
            allcentralidlookupproviders?: (string)[] | null;
            interwikimagic: string;
            magiclinks: {
                ISBN: string;
                PMID: string;
                RFC: string;
            };
            categorycollation: string;
            nofollowlinks: string;
            nofollownsexceptions?: (null)[] | null;
            nofollowdomainexceptions?: (string)[] | null;
            "wmf-config": {
                wmfMasterDatacenter: string;
                wmfEtcdLastModifiedIndex: number;
                wmgCirrusSearchDefaultCluster: string;
                wgCirrusSearchDefaultCluster: string;
            };
            "max-page-id": number;
            "linter": {
                high?: (string)[] | null;
                medium?: (string)[] | null;
                low?: (string)[] | null;
            };
            "mobileserver": string;
            "pageviewservice-supported-metrics": {
                pageviews: {
                    pageviews: string;
                };
                siteviews: {
                    pageviews: string;
                    uniques: string;
                };
                mostviewed: {
                    pageviews: string;
                };
            };
            "readinglists-config": {
                maxListsPerUser: number;
                maxEntriesPerList: number;
                deletedRetentionDays: number;
            };
        };
    };
}

// INTERMEDIATE TYPES
export interface SiteEntry {
    "code": string; // project code (wikipedia, wiktionary…)
    "dbname": string; // aawiki
    "url": string; // https://aa.wikipedia.org
    "sitename": string; // Wikipedia
    "closed"?: string; // ''
}

// FINAL TYPES
interface RichSite {
    shortName: string; // e.g. "Frysk", español, Wikidata
    name: string; // e.g. "Frysk", español, Wikidata
    id: string; // e.g. "fywiki", eswikibooks, wikidatawiki
    pageUrl: string; // e.g. "//fy.wikipedia.org/wiki/$1", //es.wikibooks.org/wiki/$1 //www.wikidata.org/wiki/$1
    apiUrl: string; // e.g. "//fy.wikipedia.org/w/api.php", //es.wikibooks.org/w/api.php //www.wikidata.org/w/api.php
    languageCode: string; // e.g. "fy", "es" en
    group: string; // e.g. "wikipedia", "wikibooks" special

    logo?: string; // optional logo URL
    mobileUrl?: string; // optional mobile URL
}


const SITE_MATRIX_ENDPOINT =
    "https://meta.wikimedia.org/w/api.php?action=sitematrix&format=json&smtype=language&origin=*";

const SITEINFO_QUERY =
    "?action=query&meta=siteinfo&siprop=general&format=json&origin=*";

async function getSiteMatrix(): Promise<SiteEntry[]> {
    const { sitematrix } = (await axios.get<SiteMatrix>(SITE_MATRIX_ENDPOINT, { headers })).data;
    const sites: SiteEntry[] = [];

    for (const key of Object.keys(sitematrix)) {
        if (key === "count") continue; // skip metadata

        const entry = (sitematrix[key as keyof typeof sitematrix]) as SiteMatrix["sitematrix"][1];
        if (entry?.site) {
            sites.push(
                ...entry.site.map((s) => ({
                    code: s.code,
                    dbname: s.dbname,
                    url: s.url.replace(/\/$/, ""), // remove trailing slash
                    sitename: s.sitename,
                    closed: s.closed || "",
                }))
            );
        }
    }

    // “specials” comes as an array rather than an object
    if (Array.isArray(sitematrix.specials)) {
        sites.push(
            ...sitematrix.specials.map((s: any) => ({
                code: s.code,
                dbname: s.dbname,
                url: s.url.replace(/\/$/, ""),
                sitename: s.sitename,
                closed: s.closed,
            }))
        );
    }
    return sites;
}

async function enrichSiteFromEntry(site: SiteEntry): Promise<RichSite | null> {
    // wait for 1s to avoid hitting API rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Fetching details for ${site.dbname}...`);

    // Skip closed wikis
    if (site.closed) return null;

    const api = `${site.url}/w/api.php${SITEINFO_QUERY}`;
    try {
        const data = (await axios.get<Siteinfo>(api, { headers })).data;
        const general = data?.query?.general

        return {
            shortName: general.sitename,
            name: general.sitename,
            id: general.wikiid ?? site.dbname,
            pageUrl: `${general.server}${general.articlepath}`,
            apiUrl: `${general.server}${general.scriptpath}/api.php`,
            languageCode: general.lang,
            group: site.code, // e.g. "wikipedia", "wikibooks"

            logo: general.logo,
            mobileUrl: general.mobileserver
        } as RichSite;
    } catch (err) {
        console.warn(`⚠️  ${site.dbname} failed:`, (err as Error).message);
        return null;
    }
}

export default async function getSiteDetails() {
    console.log("Getting SiteDetails...");

    const matrix = await getSiteMatrix();
    console.log(`Fetched ${matrix.length} raw records`);

    const richSites = {} as Record<string, RichSite>;

    for (const site of matrix) {
        const richSite = await enrichSiteFromEntry(site);

        if (richSite !== null) {
            richSites[richSite.id] = richSite;
        }
    }


    fs.writeFileSync(
        path.join(__dirname, "../data/SiteDetails.json"),
        JSON.stringify(richSites, undefined, 4)
    );
    console.log("Saved → SiteDetails.json");
}