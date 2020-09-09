import wtf from "wtf_wikipedia";
import * as fs from 'fs';

// ---------------------------------------------------------------------
// types

export interface props {
    ID: {
        text: string;
        links?: ({
            text: string;
            type: string;
            page: string;
        })[] | null;
    };
    col2: {
        text: string;
    };
    col3: {
        text: string;
        links?: ({
            type: string;
            page: string;
            text?: string | null;
        })[] | null;
        formatting?: {
            italic?: (string)[] | null;
            bold?: (string)[] | null;
        } | null;
    };
    col4: {
        text: string;
    };
    col5: {
        text: string;
    };
    Count: {
        text: string;
        number: number;
    };
}

// ---------------------------------------------------------------------
// code

(async function scrape() {
    const page = await wtf.fetch('https://www.wikidata.org/wiki/Wikidata:Database_reports/List_of_properties/all');

    if (page === null) {
        throw Error('Received no data from wikidata');
    }

    const properties = (page.table(0).json() as props[]).map((property) => {
        return {
            id: property.ID.text,
            label: property.col2.text,
            description: property.col3.text,
            aliases: property.col4.text.split(',').map((r) => r.trim()).filter((r) => r),
            dataType: property.col5.text,
            count: property.Count.number
        }
    })

    fs.writeFileSync('./data/properties.json', JSON.stringify(properties, null, 4))
})()
