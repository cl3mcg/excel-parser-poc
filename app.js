// Start the script
console.log('🌞 Starting Node.js process...');

// Import the necessary libraries
import dotenv from 'dotenv';
dotenv.config();


// Import the necessary functions
import userChosenFile from "./functions/cli_chooseFile.js"
import excelParse from "./functions/excel_parse.js"
import returnTheMostProbableLaneIdColumn from './functions/excel_returnTheMostProbableLaneIdColumn.js';
import returnTheMostProbableCountryColumns from "./functions/excel_returnTheMostProbableCountryColumns.js"
import getCleanedCountryCodes from "./functions/country_cca2.js"
import createCleanedExcelFile from "./functions/excel_createCleanFile.js"

/**
 * Call the CLI script to prompt users their choice of Excel file and spreadsheet tab
 * @type {Object} userInput - An object containing the following properties:
 * @type {string} userInput.fileName - The name of the selected Excel file
 * @type {string} userInput.targetTab - The name of the selected spreadsheet tab
 * @type {string} fileName - The name of the selected Excel file
 * @type {string} targetTab - The name of the selected spreadsheet tab
 */
const userInput = await userChosenFile();
const fileName = userInput.fileName;
const targetTab = userInput.targetTab;

// Adding a small console.log() to indicate that the function is running.
console.log('🧪 Processing the Excel file...')

// Extract the data from the Excel file.

const excelParsed = excelParse(fileName, targetTab);
const uniqueColumnsNamesArray = excelParsed.uniqueColumnsNamesArray;
const mostProbableLaneIdColumn = returnTheMostProbableLaneIdColumn(uniqueColumnsNamesArray);
const mostProbableCountryColumns = returnTheMostProbableCountryColumns(uniqueColumnsNamesArray);
const arrayOfCleanedData = await getCleanedCountryCodes(mostProbableCountryColumns, mostProbableLaneIdColumn, excelParsed.data)

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
//     {
//     columnName: 'Country of Destination',
//     initialData: 'id',
//     correspondance: 'ID',
//     guessedCountry: 'Indonesia',
//     guessedCountryCode: 'ID',
//     source: 'cca2'
//     }
// ]

// Below, The function to create a clean file with the sheet_results
await createCleanedExcelFile(arrayOfCleanedData)

// Gracefully end the script
console.log('🌜 Ending Node.js process...');
process.exit(0);