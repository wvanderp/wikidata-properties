export interface Property {
    id: string;
    label: string;
    description: string;
    aliases?: string[];
    dataType: string;
    count: number;
}
export declare const properties: Property[];
export declare const getProperty: (propertyID: string) => Property | null;
