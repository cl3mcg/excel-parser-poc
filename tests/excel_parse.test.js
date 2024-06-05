// Import the required libraries
import { expectTypeOf, test } from 'vitest'

// Import the required function(s)
import excelParse from '../functions/excel_parse.js'

// Create variables used to specify the path of the file to read and parse.
const filePath = "./worksheets/";
const fileNames = [
    "BookToValidate01.xlsx",
    "BookToValidate02.xlsx"
];
const targetTab = "Book_01";

// Define the test(s)
for (const fileName of fileNames) {
    test('Excel file path test', () => {
        expectTypeOf(`${filePath}${fileName}`).not.toBeNull();
        expectTypeOf(`${filePath}${fileName}`).not.toBeUndefined();
        expectTypeOf(`${filePath}${fileName}`).toBeString();
    });

    test('Excel tab name test', () => {
        expectTypeOf(`${filePath}${fileName}`).not.toBeNull();
        expectTypeOf(`${filePath}${fileName}`).not.toBeUndefined();
        expectTypeOf(`${filePath}${fileName}`).toBeString();
    });

    test('Excel parsing test', () => {
        expectTypeOf(excelParse(`${filePath}${fileName}`, targetTab)).not.toBeNull();
        expectTypeOf(excelParse(`${filePath}${fileName}`, targetTab)).not.toBeUndefined();
        expectTypeOf(excelParse(`${filePath}${fileName}`, targetTab)).toBeArray();
    });
}