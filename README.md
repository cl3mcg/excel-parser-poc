# 🎯 Excel Parser - Proof of Concept

## Introduction

### The idea behind the project

I work in the industry of freight forwarding, specifically in the tender department of a freight forwarding company.
A part of my job is to receive tender rate cards from different companies that have cargo to transport all over the world. Because there is no standards to how these tender rate cards are formatted, the team I work with has to manually clean the data provided by the tendering company to make sure that matches the industry standards.
While there are several providers that can do this job for us, I am looking to build my own solution to be able to customize it to my needs and to be able to integrate it with my existing workflow.

I had the idea to create a small CLI tool that would clean the data provided in the tendering company's speadsheet and return a clean spreadsheet with the data in the correct format. This would allow me to automate the cleaning process and have a nice standard format to work with.

### About this CLI tool

The Excel Parser is a proof of concept (POC) project that works with Excel files, particularly with pseudo TI-contract (or Transporeon) templates that resemble, but are not identical to, TI-Contract templates.

The main functionality of the Excel Parser is to analyze an Excel file and to clean it by standardizing country data contained within the Excel file. This feature ensures that the proper country code is returned for each entry, making it especially useful for datasets with approximate country names, typos, or inconsistent formatting.

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

4. [Place the Excel file](#excel-file) you want to analyze in the `worksheets` directory of the project. The directory can contain multiple Excel files.
5. Create a `.env` file in the root directory of the project and add the required data for the app to work (you can find an example of the expected variables in the `.env.example` file).
6. Run the project with the following command:

```
node app.js
```

or

```
npm start
```

Then the CLI tool will ask you different questions to identify the file to work on as well as which speadsheet (or Excel tab) contains the data to clean.
The project will parse the Excel file and output the results directly in the project root directory.

You can also run some unit test by using the following command:

```
npm test
```

### Excel file

Make sure to include the Excel file to parse in the `worksheets` directory of the project.
From there, the CLI tool should be able to find the file and parse it.
The Excel file can contain multiple sheets, but the CLI tool will only parse the sheet that you specify when you run the project.
The Excel file needs to be in ending with the `.xlsx` extension, as this tool doesn't support macro-enabled Excel files (`.xlsm`).

## General process

The Excel Parser POC is a set of Node.js scripts that use the `xlsx` and `exceljs` libraries to parse and analyze Excel files.

### app.js

The `app.js` script is used to parse an Excel file and clean the data contained in it. It does this by using a special dataset of country names and country codes, and a fuzzy string matching library called `fuzzyset.js`.

The script first imports the `xlsx`, `exceljs`, `fuzzyset.js`, and country dataset libraries, and specifies the path of the file to read and parse. It then creates a variable to store the name of the target tab, and uses the `XLSX.readFile()` method to read the file and store the parsed data in a variable.

Next, the script uses the `XLSX.utils.sheet_to_json()` method to extract the data from the Excel file and store it in a variable. It then sets up the `fuzzyset.js` library to clean the data.

The script then processes the cleaning by mapping over the data and using the `fuzzyset.js` library to match the country names in the data with the country names in the dataset. If a match is found, the script uses the dataset to get the corresponding country code and stores it in the data.

If no match can be done with the fuzzy library, then the `app.js` script will use Mistral AI's API to determine the most likely cca2 country code for a given pseudo country name.

Finally, the script creates a new Excel file using the `exceljs` library, adds a new worksheet to the file, and writes the cleaned data to the worksheet. It then saves the file to the disk, ready to be redistributed.

### Showcase demo

![A GIF showcasing a demo of the project](./assets/demo.gif)

## Documentation and maintenance of the project

This project is written in JavaScript. It uses JSDoc to document the code.
I used JSDoc to document the code because it is a standard way to document JavaScript code and I find it easy to use. It also allows me to generate IDE embedded documentation from the code, which can be useful for me as I am not working on this project full time, therefore, it is important to have a way to quickly understand the code I previously wrote as well as providing the expected function arugments and return values' types.

Note: This is the first time I use JSDocs. I am not sure if I am using it correctly, but I will try to improve it over time as I learn more about it and as I use it more often.

## Future improvements and ideas

Here is a non exhaustive list of features I'd like to add to this small project:

- Clean container types information
- Clean city names information
- Clean volume information

## Contact Information

Feel free to reach out for further information or if you're interested in collaborating on projects related to freight or logistics.

You can contact me via:

- [LinkedIn](https://www.linkedin.com/in/cl3mcg/?locale=en_US)
- [Mastodon](https://fosstodon.org/@cl3mcg)
- [Twitter](https://twitter.com/cl3mcg)

I'm open to discussions, collaborations, and suggestions related to air transportation, logistics, or any other relevant projects. Don't hesitate to connect or drop a message via these platforms.

## License

This project and work is licensed under the [CC0 1.0 Universal license](https://creativecommons.org/publicdomain/zero/1.0/).
