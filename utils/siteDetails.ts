import puppeteer from 'puppeteer';
import fs from 'fs';

export default async function getSiteDetails() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.wikidata.org/wiki/Wikidata:Main_Page');

    const sites = await page.evaluate(() => {
        // @ts-ignore
        return mw.config.get('wbSiteDetails')
    })

    await browser.close();

    fs.writeFileSync('./data/SiteDetails.json', JSON.stringify(sites, undefined, 4))
}