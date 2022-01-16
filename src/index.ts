import propertiesJson from '../data/properties.json';
import datatypeTypeList from '../data/datatypeTypes.json';
import monolingualLanguagesJSON from '../data/MonolingualLanguages.json';
import labelLanguagesJson from '../data/LabelLanguages.json';
import siteDetailsJSON from '../data/SiteDetails.json'

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
    name: string
}


export interface SiteDetails {
    [key: string]: {
        shortName: string;
        name: string;
        id: string;
        pageUrl: string;
        apiUrl: string;
        languageCode: string;
        group: string
    }
}

export const properties = propertiesJson as Property[];
export const getProperty = (propertyID: string): Property | null => properties.find((r) => r.id === propertyID) ?? null

export const datatypeTypes = datatypeTypeList;

export const monolingualLanguages = monolingualLanguagesJSON as language[]
export const labelLanguages = labelLanguagesJson as language[]

export const siteDetails = siteDetailsJSON as SiteDetails;


