// Import the required libraries
import XLSX from "xlsx";

/**
 * Finds the header row of a given worksheet.
 * 
 * This function attempts to locate the header row of an Excel worksheet using two methods:
 * 1. Checking for the presence of an `!autofilter` property, which specifies the range of the autofilter.
 * 2. Checking for the row with the most filled cells if the `!autofilter` property is not present.
 * 
 * @function findHeaderRow
 * @param {Object} sheet - The worksheet object from which to find the header row.
 * @returns {number} The 1-indexed row number of the header row.
 * @throws Will throw an error if the sheet object is invalid or does not contain a valid range.
 * 
 * @example
 * const workbook = XLSX.readFile('example.xlsx');
 * const sheet = workbook.Sheets[workbook.SheetNames[0]];
 * const headerRow = findHeaderRow(sheet);
 * console.log(`Header row is: ${headerRow}`);
 */
function findHeaderRow(sheet) {

    // Method 1: Check for !autofilter property
    if (sheet['!autofilter']) {
        const ref = sheet['!autofilter'].ref;
        const startRow = parseInt(ref.split(':')[0].match(/\d+/)[0]);
        // Adding a small console.log() to notify the user about the findings of the function.
        console.log(`🎯 The headers of the table are most likely located on the row ${startRow}`);
        return startRow;
    }

    // Method 2: Check for the row with the most data
    const range = XLSX.utils.decode_range(sheet['!ref']);
    let maxFilledCells = 0;
    let headerRow = range.s.r;

    for (let R = range.s.r; R <= range.e.r; ++R) {
        let filledCells = 0;
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (sheet[cellAddress] && sheet[cellAddress].v) {
                filledCells++;
            }
        }
        if (filledCells > maxFilledCells) {
            maxFilledCells = filledCells;
            headerRow = R;
        }
    }

    // Storing the results in a variable.
    // Convert 0-indexed row number to 1-indexed
    const result = headerRow + 1

    // Adding a small console.log() to notify the user about the findings of the function.
    console.log(`🎯 The headers of the table are most likely located on the row ${result}`);

    // Return the result.
    return result;
}

// Export the function
export default findHeaderRow;
