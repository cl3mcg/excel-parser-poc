/**
 * Imports necessary libraries.
 */
import FuzzySet from "fuzzyset";

/**
 * Imports necessary data.
 */
import countriesDataSet from "../assets/countries.json" assert { type: "json" };

/**
 * Set up various arrays of country spec data to be used as potential matches.
 * @type {string[]} country_CommonNames - Array of common names of countries.
 */
const country_CommonNames = countriesDataSet.map(countryData => countryData.name.common);
/**
 * Set up various arrays of country spec data to be used as potential matches.
 * @type {string[]} country_OfficialNames - Array of official names of countries.
 */
const country_OfficialNames = countriesDataSet.map(countryData => countryData.name.official);
/**
 * Set up various arrays of country spec data to be used as potential matches.
 * @type {string[]} country_cca2 - Array of two-letter country codes (CCA2).
 */
const country_cca2 = countriesDataSet.map(countryData => countryData.cca2);
/**
 * Set up various arrays of country spec data to be used as potential matches.
 * @type {string[]} country_cca3 - Array of three-letter country codes (CCA3).
 */
const country_cca3 = countriesDataSet.map(countryData => countryData.cca3);
/**
 * Set up various arrays of country spec data to be used as potential matches.
 * @type {string[]} country_capital - Array of capital cities of countries.
 */
const country_capital = countriesDataSet.map(countryData => countryData.capital).flat();
/**
 * Set up various arrays of country spec data to be used as potential matches.
 * @type {string[]} country_altSpellings - Array of alternative spellings of country names.
 */
const country_altSpellings = countriesDataSet.map(countryData => countryData.altSpellings).flat();

/**
 * Set up a FuzzySet to perform matching based on various factors.
 * 
 * FuzzySet is a data structure that performs approximate string matching and determines likely misspellings.
 * It returns an array of [score, matched_value] arrays, where the score is between 0 and 1, with 1 being a perfect match.
 * 
 * @type {FuzzySet} fuzzySet_CommonNames - FuzzySet for common country names.
 */
const fuzzySet_CommonNames = FuzzySet(country_CommonNames);
/**
 * Set up a FuzzySet to perform matching based on various factors.
 * FuzzySet is a data structure that performs approximate string matching and determines likely misspellings.
 * It returns an array of [score, matched_value] arrays, where the score is between 0 and 1, with 1 being a perfect match.
 * 
 * @type {FuzzySet} fuzzySet_OfficialNames - FuzzySet for official country names.
 */
const fuzzySet_OfficialNames = FuzzySet(country_OfficialNames);
/**
 * Set up a FuzzySet to perform matching based on various factors.
 * FuzzySet is a data structure that performs approximate string matching and determines likely misspellings.
 * It returns an array of [score, matched_value] arrays, where the score is between 0 and 1, with 1 being a perfect match.
 * 
 * @type {FuzzySet} fuzzySet_cca2 - FuzzySet for two-letter country codes (CCA2).
 */
const fuzzySet_cca2 = FuzzySet(country_cca2);
/**
 * Set up a FuzzySet to perform matching based on various factors.
 * FuzzySet is a data structure that performs approximate string matching and determines likely misspellings.
 * It returns an array of [score, matched_value] arrays, where the score is between 0 and 1, with 1 being a perfect match.
 * 
 * @type {FuzzySet} fuzzySet_cca3 - FuzzySet for three-letter country codes (CCA3).
 */
const fuzzySet_cca3 = FuzzySet(country_cca3);
/**
 * Set up a FuzzySet to perform matching based on various factors.
 * FuzzySet is a data structure that performs approximate string matching and determines likely misspellings.
 * It returns an array of [score, matched_value] arrays, where the score is between 0 and 1, with 1 being a perfect match.
 * 
 * @type {FuzzySet} fuzzySet_capital - FuzzySet for capital cities of countries.
 */
const fuzzySet_capital = FuzzySet(country_capital);
/**
 * Set up a FuzzySet to perform matching based on various factors.
 * FuzzySet is a data structure that performs approximate string matching and determines likely misspellings.
 * It returns an array of [score, matched_value] arrays, where the score is between 0 and 1, with 1 being a perfect match.
 * 
 * @type {FuzzySet} fuzzySet_altSpellings - FuzzySet for alternative spellings of country names.
 */
const fuzzySet_altSpellings = FuzzySet(country_altSpellings);

/**
 * fuzzyFind finds a country based on the provided name or code.
 * 
 * This function attempts to match the provided country name or code with various sets of country data 
 * using fuzzy matching. It checks common names, official names, two-letter codes (cca2), three-letter 
 * codes (cca3), capital names, and alternative spellings. If a match is found with a similarity score 
 * of 0.7 or higher, it returns the matched country information along with the source of the match.
 * 
 * @async
 * @function fuzzyFind
 * @param {string} countryNameProvided - The pseudo-name or code of the country to query.
 * @returns {Promise<{country: Array, source: string} | null>} A promise that resolves to an object containing 
 * the matched country information and the source of the match if a valid match is found, otherwise null.
 * @throws {Error} Will throw an error if an unexpected issue occurs during processing.
 */
const fuzzyFind = async function (countryNameProvided) {
    let matchedCountry = null;

    const checkMatch = (fuzzySet, source) => {
        const result = fuzzySet.get(countryNameProvided);
        if (result && result.length > 0 && result[0][0] >= 0.7) {
            return { country: result, source };
        }
        return null;
    };

    matchedCountry = checkMatch(fuzzySet_CommonNames, 'common')
        || checkMatch(fuzzySet_OfficialNames, 'official')
        || (countryNameProvided.length === 2 ? checkMatch(fuzzySet_cca2, 'cca2') : null)
        || checkMatch(fuzzySet_cca3, 'cca3')
        || checkMatch(fuzzySet_capital, 'capital')
        || checkMatch(fuzzySet_altSpellings, 'altSpelling');

    return matchedCountry;
};

export default fuzzyFind;