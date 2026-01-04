import fs from 'fs';
import axios from "axios";
import { WikidataResponse, Item } from "@wmde/wikibase-datamodel-types"
import { chunk, fromPairs } from './utils/arrayUtils';
import delay from './utils/delay';

const axiosConfig = {
    headers: {
        'User-Agent': 'wikidata-properties/1.0.0 (https://github.com/wvanderp/wikidata-properties)'
    },
    timeout: 120000, // 120 seconds timeout (increased from 60)
};

interface ApiResponse {
    head: Record<string, string[]>;
    results: {
        bindings: {
            property: {
                type: string;
                value: string;
            }
        }[]
    }
}

type Property = Item & { datatype: string }

async function downloadEntries(ids: string[]) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${ids.join('|')}`
    return await axios.get<WikidataResponse>(url, axiosConfig)
}

export async function getProperties() {
    console.log('Getting properties...')
    const url = 'https://query.wikidata.org/sparql?query=SELECT%20%3Fproperty%20WHERE%20%7B%0A%20%20%3Fproperty%20wikibase%3ApropertyType%20%3FpropertyType.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2Cen%22.%20%7D%0A%7D&format=json'
    const page = await axios.get<ApiResponse>(url, axiosConfig);

    const ids = page.data.results.bindings.map(property => property.property.value.split('/').splice(-1)[0])
    console.log(`Found ${ids.length} properties to fetch`);

    const chunks = chunk(ids, 50)
    console.log(`Split into ${chunks.length} batches of 50`);

    const responses = [];
    for (let i = 0; i < chunks.length; i++) {
        console.log(`Fetching batch ${i + 1}/${chunks.length}...`);
        try {
            const response = await downloadEntries(chunks[i]);
            responses.push(response);

            // Add a delay between batches to avoid rate limiting
            if (i < chunks.length - 1) {
                await delay(1000);
            }
        } catch (error) {
            console.error(`Failed to fetch batch ${i + 1}, continuing with remaining batches...`);
            // Continue with other batches even if one fails
        }
    }

    if (responses.length === 0) {
        throw new Error('No successful responses received from API');
    }

    const items = responses.map((response => Object.values(response.data.entities))).flat() as Property[]
    console.log(`Successfully fetched ${items.length} properties`);

    const formattedItems = items
        .map(parseItem)
        .sort((a, b) => Number(a.id.split('P')[0]) - Number(b.id.split('P')[0]))

    fs.writeFileSync('./data/properties.json', JSON.stringify(formattedItems, null, 4))
}

function parseItem(item: Item & { datatype: string }) {
    return {
        id: item.id,
        label: item.labels['en']?.value ?? null,
        description: item.descriptions['en']?.value ?? null,
        alias: item.aliases['en']?.map(alias => alias.value) ?? null,

        labels: fromPairs(
            Object.values(item.labels).map(label => [label.language, label.value])
        ),
        descriptions: fromPairs(
            Object.values(item.descriptions).map(description => [description.language, description.value])
        ),
        aliases: fromPairs(
            Object.values(item.aliases).map(aliases => [aliases[0].language, aliases.map(alias => alias.value)])
        ),

        urlFormat: item.claims['P1630'] && item.claims['P1630']?.map(format => ({
            value: format?.mainsnak?.datavalue?.value,
            rank: format.rank,
            // @ts-expect-error
            language: format?.qualifiers?.P407?.map((qual) => qual?.datavalue?.value?.id),
            appliesWhenRegex: format?.qualifiers?.P8460?.map((regex) => regex?.datavalue?.value),
        })),
        urlFormatThirdParty: item.claims['P3303'] && item.claims['P3303']?.map(format => ({
            value: format?.mainsnak?.datavalue?.value,
            rank: format.rank,
            // @ts-expect-error
            language: format?.qualifiers?.P407?.map((qual) => qual?.datavalue?.value?.id),
            appliesWhenRegex: format?.qualifiers?.P8460?.map((regex) => regex?.datavalue?.value),
        })),

        formatRegex: item?.claims['P1793']?.map((claim) => claim.mainsnak.datavalue?.value),
        datatype: item.datatype
        // constraints: item.constraints,
    }
}
