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
 * @returns {Object} An object containing the parsed data and metadata.
 * - {Object} return.workbookProvided - The parsed workbook object.
 * - {Object} return.sheet - The parsed sheet object.
 * - {Array} return.data - The data extracted from the sheet.
 * - {Array} return.uniqueColumnsNamesArray - An array of unique column names found in the sheet.
 * @throws Will throw an error if the file cannot be read or the sheet cannot be found.
 * 
 * @example
 * const parsedData = excelParse('example.xlsx', 'Sheet1');
 * console.log(parsedData);
 */
const excelParse = function (fileName, targetTab) {
    // Extract the data from the Excel file.
    let workbookProvided;
    let sheet;
    let data;

    try {
        workbookProvided = XLSX.readFile(fileName, { password: `${transporeonSheetPassword}` }) ? XLSX.readFile(fileName, { password: `${transporeonSheetPassword}` }) : new Error(`The Excel file cannot be read.`);
        sheet = workbookProvided.Sheets[targetTab] ? workbookProvided.Sheets[targetTab] : new Error(`The speadsheet(s) inside the Excel file cannot be read.`);
        data = XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab]) ? XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab]) : new Error(`The speadsheet(s)'s data inside the Excel file cannot be parsed.`);
    } catch (error) {
        console.error('💥 Error reading the Excel file', error);
    }

    // Find the header row
    const headerRow = findHeaderRow(sheet);
    const headerRowIndex = headerRow - 1;

    try {
        headerRow && headerRowIndex && headerRow > 0 && headerRowIndex >= 0 ? null : new Error;
    } catch (error) {
        console.error('💥 Error finding the header row', error);
    }

    try {
        workbookProvided = XLSX.readFile(fileName, { password: `${transporeonSheetPassword}` });
        sheet = workbookProvided.Sheets[targetTab];
        data = XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab], { range: headerRowIndex });
    } catch (error) {
        console.error('💥 Error reading the Excel file', error);
    }

    // Create an array containing all the columns header names, without duplicates
    const allColumnsNamesArray = data.map(obj => Object.keys(obj)).flat();
    const uniqueSet = new Set(allColumnsNamesArray);
    const uniqueColumnsNamesArray = Array.from(uniqueSet);

    return {
        workbookProvided: workbookProvided,
        sheet: sheet,
        data: data,
        uniqueColumnsNamesArray: uniqueColumnsNamesArray
    };
}

// Export the function
export default excelParse;
