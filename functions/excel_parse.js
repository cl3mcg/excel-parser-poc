// Import the required .env variables
const transporeonSheetPassword = process.env.TRANSPOREON_SHEET_PASSWORD || null;

// Import the required libraries
import XLSX from "xlsx";

// Import the required functions
import findHeaderRow from "./excel_findHeaderRow.js"

// Declare the function
const excelParse = function (fileName, targetTab) {
    // Extract the data from the Excel file.

    let workbookProvided
    let sheet
    let data

    try {
        workbookProvided = XLSX.readFile(fileName, { password: `${transporeonSheetPassword}` }) ? XLSX.readFile(fileName, { password: `${transporeonSheetPassword}` }) : new Error;
        sheet = workbookProvided.Sheets[targetTab] ? workbookProvided.Sheets[targetTab] : new Error;
        data = XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab]) ? XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab]) : new Error;
    } catch (error) {
        console.error('💥 Error reading the Excel file', error)
    }


    // Find the header row
    const headerRow = findHeaderRow(sheet);
    const headerRowIndex = headerRow - 1;


    try {
        headerRow && headerRowIndex && headerRow > 0 && headerRowIndex >= 0 ? null : new Error
    } catch {
        console.error('💥 Error finding the header row', error)
    }

    try {
        workbookProvided = XLSX.readFile(fileName, { password: `${transporeonSheetPassword}` });
        sheet = workbookProvided.Sheets[targetTab]
        data = XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab], { range: headerRowIndex });
    } catch (error) {
        console.error('💥 Error reading the Excel file', error)
    }


    // // Create an array containing all the columns header names, without duplicate
    const allColumnsNamesArray = data.map(obj => Object.keys(obj)).flat()
    const uniqueSet = new Set(allColumnsNamesArray);
    const uniqueColumnsNamesArray = Array.from(uniqueSet);
    return {
        workbookProvided: workbookProvided,
        sheet: sheet,
        data: data,
        uniqueColumnsNamesArray: uniqueColumnsNamesArray
    }
}

// Export the function
export default excelParse