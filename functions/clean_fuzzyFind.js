// Import the necessary librairies
import FuzzySet from "fuzzyset";

// Import the necessary data
import countriesDataSet from "../assets/countries.json" assert { type: "json" };

// Set up various array of country spec data to be used as potential matches
const country_CommonNames = countriesDataSet.map(countryData => countryData.name.common);
const country_OfficialNames = countriesDataSet.map(countryData => countryData.name.official);
const country_cca2 = countriesDataSet.map(countryData => countryData.cca2);
const country_cca3 = countriesDataSet.map(countryData => countryData.cca3);
const country_capital = countriesDataSet.map(countryData => countryData.capital).flat();
const country_altSpellings = countriesDataSet.map(countryData => countryData.altSpellings).flat();

// Set up various FuzzySet to perform matching based on various factors
const fuzzySet_CommonNames = new FuzzySet(country_CommonNames);
const fuzzySet_OfficialNames = new FuzzySet(country_OfficialNames);
const fuzzySet_cca2 = new FuzzySet(country_cca2);
const fuzzySet_cca3 = new FuzzySet(country_cca3);
const fuzzySet_capital = new FuzzySet(country_capital);
const fuzzySet_altSpellings = new FuzzySet(country_altSpellings);

// Define function
const fuzzyFind = async function (countryNameProvided) {

    let matchedCountry = null;

    if (fuzzySet_CommonNames.get(countryNameProvided) && fuzzySet_CommonNames.get(countryNameProvided).length > 0 && fuzzySet_CommonNames.get(countryNameProvided)[0][0] >= 0.7) {
        matchedCountry = {
            country: fuzzySet_CommonNames.get(countryNameProvided),
            source: 'common'
        };
    } else if (fuzzySet_OfficialNames.get(countryNameProvided) && fuzzySet_OfficialNames.get(countryNameProvided).length > 0 && fuzzySet_OfficialNames.get(countryNameProvided)[0][0] >= 0.7) {
        matchedCountry = {
            country: fuzzySet_OfficialNames.get(countryNameProvided),
            source: 'official'
        };
    } else if (countryNameProvided.length === 2 && fuzzySet_cca2.get(countryNameProvided) && fuzzySet_cca2.get(countryNameProvided).length > 0 && fuzzySet_cca2.get(countryNameProvided)[0][0] >= 0.7) {
        matchedCountry = {
            country: fuzzySet_cca2.get(countryNameProvided),
            source: 'cca2'
        };
    } else if (fuzzySet_cca3.get(countryNameProvided) && fuzzySet_cca3.get(countryNameProvided).length > 0 && fuzzySet_cca3.get(countryNameProvided)[0][0] >= 0.7) {
        matchedCountry = {
            country: fuzzySet_cca3.get(countryNameProvided),
            source: 'cca3'
        };
    } else if (fuzzySet_capital.get(countryNameProvided) && fuzzySet_capital.get(countryNameProvided).length > 0 && fuzzySet_capital.get(countryNameProvided)[0][0] >= 0.7) {
        matchedCountry = {
            country: fuzzySet_capital.get(countryNameProvided),
            source: 'capital'
        };
    } else if (fuzzySet_altSpellings.get(countryNameProvided) && fuzzySet_altSpellings.get(countryNameProvided).length > 0 && fuzzySet_altSpellings.get(countryNameProvided)[0][0] >= 0.7) {
        matchedCountry = {
            country: fuzzySet_altSpellings.get(countryNameProvided),
            source: 'altSpelling'
        };
    }

    return matchedCountry

};

export default fuzzyFind;