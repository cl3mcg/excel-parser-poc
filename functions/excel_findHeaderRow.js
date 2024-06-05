// Import the required libraries
import XLSX from "xlsx";

// Declare the function
function findHeaderRow(sheet) {

    // Method 1: Check for !autofilter property
    if (sheet['!autofilter']) {
        const ref = sheet['!autofilter'].ref;
        const startRow = parseInt(ref.split(':')[0].match(/\d+/)[0]);

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

    console.log(`🎯 The header row is most likely: ${headerRow + 1}`);
    return headerRow + 1;  // Convert 0-indexed row number to 1-indexed
}

// Export the function
export default findHeaderRow