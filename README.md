# wikidata-properties

This npm package provides a list of all Wikidata properties, which are used to describe and classify the data stored on Wikidata, a collaborative, multilingual knowledge base that can be read and edited by humans and machines.

This package can be useful for developers working with Wikidata or related projects, as it allows them to access a comprehensive and up-to-date list of Wikidata properties. The package includes type definitions and is tested with [Vitest](https://vitest.dev). It also has a build script that can be used to scrape the latest list of properties from Wikidata and generate the necessary files.

## Installation

Install it using your favorite package manager:

```shell
npm install wikidata-properties
# or
pnpm add wikidata-properties
```

## How to use

Once the package is installed, you can import it in your project like this:

```js
import wikidataProperties from 'wikidata-properties';
```

This will give you access to the following data and functions:

* An array of Property objects, which represent individual Wikidata properties. Each Property object has the following fields:
  * `id`: a string containing the property's ID
  * `label`: a string containing the property's label
  * `description`: a string containing the property's description
  * `alias`: an optional array of strings containing the property's aliases
  * `labels`: an optional object containing labels for the property in different languages
  * `descriptions`: an optional object containing descriptions for the property in different languages
  * `aliases`: an optional object containing aliases for the property in different languages
  * `datatype`: a string representing the property's datatype
* An array of language objects, which represent languages used in Wikidata. Each language object has the following fields:
  * `code`: a string containing the language's code
  * `autonym`: a string containing the language's autonym
  * `name`: a string containing the language's name
* An object called siteDetails, which contains information about various Wikidata sites. The object has keys representing site IDs, and the corresponding values are objects with the following fields:
  * `shortName`: a string containing the site's short name
  * `name`: a string containing the site's name
  * `id`: a string containing the site's ID
  * `pageUrl`: a string containing the site's page URL
  * `apiUrl`: a string containing the site's API URL
  * `languageCode`: a string containing the site's language code
  * `group`: a string containing the site's group
* A `getProperty` function, which allows you to look up a specific Wikidata property by its ID.
  * The function takes a property ID as an argument and returns the corresponding Property object, or null if no property with the given ID was found.

Here's an example of how you might use these data and functions in your code:

```typescript
import wikidataProperties from 'wikidata-properties';

// Get the label for the "country of citizenship" property in English
const citizenshipProperty = wikidataProperties.getProperty('P27');
const label = citizenshipProperty.labels['en'];
console.log(label); // "country of citizenship"

// Get the list of all Wikidata sites
const siteDetails = wikidataProperties.siteDetails;
console.log(siteDetails); // { ... }
```

## Development

Use the pnpm version specified in `package.json`.

```shell
pnpm install --frozen-lockfile
pnpm test
pnpm run build
```

`pnpm run scrape` refreshes the data from Wikidata. `pnpm run build` compiles the existing data into the publishable CommonJS and ES module bundles.

## Publishing

Releases are published from `.github/workflows/publish.yml` when a GitHub release with a tag matching the package version (for example, `v1.0.0`) is published. The workflow uses npm trusted publishing (OIDC), so it does not require a long-lived npm token.

Because trusted publishing can only be configured for an existing npm package, publish the first version manually from a clean checkout with two-factor authentication. Then configure the package on npm with this trusted publisher:

* Provider: GitHub Actions
* Repository owner: `wvanderp`
* Repository: `wikidata-properties`
* Workflow: `publish.yml`

Allow direct `npm publish` for the trusted publisher. After a successful automated release, set npm publishing access to require two-factor authentication and disallow tokens, and revoke any obsolete automation tokens.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
