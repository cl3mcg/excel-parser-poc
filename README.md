# Excel Parser - Proof of Concept

## Introduction

The Excel Parser is a proof of concept (POC) project that demonstrates how to parse an Excel file and determine which cells are editable and which are read-only. This project is specifically designed to work with pseudo TI-contract templates, which are similar to TI-Contract templates but not an exact match.

By using [the popular `xlsx` library](https://www.npmjs.com/package/xlsx), available on npm, the Excel Validator can quickly and efficiently parse the contents of an Excel file and analyze the properties of each cell. This allows the POC to determine which cells are editable and which are read-only, making it a (basic and humble) launchpad for working with Excel-based templates.

## Prerequisites

To run this project, you will need the following:

- Node.js
- npm

## Project structure

This project has 2 main features.

1. The content of `app01.js` is to run some basic Excel parsing to extract the background color of the cells and return which cells are considered as read-only (by TI-contract standards) and which can be editable.
2. The content of `app02.js` is to parse a list of data consisting in a pseudo country names (approximative names, names with typos, country 2-letter codes, country 3-letter codes) and return the most likely cca2 country code.

## Getting Started

### Basics

To get started with this project, follow these steps:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/cl3mcg/excel-parser-poc.git
```

2. Navigate to the project directory:

```bash
cd excel-parser-poc
```

3. Install the required npm packages:

```
npm install
```

4. Place the Excel file you want to analyze in the root directory of the project.
5. Run the project with the following command:

```
node app01.js
```

or

```
node app02.js
```

The project will parse the Excel file and output the results to the console.

### Excel file

Make sure to include the Excel file to parse in the root directory of the project.
For the time being, it is necessary to manually input the file name and the tab name of the Excel file in the `app01.js` or the `app02.js` file.
The default file names expected by the app are `BookToValidate01.xlsx` and `BookToValidate02.xlsx`

### General process

The Excel Parser scripts are a set of Node.js scripts that use the `xlsx` and `exceljs` libraries to parse and analyze Excel files.

#### app01.js

The `app01.js` script is used to parse an Excel file and determine which cells are editable and which are read-only. It does this by analyzing the background color of the cells.

The script first imports the `xlsx` library and specifies the path of the file to read and parse. It then creates an object containing options for the reading and parsing of the Excel file, and uses the `XLSX.readFile()` method to read the file and store the parsed data in a variable.

Next, the script breaks down the different components of the parsed Excel file and stores them in variables. It then creates arrays to store the background color of read-only cells and headers, and sets up a set of variables to store the results.

The script then loops over all the cells in the target tab and analyzes their properties to determine whether they are editable or read-only. If a cell is determined to be editable, it is added to the `listOfEditableCells` array. If a cell is determined to be a header, it is added to the `listOfHeaderCells` array. If a cell is determined to be read-only, it is added to the `listOfRestrictedCells` array.

Finally, the script logs the results to the console.

#### app02.js

The `app02.js` script is used to parse an Excel file and clean the data contained in it. It does this by using a special dataset of country names and country codes, and a fuzzy string matching library called `fuzzyset.js`.

The script first imports the `xlsx`, `exceljs`, `fuzzyset.js`, and country dataset libraries, and specifies the path of the file to read and parse. It then creates a variable to store the name of the target tab, and uses the `XLSX.readFile()` method to read the file and store the parsed data in a variable.

Next, the script uses the `XLSX.utils.sheet_to_json()` method to extract the data from the Excel file and store it in a variable. It then sets up the `fuzzyset.js` library to clean the data.

The script then processes the cleaning by mapping over the data and using the `fuzzyset.js` library to match the country names in the data with the country names in the dataset. If a match is found, the script uses the dataset to get the corresponding country code and stores it in the data.

Finally, the script creates a new Excel file using the `exceljs` library, adds a new worksheet to the file, and writes the cleaned data to the worksheet. It then saves the file to the disk, ready to be redistributed.

## Contact Information

Feel free to reach out for further information or if you're interested in collaborating on projects related to freight or logistics.

You can contact me via:

- [LinkedIn](https://www.linkedin.com/in/cl3mcg/?locale=en_US)
- [Mastodon](https://fosstodon.org/@cl3mcg)
- [Twitter](https://twitter.com/cl3mcg)

I'm open to discussions, collaborations, and suggestions related to air transportation, logistics, or any other relevant projects. Don't hesitate to connect or drop a message via these platforms.

## License

This project and work is licensed under the [CC0 1.0 Universal license](https://creativecommons.org/publicdomain/zero/1.0/).
