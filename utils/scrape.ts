import fs from 'fs';
import path from 'path';
import axios from 'axios';

import siteDetails from './siteDetails';
import { getProperties } from './getProperties';

interface Response {
	batchcomplete: boolean;
	query: {
		wbcontentlanguages: {
			[key: string]: {
				code: string;
				autonym: string;
				name: string
			}
		}[]
	}
}

async function getLanguages(url: string, name: string) {
	console.log(`Getting ${name}...`)
	const response = await axios.get<Response>(url)
	const data = Object.values(response.data.query.wbcontentlanguages);

	fs.writeFileSync(path.join(__dirname, `../data/${name}.json`), JSON.stringify(data, null, 4));
}

async function getDataTypes() {
	console.log('Getting wikidata DataTypes...');
	const url = 'https://www.wikidata.org/w/api.php?action=query&meta=siteinfo&siprop=general&format=json&origin=*';
	const response = await axios.get(url);
	const data = Object.keys(response.data.query.general["wikibase-propertytypes"]);

	fs.writeFileSync(path.join(__dirname, '../data/datatypeTypes.json'), JSON.stringify(data, null, 4));
}

(async function scrape() {
	await getProperties();

	const monoUrl = 'https://www.wikidata.org/w/api.php?action=query&format=json&meta=wbcontentlanguages&formatversion=2&wbclcontext=monolingualtext&wbclprop=code%7Cautonym%7Cname';
	await getLanguages(monoUrl, 'MonolingualLanguages');

	const labelUrl = 'https://www.wikidata.org/w/api.php?action=query&format=json&meta=wbcontentlanguages&formatversion=2&wbclprop=code%7Cautonym%7Cname';
	await getLanguages(labelUrl, 'LabelLanguages');

	await getDataTypes();

	await siteDetails();
})()
