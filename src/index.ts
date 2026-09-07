import propertiesJson from '../data/properties.json';
import datatypeTypeList from '../data/datatypeTypes.json';
import monolingualLanguagesJSON from '../data/MonolingualLanguages.json';
import labelLanguagesJson from '../data/LabelLanguages.json';
import siteDetailsJSON from '../data/SiteDetails.json';

export type PropertyDatatype =
    | 'commonsMedia'
    | 'entity-schema'
    | 'external-id'
    | 'geo-shape'
    | 'globe-coordinate'
    | 'math'
    | 'monolingualtext'
    | 'musical-notation'
    | 'quantity'
    | 'string'
    | 'tabular-data'
    | 'time'
    | 'url'
    | 'wikibase-form'
    | 'wikibase-item'
    | 'wikibase-lexeme'
    | 'wikibase-property'
    | 'wikibase-sense';

export interface PropertyUrlFormat {
    value?: string;
    rank: 'normal' | 'deprecated' | 'preferred';
    language?: string[];
    appliesWhenRegex?: string[];
}

export interface Property {
    id: string;
    label: string | null;
    description: string | null;
    alias: string[] | null;
    labels: Record<string, string>;
    descriptions: Record<string, string>;
    aliases: Record<string, string[]>;
    urlFormat?: PropertyUrlFormat[];
    urlFormatThirdParty?: PropertyUrlFormat[];
    formatRegex?: string[];
    datatype: PropertyDatatype;
}

export interface Language {
    code: string;
    autonym: string;
    name: string;
}

export interface SiteDetail {
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

export type SiteDetails = Record<string, SiteDetail>;

const properties = propertiesJson as Property[];
const propertiesById = new Map(properties.map((property) => [property.id, property]));
const getProperty = (propertyID: string): Property | null => propertiesById.get(propertyID) ?? null;

const datatypeTypes = datatypeTypeList as PropertyDatatype[];

const monolingualLanguages = monolingualLanguagesJSON as Language[];
const labelLanguages = labelLanguagesJson as Language[];

const siteDetails = siteDetailsJSON as SiteDetails;

export default {
    properties,
    getProperty,
    datatypeTypes,
    monolingualLanguages,
    labelLanguages,
    siteDetails
};


