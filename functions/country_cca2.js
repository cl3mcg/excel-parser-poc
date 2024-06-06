// Import the necessary libraries.
import dotenv from 'dotenv';
dotenv.config();
import countriesDataSet from "../assets/countries.json" assert { type: "json" };

// Import the necessary function
import fuzzyFind from "./clean_fuzzyFind.js"
import callMistral from "./clean_callMistral.js"

// The function below is going to clean the country data and return an array of objects containing the cleaned data and the source of the data.
// The function is looping over the columns that have been identified as containing some country data and is cleaning the data based on various FuzzySets.
// The source of the data is used to identify the original model that was used to clean the data and to be able to provide a more accurate result.
const getCleanedCountryCodes = async function (mostProbableCountryColumns, excelData) {
    console.log('🗺️ Now processing the country data...')
    excelData.length > 50 ? console.log(`🕓 That's a lot of data ! Hold tight, it might take some time...`) : null;

    const arrayOfResults = [];

    for (const column of mostProbableCountryColumns) {
        // Processing the cleaning.
        // By default, the first cleaning step is going to attempt to match the Excel data with the various country Fuzzyset.
        for (const row of excelData) {
            const columnHeaderName = column.columnName;
            const countryNameProvided = row[`${columnHeaderName}`] ? row[`${columnHeaderName}`].trim().toLowerCase() : ''; // The data provided in the Excel is trimmed and lowercased to ensure consistency and to improve the matching accuracy.
            // Setting up the result object that will be pushed to the arrayOfResults array.
            // This result object will contain the data processed by the 3 cleaning steps below and the source of the data.
            const result = {
                columnName: column.columnName,
                initialData: row[`${columnHeaderName}`] ? row[`${columnHeaderName}`].trim() : '',
                correspondance: null,
                guessedCountry: null,
                guessedCountryCode: null,
                source: null
            };

            // Below, the matchedCountry variable is going to be used to store the result of the matching process.
            // By default, its value is set to null. If a match is found, the matchedCountry variable will be updated with the result of the matching process.
            let matchedCountry = await fuzzyFind(countryNameProvided)

            // If the Fuzzysets above are not returning any result with a certainty over 0.7, the function is going to attempt to use Mistral to guess the country based on the data provided.
            if (!matchedCountry) {
                const chatResponse = await callMistral(countryNameProvided)

                // Below we are parsing the response from Mistral to ensure it is a valid 2-letter country code.
                // The if() statement below checks if the response from Mistral is a valid 2-letter country code and if it is, it assigns it to the bestCountryCodeProposal variable.
                if (chatResponse) {
                    matchedCountry = {
                        country: chatResponse,
                        source: 'mistral'
                    };
                }

            }

            // Finally, below a fallback is implemented to ensure that if all process doesn't return a matchedCountry value,
            // The result of the function would be the initially setup result object with the default null values.
            // In case of 0 results, the function will return end therefore ends.
            if (!matchedCountry) {
                arrayOfResults.push(result);
                continue;
            }

            // If the function was able to determine the country associated with the string from the Excel, it will assign it to the bestCountryCodeProposal variable.
            // The variable bestMatchProposal is the result of a ternary operator that checks if
            // 1) There is indeed an actual match.
            // 2) The result is not coming from Mistral (because Mistral returns directly the country code).
            // 3) The confidence result coming from the Fuzzyset is above 0.7 (which is a good confidence level).
            const bestMatchProposal = matchedCountry && matchedCountry.source !== 'mistral' && matchedCountry.country[0][0] >= 0.7 ? matchedCountry.country[0][1] : null;

            // The 2-letter country code is then assigned to the bestCountryCodeProposal variable based on the source of the match.
            // By default, the variable bestCountryCodeProposal is initialized and set to null, and is ready to be overwritten by the switch statement below.
            let bestCountryCodeProposal = null;

            // The switch statement below checks the source of the match and assigns the 2-letter country code to the bestCountryCodeProposal variable.
            // If the source of the match is Mistral, then bestCountryCodeProposal is directly set to the match, without any further processing
            // because Mistral returns directly the 2-letter cca2 country code.
            switch (matchedCountry.source) {
                case 'common':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.name.common === bestMatchProposal)[0].cca2 : null;
                    break;
                case 'official':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.name.official === bestMatchProposal)[0].cca2 : null;
                    break;
                case 'cca2':
                    bestCountryCodeProposal = bestMatchProposal ? bestMatchProposal : null;
                    break;
                case 'cca3':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.cca3 === bestMatchProposal)[0].cca2 : null;
                    break;
                case 'capital':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.capital.includes(bestMatchProposal))[0].cca2 : null;
                    break;
                case 'altSpelling':
                    bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.altSpellings.includes(bestMatchProposal))[0].cca2 : null;
                    break;
                case 'mistral':
                    bestCountryCodeProposal = matchedCountry.country;
                    break;
            }

            // Once all the data processed and the bestCountryCodeProposal variable is set, the result object is updated with the new data.
            result.guessedCountry = countriesDataSet.filter((country) => country.cca2 === bestCountryCodeProposal)[0]?.name.common;
            result.correspondance = matchedCountry.source !== 'mistral' ? bestMatchProposal : null;
            result.guessedCountryCode = bestCountryCodeProposal;
            result.source = matchedCountry.source;

            // The result object is then pushed to the arrayOfResults array.
            arrayOfResults.push(result);
        }
    }
    // Once all the rows of the Excel file have been processed, the function returns the arrayOfResults array.
    return arrayOfResults;
};

// Export the function
export default getCleanedCountryCodes