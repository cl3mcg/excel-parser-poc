// Import the required .env variables
const transporeonSheetPassword = process.env.TRANSPOREON_SHEET_PASSWORD || null;

// Import the required libraries
import XLSX from "xlsx";

// Import the required functions
import findHeaderRow from "./excel_findHeaderRow.js"

/**
 * Parses an Excel file to extract data from a specified sheet and identify unique column names.
 * 
 * This function reads an Excel file, identifies the header row, and extracts the data from the specified sheet.
 * It returns an object containing the workbook, the sheet, the extracted data, and an array of unique column names.
 * 
 * @function excelParse
 * @param {string} fileName - The name of the Excel file to be parsed.
 * @param {string} targetTab - The name of the sheet within the Excel file to parse.
 * @returns {{workbookProvided: Object, sheet: Object, data: Array, uniqueColumnsNamesArray: Array}} An object containing the parsed data and metadata.
 * @throws Will throw an error if the file cannot be read or the sheet cannot be found.
 * 
 * @example
 * const parsedData = excelParse('example.xlsx', 'Sheet1');
 * console.log(parsedData);
 */
const excelParse = function (fileName, targetTab) {
    // Extract the data from the Excel file.
    let workbookProvided = null;
    let sheet = null;
    let data = null;

    try {
        workbookProvided = XLSX.readFile(fileName, { password: `${transporeonSheetPassword}` });
        if (!workbookProvided || workbookProvided instanceof Error) {
            throw new Error(`The Excel file cannot be read.`);
        }

        sheet = workbookProvided.Sheets[targetTab];
        if (!sheet || sheet instanceof Error) {
            throw new Error(`The spreadsheet(s) inside the Excel file cannot be read.`);
        }

        data = XLSX.utils.sheet_to_json(sheet);
        if (!data || data instanceof Error) {
            throw new Error(`The spreadsheet(s)'s data inside the Excel file cannot be parsed.`);
        }
    } catch (error) {
        console.error('💥 Error reading the Excel file', error);
        // Gracefully end the script
        console.log('🌜 Ending Node.js process...');
        process.exit(0);
    }

    // Find the header row
    const headerRow = findHeaderRow(sheet);
    const headerRowIndex = headerRow - 1;

    try {
        if (!headerRow || headerRowIndex < 0) {
            throw new Error(`The spreadsheet's header row cannot be identified.`);
        }
        data = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex });
    } catch (error) {
        console.error('💥 Error reading the Excel file', error);
        // Gracefully end the script
        console.log('🌜 Ending Node.js process...');
        process.exit(0);
    }

    // Create an array containing all the columns header names, without duplicates
    const allColumnsNamesArray = (data || []).map(obj => Object.keys(obj)).flat();
    const uniqueSet = new Set(allColumnsNamesArray);
    const uniqueColumnsNamesArray = Array.from(uniqueSet);

    return {
        workbookProvided,
        sheet,
        data,
        uniqueColumnsNamesArray
    };
}

// Export the function
export default excelParse;