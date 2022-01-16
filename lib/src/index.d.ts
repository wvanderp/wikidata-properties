export interface Property {
    id: string;
    label: string;
    description: string;
    alias?: string[] | null;
    labels?: Record<string, string | undefined>;
    descriptions?: Record<string, string | undefined>;
    aliases?: Record<string, string[] | undefined>;
}
export interface language {
    code: string;
    autonym: string;
    name: string;
}
export interface SiteDetails {
    [key: string]: {
        shortName: string;
        name: string;
        id: string;
        pageUrl: string;
        apiUrl: string;
        languageCode: string;
        group: string;
    };
}
export declare const properties: Property[];
export declare const getProperty: (propertyID: string) => Property | null;
export declare const datatypeTypes: string[];
export declare const monolingualLanguages: language[];
export declare const labelLanguages: language[];
export declare const siteDetails: SiteDetails;
