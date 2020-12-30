import propertiesJson from '../data/properties.json';
import datatypeTypeList from '../data/datatypeTypes.json';
import monolingualLanguagesJSON from '../data/MonolingualLanguages.json';
import labelLanguagesJson from '../data/LabelLanguages.json';
import siteDetailsJSON from '../data/SiteDetails.json'

export interface Property {
    id: string;
    label: string;
    description: string;
    aliases?: string[];
    dataType: string;
    count: number;
}

export interface language{
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

const propertiesList = propertiesJson as Property[]

export const properties = propertiesList;
export const getProperty = (propertyID: string): Property | null => propertiesList.find((r) => r.id === propertyID) ?? null

export const datatypeTypes = datatypeTypeList;

export const monolingualLanguages = monolingualLanguagesJSON as language[]
export const labelLanguages = labelLanguagesJson as language[]

export const siteDetails = siteDetailsJSON as SiteDetails;


