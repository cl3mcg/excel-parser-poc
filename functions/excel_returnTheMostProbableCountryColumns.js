// Import the required librairies
import FuzzySet from "fuzzyset";

// Import the required dataset
import headerNames_country from "../assets/headerNames_country.json" assert { type: "json" };

// Declare the function
const returnTheMostProbableCountryColumns = function (uniqueColumnsNamesArray) {
    // Setting up a FuzzySet to perform matching based on probable country columns names.
    const fuzzySet_headerNames_country = new FuzzySet(headerNames_country);

    // Performing a comparison between the country header name's FuzzySet and the Excel file column names
    // The operation below is creating an array containing objects representing each column in the Excel file.
    // For each object, a probability score from 0 to 1 is calculated based on the similarities of the name of the column and anything
    // that would identify this column as a 'Country' column.
    const probabilityCalculation = uniqueColumnsNamesArray.map((value) => fuzzySet_headerNames_country.get(value.trim().toLowerCase()))
    const probabilityResult = probabilityCalculation.map(el => new Object({
        columnIndex: probabilityCalculation.indexOf(el),
        columnName: uniqueColumnsNamesArray[probabilityCalculation.indexOf(el)], // Another way to better understand this is 'columnName: uniqueColumnsNamesArray[this.columnIndex]' but this is not accessible in arrow functions.
        bestProbabilityResult: !el ? 0 : Math.max(...el.flat().filter(val => typeof val === 'number'))
    }))

    // Once the probabilityResult obtained, the returnTheMostProbableCountryColumns function is going to return the columns that are identified
    // to be the most likely to contain country data.
    // It is also possible to have multiple columns containing country data (Origin country **and** Destination country for example)
    // In this case the returnTheMostProbableCountryColumns function retruns an array that contains various objects, one for each column.
    // In any way, the returnTheMostProbableCountryColumns returns an array containing one or more objects.
    if (probabilityResult.filter(el => el.bestProbabilityResult >= 0.9).length >= 2) {
        console.log(`🎯 Multiple country columns have been identified: `, probabilityResult.filter(el => el.bestProbabilityResult >= 0.9).map(el => el.columnName))
        return probabilityResult.filter(el => el.bestProbabilityResult >= 0.9)
    }
    console.log(`🎯 A single country column have been identified: `, [probabilityResult.sort((el1, el2) => el2.bestProbabilityResult - el1.bestProbabilityResult)[0].columnName])
    return [probabilityResult.sort((el1, el2) => el2.bestProbabilityResult - el1.bestProbabilityResult)[0]]

    // Ultimatly, the returnTheMostProbableCountryColumns output has the following structure.
    // [
    //     {
    //       columnIndex: 1,
    //       columnName: 'Country of Origin',
    //       bestProbabilityResult: 1
    //     },
    //     {
    //       columnIndex: 2,
    //       columnName: 'Dest Country',
    //       bestProbabilityResult: 1
    //     }
    // ]
}

// Export the function
export default returnTheMostProbableCountryColumns