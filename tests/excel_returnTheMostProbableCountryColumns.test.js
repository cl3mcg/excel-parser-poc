// Import the required libraries
import { expect, expectTypeOf, test } from 'vitest'

// Import the required function(s)
import returnTheMostProbableCountryColumns from '../functions/excel_returnTheMostProbableCountryColumns.js'
import excelParse from './functions/excel_parse.js'

// Create variables used to specify the path of the file to read and parse.
const filePath = "./worksheets/";
const fileNames = [
    "BookToValidate01.xlsx",
    "BookToValidate02.xlsx"
];
const targetTab = "Book_01";

// Define the test(s)
for (const fileName of fileNames) {
    test(`File ${fileName} - Returning most probable country columns test`, () => {
        const valueToTest = returnTheMostProbableCountryColumns(excelParse(`${filePath}${fileName}`, targetTab).uniqueColumnsNamesArray)
        expectTypeOf(valueToTest).not.toBeNull
        expectTypeOf(valueToTest).not.toBeUndefined
        expectTypeOf(valueToTest).toBeArray()
        expect(valueToTest).not.toHaveLength(0)
    });
}