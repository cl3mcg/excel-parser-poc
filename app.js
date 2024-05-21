// Importing the necessary library
const XLSX = require("xlsx")


// Create a variable used to specify the path of the file to read and parse
const filename = "./BookToValidate.xlsx"

// Create an objject containing options for the reading and parsing of the Excel file
const opts = {
  cellStyles: true,
  cellHTML: true,
  sheets: ['Book_01', 'Dummy_Tab']
}

// Create a varaible containing the parsed Excel file
const workbook = XLSX.readFile(filename, opts);

// Breaking down the different components of the parts Excel file
const allCells = workbook.Sheets
// const allTabs = Object.keys(allCells)
const targetTab = 'Book_01'
const cells = Object.values(allCells[targetTab]);

// Create arrays containing the background color of read-only cells
const listOfHeadersColors = ['F7F7F7']
const listOfRestrictedBgColors = ['C0C0C0']

// Set up a set of variables storing the results
const analysedRange = cells[0];
const listOfHeaderCells = [];
const listOfRestrictedCells = [];
const listOfEditableCells = []

// Looping over all the cells in the target tab
for (const cell in allCells[targetTab]) {

  if (!allCells[targetTab][cell].s || !allCells[targetTab][cell].s.patternType) {
    // The cell doesn't have the necessary properties and therefore should be ignored...
    continue
  }
  if (allCells[targetTab][cell].s.patternType === 'none') {
    // All cells that do not have a specific backgroud color are considered as editable
    listOfEditableCells.push({
      cell: cell,
      editable: true,
      isHeader: false,
    })
    continue
  }
  if (allCells[targetTab][cell].s.patternType === 'solid') {
    // Focusing on cells that actually have a solid color background
    if (listOfHeadersColors.includes(allCells[targetTab][cell].s.fgColor.rgb)) {
      // Checking if the background color is included in the array of Header cells background color
      // If so, the cell is pushed to the appropriate array
      listOfHeaderCells.push({
        cell: cell,
        currentValue: allCells[targetTab][cell].v,
        editable: false,
        isHeader: false,
      })
    }
    else if (listOfRestrictedBgColors.includes(allCells[targetTab][cell].s.fgColor.rgb)
      // Checking if the background color is included in the array of Restricted cells background color
      // If so, the cell is pushed to the appropriate array
      || Object.keys(allCells[targetTab][cell].s.fgColor).length <= 0) {
      listOfRestrictedCells.push({
        cell: cell,
        currentValue: allCells[targetTab][cell].v,
        editable: false,
        isHeader: false,
      })
    }
    else {
      // If all the previous checks are bypassed, it means that the cell doesn't fall in the
      // restricted cell category and should therefore be editable
      listOfEditableCells.push({
        cell: cell,
        currentValue: allCells[targetTab][cell].v,
        editable: true,
        isHeader: false,
      })
    }
    continue
  }
  // All cells that are not falling in the abovmentioned category are irrelevant
  // They are considered as non editable also.
  listOfRestrictedCells.push({
    cell: cell,
    currentValue: allCells[targetTab][cell].v,
    editable: false,
    isHeader: false,
  })
};

console.log(`Analysed range of cell is:`, analysedRange);
console.log(`The headers row would be: `, listOfHeaderCells);
console.log(`The editable cells would be: `, listOfEditableCells);
console.log(`The restricted cells would be: `, listOfRestrictedCells);