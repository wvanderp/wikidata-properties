import propertiesJson from '../data/properties.json';
import datatypeTypeList from '../data/datatypeTypes.json';

export interface Property {
    id: string;
    label: string;
    description: string;
    aliases?: string[];
    dataType: string;
    count: number;
}


const propertiesList = propertiesJson as Property[]

export const properties = propertiesList;
export const getProperty = (propertyID: string): Property | null => propertiesList.find((r) => r.id === propertyID) ?? null

export const datatypeTypes = datatypeTypeList;

