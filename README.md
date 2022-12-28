# wikidata-properties

This npm package provides a list of all Wikidata properties, which are used to describe and classify the data stored on Wikidata, a collaborative, multilingual knowledge base that can be read and edited by humans and machines.

This package can be useful for developers working with Wikidata or related projects, as it allows them to access a comprehensive and up-to-date list of Wikidata properties. The package includes type definitions and has been tested with the Mocha testing framework. It also has a build script that can be used to scrape the latest list of properties from Wikidata and generate the necessary files.

## how to use

To use the wikidata-properties package, you will first need to install it using npm:

```shell
npm install https://github.com/wvanderp/wikidata-properties
```

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

