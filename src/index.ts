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
    datatype: typeof datatypeTypeList[number];
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

const properties = propertiesJson as Property[];
const getProperty = (propertyID: string): Property | null => properties.find((r) => r.id === propertyID) ?? null

const datatypeTypes = datatypeTypeList;

const monolingualLanguages = monolingualLanguagesJSON as language[]
const labelLanguages = labelLanguagesJson as language[]

const siteDetails = siteDetailsJSON as SiteDetails;

export default {
    properties,
    getProperty,
    datatypeTypes,
    monolingualLanguages,
    labelLanguages,
    siteDetails
}


