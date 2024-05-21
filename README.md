# Excel Parser - Proof of Concept

## Introduction

The Excel Parser is a proof of concept (POC) project that demonstrates how to parse an Excel file and determine which cells are editable and which are read-only. This project is specifically designed to work with pseudo TI-contract templates, which are similar to TI-Contract templates but not an exact match.

By using [the popular `xlsx` library](https://www.npmjs.com/package/xlsx), available on npm, the Excel Validator can quickly and efficiently parse the contents of an Excel file and analyze the properties of each cell. This allows the POC to determine which cells are editable and which are read-only, making it a (basic and humble) launchpad for working with Excel-based templates.

## Prerequisites

To run this project, you will need the following:

- Node.js
- npm

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
node app.js
```

The project will parse the Excel file and output the results to the console.

### Excel file

Make sure to include the Excel file to parse in the root directory of the project.
For the time being, it is necessary to manually input the file name and the tab name of the Excel file in the `app.js` file.

## Contact Information

Feel free to reach out for further information or if you're interested in collaborating on projects related to freight or logistics.

You can contact me via:

- [LinkedIn](https://www.linkedin.com/in/cl3mcg/?locale=en_US)
- [Mastodon](https://fosstodon.org/@cl3mcg)
- [Twitter](https://twitter.com/cl3mcg)

I'm open to discussions, collaborations, and suggestions related to air transportation, logistics, or any other relevant projects. Don't hesitate to connect or drop a message via these platforms.

## License

This project and work is licensed under the [CC0 1.0 Universal license](https://creativecommons.org/publicdomain/zero/1.0/).
