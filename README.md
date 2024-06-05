# Excel Parser - Proof of Concept

## Introduction

The Excel Parser is a proof of concept (POC) project that showcases two main functionalities for working with Excel files, particularly with pseudo TI-contract templates that resemble, but are not identical to, TI-Contract templates.

Initially, the first functionality of the Excel Parser was to analyze an Excel file and determine which cells were editable and which were read-only. By leveraging widely-used libraries available on npm, the Excel Parser can swiftly and efficiently parse the contents of an Excel file and inspect the properties of each cell. This enables the app to differentiate between editable and read-only cells, providing a foundational starting point for working with Excel-based templates.

The second functionality of the Excel Parser is to clean and standardize country data contained within the Excel file. This feature ensures that the proper country code is returned for each entry, making it especially useful for datasets with approximate country names, typos, or inconsistent formatting.

## Prerequisites

To run this project, you will need the following:

- Node.js
- npm
- A [MistralAI](https://mistral.ai/) API key.

## Project structure

This project is the result of several attempts. It is ultimatly structured in a main file `app.js` calling various functions located in the `functions` directory.

There is also a `test` directory containing various test files to make sure that some of the functions are working properly.

Finally, an `assets` directory containing different .json files used as a fuzzy find comparison set.

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

4. [Place the Excel file](#excel-file) you want to analyze in the `worksheets` directory of the project.
5. Create a `.env` file in the root directory of the project and add the required data for the app to work (you can find an example of the expected variables in the `.env.example` file).
6. Run the project with the following command:

```
node app.js
```

or

```
npm start
```

The project will parse the Excel file and output the results directly in the project root directory.

You can also run some unit test by using the following command:

```
npm test
```

### Excel file

Make sure to include the Excel file to parse in the `worksheets` directory of the project.
For the time being, it is necessary to manually input the file name and the tab name of the Excel file in the `app.js` file.
The default file name expected by the app is `BookToValidate01.xlsx`. Similarly, the default sheet name expected by the app is `Book_01`.

## General process

The Excel Parser POC is a set of Node.js scripts that use the `xlsx` and `exceljs` libraries to parse and analyze Excel files.

### app.js

The `app.js` script is used to parse an Excel file and clean the data contained in it. It does this by using a special dataset of country names and country codes, and a fuzzy string matching library called `fuzzyset.js`.

The script first imports the `xlsx`, `exceljs`, `fuzzyset.js`, and country dataset libraries, and specifies the path of the file to read and parse. It then creates a variable to store the name of the target tab, and uses the `XLSX.readFile()` method to read the file and store the parsed data in a variable.

Next, the script uses the `XLSX.utils.sheet_to_json()` method to extract the data from the Excel file and store it in a variable. It then sets up the `fuzzyset.js` library to clean the data.

The script then processes the cleaning by mapping over the data and using the `fuzzyset.js` library to match the country names in the data with the country names in the dataset. If a match is found, the script uses the dataset to get the corresponding country code and stores it in the data.

If no match can be done with the fuzzy library, then the `app.js` script will use Mistral AI's API to determine the most likely cca2 country code for a given pseudo country name.

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
