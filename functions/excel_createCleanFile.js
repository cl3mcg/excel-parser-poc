// Import the necessary libraries
import Excel from 'exceljs';

/**
 * Creates a cleaned Excel file from an array of cleaned data objects.
 * 
 * This function takes an array of cleaned data, processes it, and generates an Excel file
 * containing the cleaned data with appropriate formatting and styles. The file is saved with
 * a unique identifier based on the current timestamp.
 * 
 * @async
 * @function createCleanedExcelFile
 * @param {Object[]} arrayOfCleanedData - An array of cleaned data objects with the following structure:
 * - dataObject.columnName - The name of the column.
 * - dataObject.initialData - The initial data provided.
 * - dataObject.correspondance - The corrected value, if applicable.
 * - dataObject.guessedCountry - The guessed country name, if applicable.
 * - dataObject.guessedCountryCode - The guessed two-letter country code, if applicable.
 * - dataObject.source - The source of the guessed country, if applicable.
 * @returns {Promise<void>} A promise that resolves when the Excel file has been successfully created and saved.
 * @throws Will throw an error if there is an issue with writing the Excel file.
 * 
 * @example
 * const cleanedData = [
 *   {
 *     laneId: 'A001', 
 *     columnName: 'Country of Origin',
 *     initialData: 'US/Canada',
 *     correspondance: null,
 *     guessedCountry: null,
 *     guessedCountryCode: null,
 *     source: null
 *   },
 *   {
 *     laneId: 'A002', 
 *     columnName: 'Country of Origin',
 *     initialData: 'Zimbabyoue',
 *     correspondance: 'Zimbabwe',
 *     guessedCountry: 'Zimbabwe',
 *     guessedCountryCode: 'ZW',
 *     source: 'common'
 *   },
 *   {
 *     laneId: 'A002',
 *     columnName: 'Dest Country',
 *     initialData: 'SE- 59530 Mjölby',
 *     correspondance: null,
 *     guessedCountry: 'Sweden',
 *     guessedCountryCode: 'SE',
 *     source: 'mistral'
 *   }
 * ];
 * 
 * createCleanedExcelFile(cleanedData)
 *   .then(() => console.log('Excel file created successfully.'))
 *   .catch(error => console.error('Error creating Excel file:', error));
 */
const createCleanedExcelFile = async function (arrayOfCleanedData) {
    // Create a new workbook.
    const workbook = new Excel.Workbook();

    // Add a new worksheet.
    const worksheet = workbook.addWorksheet('Cleaned Data');

    /**
     * Produces a result object from an array of cleaned data.
     * 
     * This function takes an array of cleaned data objects and returns an object containing
     * column headers and corresponding column data arrays.
     * 
     * @param {Object[]} arrayOfCleanedData - An array of cleaned data objects.
     * @returns {Object} An object containing column headers and column data arrays.
     * @property {string[]} columnHeaders - An array of column headers.
     * @property {Object[][]} colData - An array of arrays, where each inner array contains cleaned data objects for a specific column.
     */
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

    // Declare variables to hold the content of the columns and rows of the result file.
    let columns = [];
    let rows = [];

    /**
     * Converts a column index to an Excel column letter.
     * 
     * @param {number} index - The column index.
     * @returns {string} The corresponding Excel column letter.
     */
    function getExcelColumnLetter(index) {
        let letter = '';
        while (index >= 0) {
            letter = String.fromCharCode((index % 26) + 65) + letter;
            index = Math.floor(index / 26) - 1;
        }
        return letter;
    }

    // Add 'Lane ID' column
    columns.push({ header: 'Lane ID', key: 'laneId', name: 'Lane ID', filterButton: true });

    const columnNames = resultObject.colData.map(data => data[0].columnName);
    columns = columns.concat(columnNames.flatMap(columnName => [
        { header: columnName, key: columnName, name: columnName, filterButton: true },
        { header: `Clean - ${columnName}`, key: `Clean - ${columnName}`, name: `Clean - ${columnName}`, filterButton: true },
        { header: `Source - ${columnName}`, key: `Source - ${columnName}`, name: `Source - ${columnName}`, filterButton: true }
    ]));

    // Populate rows correctly for all columns
    const laneIds = [...new Set(arrayOfCleanedData.map(item => item.laneId ? item.laneId : `_${Date.now()}`))];
    laneIds.forEach(laneId => {
        let row = [laneId];
        resultObject.colData.forEach(colData => {
            const item = colData.find(data => data.laneId === laneId);
            if (item) {
                row.push(item.initialData);
                row.push(item.guessedCountryCode);
                row.push(item.source);
            } else {
                row.push(null); // Fill with null if no data for this laneId
            }
        });
        rows.push(row);
    });

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

    // Iterate over each clean column
    cleanColumns.forEach(col => {
        try {
            // Get the column object from the worksheet using mapped letter
            const colLetter = columnKeyToLetter[col.key];
            const colObj = worksheet.getColumn(colLetter);

            // Check if the column object is valid
            if (colObj) {
                // Iterate over each cell in the column, skipping the header row
                colObj.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
                    // Apply the desired styles to the cell if it is not in the header row
                    // If a result is found, the cell is green; if failed, it is red
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
        const uniqueFileIdentifier = Date.now();
        await workbook.xlsx.writeFile(`./results_${uniqueFileIdentifier}.xlsx`);
        // Adding a small console.log() to indicate that the function has run successfully.
        console.log(`✅ The data has been cleaned and results are inside the 'results_${uniqueFileIdentifier}.xlsx' file`);
    } catch (error) {
        console.error('💥 Error writing the Excel file', error);
    }
};

// Export the function
export default createCleanedExcelFile;
