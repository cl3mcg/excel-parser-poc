// Importing the necessary libraries.
import dotenv from 'dotenv';
dotenv.config();
import XLSX from "xlsx";
import Excel from "exceljs";
import FuzzySet from "fuzzyset";
import MistralClient from "@mistralai/mistralai";
import countriesDataSet from "./assets/countries.json" assert { type: "json" };
import headerNames_country from "./assets/headerNames_country.json" assert { type: "json" };
const apiKey = process.env.MISTRAL_API_KEY || null;
const client = new MistralClient(apiKey);

// Create a variable used to specify the path of the file to read and parse.
const filename = "./BookToValidate03.xlsx"

// Create a variable to store the name of the targetted tab.
const targetTab = "Book_02"

// Adding a small console.log() to indicate that the function is running.
console.log('Processing the Excel file...')

// Extract the data from the Excel file.
const workbookProvided = XLSX.readFile(filename);
const data = XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab]);

// Create an array containing all the columns header names, without duplicate
const allColumnsNamesArray = data.map(obj => Object.keys(obj)).flat()
const uniqueSet = new Set(allColumnsNamesArray);
const uniqueColumnsNamesArray = Array.from(uniqueSet);

// Setting up a FuzzySet to perform matching based on probable country columns names.
const fuzzySet_headerNames_country = new FuzzySet(headerNames_country);

// Performing a comparison between the country header name's FuzzySet and the Excel file column names
// The operation below is creating an array containing objects representing each column in the Excel file.
// For each object, a probability score from 0 to 1 is calculated based on the similarities of the name of the column and anything
// that would identify this column as a 'Country' column.
const probabilityCalculation = uniqueColumnsNamesArray.map((value) => fuzzySet_headerNames_country.get(value.toLowerCase()))
const probabilityResult = probabilityCalculation.map(el => new Object({
    columnIndex: probabilityCalculation.indexOf(el),
    columnName: uniqueColumnsNamesArray[probabilityCalculation.indexOf(el)], // Another way to better understand this is 'columnName: uniqueColumnsNamesArray[this.columnIndex]' but this is not accessible in arrow functions.
    bestProbabilityResult: !el ? 0 : Math.max(...el.flat().filter(val => typeof val === 'number'))
}))

// Once the probabilityResult obtained, the returnTheMostProbableCountryColumns function is going to return the columns that are identified
// to be the most likely to contain country data.
// It is also possible to have multiple columns containing country data (Origin country **and** Destination country for example)
// In this case the returnTheMostProbableCountryColumns function retruns an array that contains various objects, one for each column.
// In any way, the returnTheMostProbableCountryColumns returns an array containing one or more objects.
const returnTheMostProbableCountryColumns = function () {
    if (
        probabilityResult.filter(el => el.bestProbabilityResult >= 0.975).length >= 2
    ) {
        return probabilityResult.filter(el => el.bestProbabilityResult >= 0.975)
    }
    return [probabilityResult.sort((el1, el2) => el2.bestProbabilityResult - el1.bestProbabilityResult)[0]]
}

const mostProbableCountryColumns = returnTheMostProbableCountryColumns()
// console.log('mostProbableCountryColumns', mostProbableCountryColumns)

// Ultimatly, the mostProbableCountryColumns variable output has the following structure.
// [
//     {
//       columnIndex: 1,
//       columnName: 'Country of Origin',
//       bestProbabilityResult: 1
//     },
//     {
//       columnIndex: 2,
//       columnName: 'Dest Country',
//       bestProbabilityResult: 1
//     }
// ]

// Setting up various array of country spec data to be used as potential matches.
const country_CommonNames = countriesDataSet.map(countryData => countryData.name.common);
const country_OfficialNames = countriesDataSet.map(countryData => countryData.name.official);
const country_cca2 = countriesDataSet.map(countryData => countryData.cca2);
const country_cca3 = countriesDataSet.map(countryData => countryData.cca3);
const country_capital = countriesDataSet.map(countryData => countryData.capital).flat();
const country_altSpellings = countriesDataSet.map(countryData => countryData.altSpellings).flat();

// Setting up various FuzzySet to perform matching based on various factors.
const fuzzySet_CommonNames = new FuzzySet(country_CommonNames);
const fuzzySet_OfficialNames = new FuzzySet(country_OfficialNames);
const fuzzySet_cca2 = new FuzzySet(country_cca2);
const fuzzySet_cca3 = new FuzzySet(country_cca3);
const fuzzySet_capital = new FuzzySet(country_capital);
const fuzzySet_altSpellings = new FuzzySet(country_altSpellings);

// The function below is going to clean the country data and return an array of objects containing the cleaned data and the source of the data.
// The function is looping over the columns that have been identified as containing some country data and is cleaning the data based on various FuzzySets.
// The source of the data is used to identify the original model that was used to clean the data and to be able to provide a more accurate result.
const cleanedCountryCodes = async function () {
    const arrayOfResults = [];
    for (const column of mostProbableCountryColumns) {
        // Processing the cleaning.
        // By default, the first cleaning step is going to attempt to match the Excel data with the various country Fuzzyset.
        for (const row of data) {
            const columnHeaderName = column.columnName;
            const countryNameProvided = row[`${columnHeaderName}`].trim().toLowerCase(); // The data provided in the Excel is trimmed and lowercased to ensure consistency and to improve the matching accuracy.
            // console.log('Currently processing the input: ', countryNameProvided);
            // Setting up the result object that will be pushed to the arrayOfResults array.
            // This result object will contain the data processed by the 3 cleaning steps below and the source of the data.
            const result = {
                columnName: column.columnName,
                initialData: row[`${columnHeaderName}`].trim(),
                correspondance: null,
                guessedCountry: null,
                guessedCountryCode: null,
                source: null
            };

            // Below, the matchedCountry variable is going to be used to store the result of the matching process.
            // By default, its value is set to null. If a match is found, the matchedCountry variable will be updated with the result of the matching process.
            let matchedCountry = null;

            // The first cleaning step is going to attempt to match the Excel data with the various country Fuzzyset.
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

            // If the Fuzzysets above are not returning any result with a certainty over 0.7, the function is going to attempt to use Mistral to guess the country based on the data provided.
            if (!matchedCountry) {
                const chatResponse = await client.chat({
                    model: 'mistral-small-latest',
                    messages: [{
                        role: 'user', content: `
                        You are provided with a string that could be a country name or related data.
                        This string may contain typos, errors, or be in a language other than English. Your task is to determine the most probable country associated with the string provided and return its 2-letter ISO 3166-1 alpha-2 (cca2) country code.
                        You should only return the 2-letter country code and nothing else, do not provide any comments nor notes, nor explanations of any kind.
                        If the string is unclear or you cannot confidently identify the country, return "null".
                        Here are some examples to help you understand the output expected from you:

                            Input: "UnitStat."
                            Expected result from your side: US
                            Expected result's length: 2

                            Input: "Pérou"
                            Expected result from your side: PE
                            Expected result's length: 2

                            Input: "cihna"
                            Expected result from your side: CN
                            Expected result's length: 2

                            Input: "jApAAAAn"
                            Expected result from your side: JP
                            Expected result's length: 2

                            Input: "Korea, Souh"
                            Expected result from your side: KR
                            Expected result's length: 2

                            Input: "Audalia"
                            Expected result from your side: AU
                            Expected result's length: 2

                            Input: "IRL"
                            Expected result from your side: IE
                            Expected result's length: 2

                            Input: "London"
                            Expected result from your side: GB
                            Expected result's length: 2

                            Input: "澳门"
                            Expected result from your side: MO
                            Expected result's length: 2

                            Input: "Marokko"
                            Expected result from your side: MA
                            Expected result's length: 2

                            Input: "USA/CANADA"
                            Expected result from your side: null

                            Input: "JdDkjdz84d"
                            Expected result from your side: null

                            Input: "UA"
                            Expected result from your side: UA
                            Expected result's length: 2

                            Input: "FRFOS"
                            Expected result from your side: FR
                            Expected result's length: 2

                            Input: "Düsseldorf"
                            Expected result from your side: DE
                            Expected result's length: 2

                        Your output will be used as an argument in a function, therefore, it is important to only return the 2-letter country code and nothing else, do not provide any comments nor notes, nor explanations of any kind, your response should only be 2 characters long (or "null" when applicable) and it should not contain any single or double quotes.
                        Ultimately, if you are able to determine the country code associated with the string, your answer should only be 2 characters long.
                        Finally, here is the string you have to analyze: ${countryNameProvided}
                    `}]
                });

                // Below we are parsing the response from Mistral to ensure it is a valid 2-letter country code.
                // The if() statement below checks if the response from Mistral is a valid 2-letter country code and if it is, it assigns it to the bestCountryCodeProposal variable.
                if (chatResponse.choices[0].message.content !== "null"
                    && chatResponse.choices[0].message.content.length === 2
                    && countriesDataSet.filter((country) => country.cca2 === chatResponse.choices[0].message.content).length > 0) {
                    matchedCountry = {
                        country: chatResponse.choices[0].message.content,
                        source: 'mistral'
                    };
                }

                // Here a time out is implemented to ensure that the function does not trigger a request rate limit from the Mistral API
                // setTimeout(() => { }, 500);
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
            // console.log('Currently processing the input with the following method: ', matchedCountry.source);

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

            // console.log('The result of the analysis is ', result);
            // The result object is then pushed to the arrayOfResults array.
            arrayOfResults.push(result);
        }
    }
    // Once all the rows of the Excel file have been processed, the function returns the arrayOfResults array.
    return arrayOfResults;
};

// The arrayOfCleanedData variable is then set to the result of the call to the cleanCountryCodes function.
const arrayOfCleanedData = await cleanedCountryCodes();


// console.log('arrayOfCleanedData', arrayOfCleanedData)

// Example of the returned value of arrayOfCleanedData:
// [
//     {
//       columnName: 'Country of Origin',
//       initialData: 'argentina',
//       correspondance: 'Argentina',
//       guessedCountry: 'Argentina',
//       guessedCountryCode: 'AR',
//       source: 'common'
//     },
//     {
//       columnName: 'Country of Destination',
//       initialData: 'brazil',
//       correspondance: 'Brazil',
//       guessedCountry: 'Brazil',
//       guessedCountryCode: 'BR',
//       source: 'common'
//     },
// {
//   columnName: 'Country of Destination',
//   initialData: 'id',
//   correspondance: 'ID',
//   guessedCountry: 'Indonesia',
//   guessedCountryCode: 'ID',
//   source: 'cca2'
// }
// ]

// Below, to create and write on an Excel file, we are going to use the 'exceljs' library.
// Create a new workbook.
const workbook = new Excel.Workbook();

// Add a new worksheet.
const worksheet = workbook.addWorksheet('sheet_results');

// The function prodcueResultObject is defined below.
// It takes as argument an array of objects, and returns an object with the following structure:
// resultObject = {
//     columnHeaders: [ 'Initial data', 'Country of Origin', 'Dest Country' ],
//     colData: [ [ [Object], [Object] ], [ [Object], [Object] ] ]
//   }
// Content of resultObject.colData [
//     [
//       {
//         "columnName": "Country of Origin",
//         "initialData": "US/Canada",
//         "correspondance": null,
//         "guessedCountry": null,
//         "guessedCountryCode": null,
//         "source": null
//       },
//       {
//         "columnName": "Country of Origin",
//         "initialData": "Zimbabyoue",
//         "correspondance": "Zimbabwe",
//         "guessedCountry": "Zimbabwe",
//         "guessedCountryCode": "ZW",
//         "source": "common"
//       }
//     ],
//     [
//       {
//         "columnName": "Dest Country",
//         "initialData": "SE- 59530 Mjölby",
//         "correspondance": null,
//         "guessedCountry": "Sweden",
//         "guessedCountryCode": "SE",
//         "source": "mistral"
//       },
//       {
//         "columnName": "Dest Country",
//         "initialData": "9212 Lokeren, Belgium",
//         "correspondance": null,
//         "guessedCountry": "Belgium",
//         "guessedCountryCode": "BE",
//         "source": "mistral"
//       }
//     ]
//   ]
// The function is called with the arrayOfCleanedData variable as argument, and the result is stored in the resultObject variable.
// Inside the columnHeaders, a first value of 'Initial data' is hardcoded to get a clear comparison between the data initially provided and the result of the cleaning.

const produceResultObject = function (arrayOfCleanedData) {
    const columnNames = [`Initial data`, ...new Set(arrayOfCleanedData.map(item => item.columnName))];
    const colData = [];

    columnNames.forEach(columnName => {
        const filteredArray = arrayOfCleanedData.filter(item => item.columnName === columnName);
        filteredArray.length ? colData.push(filteredArray) : null;
    });

    return { columnHeaders: columnNames, colData: colData };
};

const resultObject = produceResultObject(arrayOfCleanedData);

// console.log('resultObject', resultObject);
// console.log('Content of resultObject.colData', JSON.stringify(resultObject.colData, null, 2));

// Below we declare 2 variables that will hold the content of the columns and the rows of the result file.
let columns = [];
let rows = [];

// Helper function to convert index to Excel column letters
// This will be helpfull after when we need to identify columns by their position.
// This function was (obviously) provided by an LLM code assistant.
function getExcelColumnLetter(index) {
    let letter = '';
    while (index >= 0) {
        letter = String.fromCharCode((index % 26) + 65) + letter;
        index = Math.floor(index / 26) - 1;
    }
    return letter;
}

// The if() statement below is checking if there is only 1 single column to work on or not.
// If there is one single column, the work is done only once, ontherwise, a map method is used to work on each individual column identified.
if (resultObject.colData.length === 1) {
    const columnName = resultObject.colData[0][0].columnName;

    columns = [
        { header: columnName, key: columnName, name: columnName, filterButton: true },
        { header: `Clean - ${columnName}`, key: `Clean - ${columnName}`, name: `Clean - ${columnName}`, filterButton: true },
        { header: `Source - ${columnName}`, key: `Source - ${columnName}`, name: `Source - ${columnName}`, filterButton: true }
    ];

    rows = resultObject.colData[0].map(data => [data.initialData, data.guessedCountryCode, data.source]);
} else {
    const columnNames = resultObject.colData.map(data => data[0].columnName);

    columns = columnNames.flatMap(columnName => [
        { header: columnName, key: columnName, name: columnName, filterButton: true },
        { header: `Clean - ${columnName}`, key: `Clean - ${columnName}`, name: `Clean - ${columnName}`, filterButton: true },
        { header: `Source - ${columnName}`, key: `Source - ${columnName}`, name: `Source - ${columnName}`, filterButton: true }
    ]);

    // Populate rows correctly for all columns
    for (let i = 0; i < resultObject.colData[0].length; i++) {
        let row = [];
        resultObject.colData.forEach(colData => {
            row.push(colData[i].initialData);
            row.push(colData[i].guessedCountryCode);
            row.push(colData[i].source);
        });
        rows.push(row);
    }
}

// Add the table to the worksheet
worksheet.addTable({
    name: 'result_table',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
        theme: 'TableStyleLight8',
        showRowStripes: false
    },
    columns: columns,
    rows: rows
});

// Select all the columns that contain the word "Clean" in their key
const cleanColumns = columns.filter(col => col && col.key && col.key.includes('Clean'));

// Map custom column keys to Excel column letters
const columnKeyToLetter = {};
cleanColumns.forEach((col) => {
    const colIndex = columns.findIndex(c => c.key === col.key) + 1;
    columnKeyToLetter[col.key] = getExcelColumnLetter(colIndex - 1);
});

// console.log('Clean Columns:', cleanColumns);
// console.log('Column Key to Letter Mapping:', columnKeyToLetter);

// Iterate over each clean column
cleanColumns.forEach(col => {
    try {
        // Get the column object from the worksheet using mapped letter
        const colLetter = columnKeyToLetter[col.key];
        const colObj = worksheet.getColumn(colLetter);

        // console.log(`Processing column: ${col.key} (${colLetter})`);

        // Check if the column object is valid
        if (colObj) {
            // Iterate over each cell in the column, skipping the header row
            colObj.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
                // Apply the desired styles to the cell if it is not in the header row
                // If a result is found, the cell is green, if failed, it is red
                if (rowNumber > 1) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: cell.value ? 'CCFFCC' : 'FFCCCC' },
                    };
                }
            });
        } else {
            console.error(`Column with key ${col.key} not found.`);
        }
    } catch (error) {
        console.error(`Error processing column ${col.key}:`, error);
    }
});

// Save the workbook to a file
try {
    workbook.xlsx.writeFile(`results_${Date.now()}.xlsx`);
    // Adding a small console.log() to indicate that the function has ran succesfully.
    console.log(`The data has been cleaned and results are inside the 'results_${Date.now()}.xlsx' file`)
} catch (error) {
    console.error('Error writting the Excel file', error)
}
