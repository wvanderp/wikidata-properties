export interface Property {
    id: string;
    label: string;
    description: string;
    aliases?: string[];
    dataType: string;
    count: number;
}
export interface language {
    code: string;
    autonym: string;
    name: string;
}
export declare const properties: Property[];
export declare const getProperty: (propertyID: string) => Property | null;
export declare const datatypeTypes: string[];
export declare const monolingualLanguages: language[];
export declare const labelLanguages: language[];
