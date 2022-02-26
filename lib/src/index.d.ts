import datatypeTypeList from '../data/datatypeTypes.json';
export interface Property {
    id: string;
    label: string;
    description: string;
    alias?: string[] | null;
    labels?: Record<string, string | undefined>;
    descriptions?: Record<string, string | undefined>;
    aliases?: Record<string, string[] | undefined>;
    datatype: typeof datatypeTypeList[number];
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
declare const _default: {
    properties: Property[];
    getProperty: (propertyID: string) => Property | null;
    datatypeTypes: string[];
    monolingualLanguages: language[];
    labelLanguages: language[];
    siteDetails: SiteDetails;
};
export default _default;
