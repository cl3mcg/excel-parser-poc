// Import the necessary libraires
import Excel from 'exceljs';

// Define the function
const createCleanedExcelFile = async function (arrayOfCleanedData) {
    // Create a new workbook.
    const workbook = new Excel.Workbook();

    // Add a new worksheet.
    const worksheet = workbook.addWorksheet('Cleaned Data');

    // The function produceResultObject is defined below.
    // It takes as argument an array of objects, and returns an object with the following structure:
    // resultObject = {
    //     columnHeaders: [ 'Initial data', 'Country of Origin', 'Dest Country' ],
    //     colData: [ [ [Object], [Object] ], [ [Object], [Object] ] ]
    //   }
    // Content of resultObject.colData [
    //     [
    //       {
    //         "columnName": "Country of Origin",
    //         "initialData": "US/Canada",
    //         "correspondance": null,
    //         "guessedCountry": null,
    //         "guessedCountryCode": null,
    //         "source": null
    //       },
    //       {
    //         "columnName": "Country of Origin",
    //         "initialData": "Zimbabyoue",
    //         "correspondance": "Zimbabwe",
    //         "guessedCountry": "Zimbabwe",
    //         "guessedCountryCode": "ZW",
    //         "source": "common"
    //       }
    //     ],
    //     [
    //       {
    //         "columnName": "Dest Country",
    //         "initialData": "SE- 59530 Mjölby",
    //         "correspondance": null,
    //         "guessedCountry": "Sweden",
    //         "guessedCountryCode": "SE",
    //         "source": "mistral"
    //       },
    //       {
    //         "columnName": "Dest Country",
    //         "initialData": "9212 Lokeren, Belgium",
    //         "correspondance": null,
    //         "guessedCountry": "Belgium",
    //         "guessedCountryCode": "BE",
    //         "source": "mistral"
    //       }
    //     ]
    //   ]
    // The function is called with the arrayOfCleanedData variable as argument, and the result is stored in the resultObject variable.
    // Inside the columnHeaders, a first value of 'Initial data' is hardcoded to get a clear comparison between the data initially provided and the result of the cleaning.

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

    // console.log('resultObject', resultObject);
    // console.log('Content of resultObject.colData', JSON.stringify(resultObject.colData, null, 2));

    // Below we declare 2 variables that will hold the content of the columns and the rows of the result file.
    let columns = [];
    let rows = [];

    // Helper function to convert index to Excel column letters
    // This will be helpfull after when we need to identify columns by their position.
    // This function was (obviously) provided by an LLM code assistant.
    function getExcelColumnLetter(index) {
        let letter = '';
        while (index >= 0) {
            letter = String.fromCharCode((index % 26) + 65) + letter;
            index = Math.floor(index / 26) - 1;
        }
        return letter;
    }

    // The if() statement below is checking if there is only 1 single column to work on or not.
    // If there is one single column, the work is done only once, ontherwise, a map method is used to work on each individual column identified.
    if (resultObject.colData.length === 1) {
        const columnName = resultObject.colData[0][0].columnName;

        columns = [
            { header: columnName, key: columnName, name: columnName, filterButton: true },
            { header: `Clean - ${columnName}`, key: `Clean - ${columnName}`, name: `Clean - ${columnName}`, filterButton: true },
            { header: `Source - ${columnName}`, key: `Source - ${columnName}`, name: `Source - ${columnName}`, filterButton: true }
        ];

        rows = resultObject.colData[0].map(data => [data.initialData, data.guessedCountryCode, data.source]);
    } else {
        const columnNames = resultObject.colData.map(data => data[0].columnName);

        columns = columnNames.flatMap(columnName => [
            { header: columnName, key: columnName, name: columnName, filterButton: true },
            { header: `Clean - ${columnName}`, key: `Clean - ${columnName}`, name: `Clean - ${columnName}`, filterButton: true },
            { header: `Source - ${columnName}`, key: `Source - ${columnName}`, name: `Source - ${columnName}`, filterButton: true }
        ]);

        // Populate rows correctly for all columns
        for (let i = 0; i < resultObject.colData[0].length; i++) {
            let row = [];
            resultObject.colData.forEach(colData => {
                row.push(colData[i].initialData);
                row.push(colData[i].guessedCountryCode);
                row.push(colData[i].source);
            });
            rows.push(row);
        }
    }

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

    // console.log('Clean Columns:', cleanColumns);
    // console.log('Column Key to Letter Mapping:', columnKeyToLetter);

    // Iterate over each clean column
    cleanColumns.forEach(col => {
        try {
            // Get the column object from the worksheet using mapped letter
            const colLetter = columnKeyToLetter[col.key];
            const colObj = worksheet.getColumn(colLetter);

            // console.log(`Processing column: ${col.key} (${colLetter})`);

            // Check if the column object is valid
            if (colObj) {
                // Iterate over each cell in the column, skipping the header row
                colObj.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
                    // Apply the desired styles to the cell if it is not in the header row
                    // If a result is found, the cell is green, if failed, it is red
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
        const uniqueFileIdentifier = Date.now()
        await workbook.xlsx.writeFile(`./results_${uniqueFileIdentifier}.xlsx`);
        // Adding a small console.log() to indicate that the function has ran succesfully.
        console.log(`✅ The data has been cleaned and results are inside the 'results_${uniqueFileIdentifier}.xlsx' file`)
    } catch (error) {
        console.error('🔺 Error writting the Excel file', error)
    }
}

// Export the function
export default createCleanedExcelFile