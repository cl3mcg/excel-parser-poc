// Starting the script
console.log('🌞 Starting Node.js process...');

// Importing the necessary libraries.
import dotenv from 'dotenv';
dotenv.config();

// Import the necessary functions
import excelParse from "./functions/excel_parse.js"
import returnTheMostProbableCountryColumns from "./functions/excel_returnTheMostProbableCountryColumns.js"
import getCleanedCountryCodes from "./functions/country_cca2.js"
import createCleanedExcelFile from "./functions/excel_createCleanFile.js"

// Create a variable used to specify the path of the file to read and parse.
const fileName = "./worksheets/BookToValidate01.xlsx"

// Create a variable to store the name of the targetted tab.
const targetTab = "Book_01"

// Adding a small console.log() to indicate that the function is running.
console.log('🧪 Processing the Excel file...')

// Extract the data from the Excel file.

const excelParsed = excelParse(fileName, targetTab);
const uniqueColumnsNamesArray = excelParsed.uniqueColumnsNamesArray;
const mostProbableCountryColumns = returnTheMostProbableCountryColumns(uniqueColumnsNamesArray);
const arrayOfCleanedData = await getCleanedCountryCodes(mostProbableCountryColumns, excelParsed.data)

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