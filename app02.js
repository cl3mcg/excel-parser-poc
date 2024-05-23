// Importing the necessary library.
const XLSX = require("xlsx");
const Excel = require('exceljs');
const FuzzySet = require('fuzzyset');
const countriesDataSet = require("./assets/countries.json")

// Create a variable used to specify the path of the file to read and parse.
const filename = "./BookToValidate02.xlsx"

// Create a variable to store the name of the targetted tab.
const targetTab = "Book_01"

// Extract the data from the Excel file.
const workbookProvided = XLSX.readFile(filename);
const data = XLSX.utils.sheet_to_json(workbookProvided.Sheets[targetTab]);

// Setting up various array of country spec data to be used as potential matches.
const country_CommonNames = countriesDataSet.map(countryData => countryData.name.common);
const country_OfficialNames = countriesDataSet.map(countryData => countryData.name.official);
const country_cca2 = countriesDataSet.map(countryData => countryData.cca2);
const country_cca3 = countriesDataSet.map(countryData => countryData.cca3);
const country_capital = countriesDataSet.map(countryData => countryData.capital).flat();
const country_altSpellings = countriesDataSet.map(countryData => countryData.altSpellings).flat();

// Setting up various FuzzySet to perform matching based on various factors.
const fuzzySet_CommonNames = new FuzzySet(country_CommonNames);
const fuzzySet_OfficialNames = new FuzzySet(country_OfficialNames);
const fuzzySet_cca2 = new FuzzySet(country_cca2);
const fuzzySet_cca3 = new FuzzySet(country_cca3);
const fuzzySet_capital = new FuzzySet(country_capital);
const fuzzySet_altSpellings = new FuzzySet(country_altSpellings);

// Processing the cleaning.
const cleanedData = data.map(row => {

    const countryNameProvided = row.Country.trim().toLowerCase(); // assuming 'Country' is the column name
    let matchedCountry = null
    if (fuzzySet_CommonNames.get(countryNameProvided) && fuzzySet_CommonNames.get(countryNameProvided).length > 0 && fuzzySet_CommonNames.get(countryNameProvided)[0][0] > 0.6) {
        matchedCountry = {
            country: fuzzySet_CommonNames.get(countryNameProvided),
            source: 'common'
        }
    } else if (fuzzySet_OfficialNames.get(countryNameProvided) && fuzzySet_OfficialNames.get(countryNameProvided).length > 0 && fuzzySet_OfficialNames.get(countryNameProvided)[0][0] > 0.6) {
        matchedCountry = {
            country: fuzzySet_OfficialNames.get(countryNameProvided),
            source: 'official'
        }
    } else if (countryNameProvided.length === 2 && fuzzySet_cca2.get(countryNameProvided) && fuzzySet_cca2.get(countryNameProvided).length > 0 && fuzzySet_cca2.get(countryNameProvided)[0][0] > 0.6) {
        matchedCountry = {
            country: fuzzySet_cca2.get(countryNameProvided),
            source: 'cca2'
        }
    } else if (fuzzySet_cca3.get(countryNameProvided) && fuzzySet_cca3.get(countryNameProvided).length > 0 && fuzzySet_cca3.get(countryNameProvided)[0][0] > 0.6) {
        matchedCountry = {
            country: fuzzySet_cca3.get(countryNameProvided),
            source: 'cca3'
        }
    } else if (fuzzySet_capital.get(countryNameProvided) && fuzzySet_capital.get(countryNameProvided).length > 0 && fuzzySet_capital.get(countryNameProvided)[0][0] > 0.6) {
        matchedCountry = {
            country: fuzzySet_capital.get(countryNameProvided),
            source: 'capital'
        }
    } else if (fuzzySet_altSpellings.get(countryNameProvided) && fuzzySet_altSpellings.get(countryNameProvided).length > 0 && fuzzySet_altSpellings.get(countryNameProvided)[0][0] > 0.6) {
        matchedCountry = {
            country: fuzzySet_altSpellings.get(countryNameProvided),
            source: 'altSpelling'
        }
    }

    const result = {
        ...row,
        initialData: countryNameProvided,
        correspondance: null,
        guessedCountry: null,
        guessedCountryCode: null,
        source: null
    }

    if (!matchedCountry) {
        return result
    }
    const bestMatchProposal = matchedCountry && matchedCountry.country[0][0] > 0.6 ? matchedCountry.country[0][1] : null
    console.log('bestMatchProposal', bestMatchProposal)
    let bestCountryCodeProposal = null
    switch (matchedCountry.source) {
        case 'common':
            bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.name.common === bestMatchProposal)[0].cca2 : null
            break;
        case 'official':
            bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.name.official === bestMatchProposal)[0].cca2 : null
            break;
        case 'cca2':
            bestCountryCodeProposal = bestMatchProposal ? bestMatchProposal : null
            break;
        case 'cca3':
            bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.cca3 === bestMatchProposal)[0].cca2 : null
            break;
        case 'capital':
            bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.capital.includes(bestMatchProposal))[0].cca2 : null
            break;
        case 'altSpelling':
            bestCountryCodeProposal = bestMatchProposal ? countriesDataSet.filter((country) => country.altSpellings.includes(bestMatchProposal))[0].cca2 : null
            break;
    }

    result.guessedCountry = countriesDataSet.filter((country) => country.cca2 === bestCountryCodeProposal)[0].name.common
    result.correspondance = bestMatchProposal
    result.guessedCountryCode = bestCountryCodeProposal
    result.source = matchedCountry.source

    return result
});

// Below, to create and write on an Excel file, we are going to use the 'exceljs' library.

// Create a new workbook.
const workbook = new Excel.Workbook();

// Add a new worksheet.
const worksheet = workbook.addWorksheet('sheet_results');

// Process the data to format it in an array of arrays.
const resultArray = function () {
    const arrayOfArray = []
    arrayOfArray.push(Object.keys(cleanedData[0]))
    cleanedData.map((entry) => arrayOfArray.push(Object.values(entry)))
    return arrayOfArray
}

// Add a table to the worksheet.
worksheet.addTable({
    name: 'table_results',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
        theme: 'TableStyleLight8',
        showRowStripes: false
    },
    columns: resultArray()[0].map(function (entry) { return { name: entry, filterButton: true } }), // The header row is the resultArray[0] properly formated.
    rows: resultArray().slice(1) // The data is the resultArray without its first entry (which is the header row).
});

// Save the workbook to a file with an unique file name.
workbook.xlsx.writeFile(`results_${Date.now()}.xlsx`);