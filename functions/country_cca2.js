// Import necessary libraries.
import countriesDataSet from "../assets/countries.json" assert { type: "json" };

// Import the necessary functions.
import fuzzyFind from "./clean_fuzzyFind.js";
import callMistral from "./clean_callMistral.js";

/**
 * Cleans the country data from an Excel file and returns an array of objects containing the cleaned data and the source of the data.
 * @function getCleanedCountryCodes
 * @async
 * @param {Array<Object>} mostProbableCountryColumns - An array of objects containing the column names that have been identified as containing country data.
 * @param {Array<Object>} mostProbableLaneIdColumn - An array containing 1 single object containing the column name that have been identified as containing Lane ID data.
 * @param {Array<Object>} excelData - An array of objects containing the data from the Excel file.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects containing the cleaned country data and the source of the data.
 * @description This function cleans the country data and return an array of objects containing the cleaned data and the source of the data. The function is looping over the columns that have been identified as containing some country data and is cleaning the data based on various FuzzySets. The source of the data is used to identify the original model that was used to clean the data and to be able to provide a more accurate result.
 */
const getCleanedCountryCodes = async function (mostProbableCountryColumns, mostProbableLaneIdColumn, excelData) {
    console.log('🗺️ Now processing the country data...');
    if (excelData.length > 50) {
        console.log(`🕓 That's a lot of data! Hold tight, it might take some time...`);
    }

    const arrayOfResults = [];

    for (const column of mostProbableCountryColumns) {
        for (const row of excelData) {
            const columnHeaderName = column.columnName;
            const countryNameProvided = row[columnHeaderName]?.trim().toLowerCase() || ''; // The data provided in the Excel is trimmed and lowercased to ensure consistency and to improve the matching accuracy.

            /**
             * Represents a result object containing processed data and its source.
             * @typedef {Object} ResultObject
             * @property {string} laneId - The lane ID of the data row.
             * @property {string} columnName - The name of the column that contains the data.
             * @property {string} initialData - The initial data provided in the Excel file.
             * @property {Object|null} correspondance - The correspondance object returned by the FuzzySets or null if no match was found.
             * @property {string|null} guessedCountry - The guessed country name or null if no match was found.
             * @property {string|null} guessedCountryCode - The guessed country code or null if no match was found.
             * @property {string|null} source - The source of the data. Can be 'common', 'mistral' or null if no match was found.
             */
            const result = {
                laneId: `${row[mostProbableLaneIdColumn[0].columnName]}`,
                columnName: column.columnName,
                initialData: row[columnHeaderName]?.trim() || '',
                correspondance: '',
                guessedCountry: '',
                guessedCountryCode: '',
                source: ''
            };

            if (countryNameProvided.length <= 0) {
                arrayOfResults.push(result);
                continue;
            }

            /** @type {Object|string|null} */
            let matchedCountry = await fuzzyFind(countryNameProvided);

            if (!matchedCountry) {
                const chatResponse = await callMistral(countryNameProvided);
                if (chatResponse) {
                    matchedCountry = {
                        country: chatResponse,
                        source: 'mistral'
                    };
                }
                await new Promise(resolve => setTimeout(resolve, 100)); // Setup an artificial 100ms delay to avoid hitting Mistral's rate limit.
            }

            if (!matchedCountry) {
                arrayOfResults.push(result);
                continue;
            }

            /** @type {string|null} */
            const bestMatchProposal = matchedCountry && matchedCountry.source !== 'mistral' && matchedCountry.country[0][0] >= 0.7 ? matchedCountry.country[0][1] : null;

            let bestCountryCodeProposal = null;

            switch (matchedCountry.source) {
                case 'common':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.find((country) => country.name.common === bestMatchProposal)?.cca2 : null;
                    break;
                case 'official':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.find((country) => country.name.official === bestMatchProposal)?.cca2 : null;
                    break;
                case 'cca2':
                    bestCountryCodeProposal = bestMatchProposal ? bestMatchProposal : null;
                    break;
                case 'cca3':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.find((country) => country.cca3 === bestMatchProposal)?.cca2 : null;
                    break;
                case 'capital':
                    // @ts-ignore
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.find((country) => country.capital.includes(bestMatchProposal))?.cca2 : null;
                    break;
                case 'altSpelling':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.find((country) => country.altSpellings.includes(bestMatchProposal))?.cca2 : null;
                    break;
                case 'mistral':
                    bestCountryCodeProposal = matchedCountry.country;
                    break;
            }

            // @ts-ignore
            result.guessedCountry = countriesDataSet.find((country) => country.cca2 === bestCountryCodeProposal)?.name.common || null;
            // @ts-ignore
            result.correspondance = matchedCountry.source !== 'mistral' ? bestMatchProposal : null;
            result.guessedCountryCode = bestCountryCodeProposal;
            result.source = matchedCountry.source;

            arrayOfResults.push(result);
        }
    }
    return arrayOfResults;
};

// Export the function
export default getCleanedCountryCodes;