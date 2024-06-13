// Import the required libraries
import FuzzySet from "fuzzyset";

// Import the required dataset
import headerNames_laneId from "../assets/headerNames_lane_id.json" assert { type: "json" };

/**
 * Identifies the most probable lane ID columns in a dataset by comparing column names with known lane ID header names.
 * 
 * This function uses a fuzzy matching algorithm to compare the column names in the provided dataset with a predefined list
 * of common lane ID header names. It calculates a probability score for each column based on the similarity of the names and returns
 * the columns that are most likely to contain the lane ID data.
 * 
 * @function returnTheMostProbableLaneIdColumn
 * @param {Array<string>} uniqueColumnsNamesArray - An array of unique column names found in the dataset.
 * @returns {Array<Object>} An array of objects representing the columns most likely to contain country data. Each object contains:
 * - {number} columnIndex - The index of the column in the original dataset.
 * - {string} columnName - The name of the column.
 * - {number} bestProbabilityResult - The highest probability score for the column, ranging from 0 to 1.
 * 
 * @example
 * const uniqueColumns = ['Lane ID', 'country of origin', 'destination', 'date', 'city'];
 * const probableLaneIdColumn = returnTheMostProbableLaneIdColumn(uniqueColumns);
 * console.log(probableLaneIdColumn);
 * 
 * Ultimately, the returnTheMostProbableLaneIdColumn output has the following structure.
   [
    {
     columnIndex: 1,
     columnName: 'Lane ID',
     bestProbabilityResult: 1
     }
   ]
 */
const returnTheMostProbableLaneIdColumn = function (uniqueColumnsNamesArray) {
  // Setting up a FuzzySet to perform matching based on probable lane ID columns names.
  const fuzzySet_headerNames_laneId = new FuzzySet(headerNames_laneId);

  // Performing a comparison between the lane ID header name's FuzzySet and the Excel file column names
  // The operation below is creating an array containing objects representing each column in the Excel file.
  // For each object, a probability score from 0 to 1 is calculated based on the similarities of the name of the column and anything
  // that would identify this column as a 'lane ID' column.
  const probabilityCalculation = uniqueColumnsNamesArray.map((value) => fuzzySet_headerNames_laneId.get(value.trim().toLowerCase()));
  const probabilityResult = probabilityCalculation.map(el => new Object({
    columnIndex: probabilityCalculation.indexOf(el),
    columnName: uniqueColumnsNamesArray[probabilityCalculation.indexOf(el)], // Another way to better understand this is 'columnName: uniqueColumnsNamesArray[this.columnIndex]' but this is not accessible in arrow functions.
    bestProbabilityResult: !el ? 0 : Math.max(...el.flat().filter(val => typeof val === 'number'))
  }));

  // Once the probabilityResult obtained, the returnTheMostProbableLaneIdColumn function is going to return the columns that are identified
  // to be the most likely to contain lane ID data.
  // It is also possible to have multiple columns that woudl be identified as lane ID data.
  // In this case the returnTheMostProbableLaneIdColumn function retruns an array that contains the data of the column that is the most likely to contain the lane ID data.
  // In any way, the returnTheMostProbableLaneIdColumn returns an array containing one single object.
  if (probabilityResult.filter(el => el.bestProbabilityResult >= 0.9).length >= 2) {
    console.log(`🎯 Multiple potential "Lane ID" columns have been identified: `, probabilityResult.filter(el => el.bestProbabilityResult >= 0.9).map(el => el.columnName));
    console.log(`🎯 "Lane ID" column selected is: `, probabilityResult.sort((el1, el2) => el2.bestProbabilityResult - el1.bestProbabilityResult).map(el => el.columnName)[0].columnName);
    return probabilityResult.sort((el1, el2) => el2.bestProbabilityResult - el1.bestProbabilityResult).map(el => el.columnName)[0];
  } else if (probabilityResult.filter(el => el.bestProbabilityResult >= 0.9).length === 1) {
    console.log(`🎯 A single "Lane ID" column have been identified: `, [probabilityResult.sort((el1, el2) => el2.bestProbabilityResult - el1.bestProbabilityResult)[0].columnName]);
    return [probabilityResult.sort((el1, el2) => el2.bestProbabilityResult - el1.bestProbabilityResult)[0]];
  }
  // Gracefully end the script
  console.log('💥 Error reading the Excel file: No "Lane ID" column could be identified');
  console.log('🌜 Ending Node.js process...');
  process.exit(0);
}

// Export the function
export default returnTheMostProbableLaneIdColumn;
