import fs from 'fs';
import axios from "axios";
import _ from "lodash";
import { WikidataResponse, Item } from "@wmde/wikibase-datamodel-types"

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

type Property =  Item & {datatype: string}

async function downloadEntries(ids: string[]) {
    return await axios.get<WikidataResponse>(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${ids.join('|')}`)
}

export async function getProperties() {
    const page = await axios.get<ApiResponse>('https://query.wikidata.org/sparql?query=SELECT%20%3Fproperty%20WHERE%20%7B%0A%20%20%3Fproperty%20wikibase%3ApropertyType%20%3FpropertyType.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22en%2Cen%22.%20%7D%0A%7D&format=json');

    const ids = page.data.results.bindings.map(property => property.property.value.split('/').splice(-1)[0])
    const chunks = _.chunk(ids, 50)
    const responses = await Promise.all(chunks.map(async (chuck) => await downloadEntries(chuck)))

    const items = responses.map((response => Object.values(response.data.entities))).flat() as Property[]

    const formattedItems = items
    .map(parseItem)
    .sort((a,b) => Number(a.id.split('P')[0]) - Number(b.id.split('P')[0]))

    fs.writeFileSync('./data/properties.json', JSON.stringify(formattedItems, null, 4))
}

function parseItem(item: Item & {datatype: string}) {
    return {
        id: item.id,
        label: item.labels['en']?.value ?? null,
        description: item.descriptions['en']?.value ?? null,
        alias: item.aliases['en']?.map(alias => alias.value) ?? null,

        labels: _.fromPairs(
            Object.values(item.labels).map(label => [label.language, label.value])
        ),
        descriptions: _.fromPairs(
            Object.values(item.descriptions).map(description => [description.language, description.value])
        ),
        aliases: _.fromPairs(
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