/**
 * Imports necessary libraries.
 */
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { promisify } from 'util';
import XLSX from "xlsx";

/**
 * Imports necessary environment variables
 * Retrieves the password for the Transporeon sheet from environment variables.
 * @type {string|null}
 */
const transporeonSheetPassword = process.env.TRANSPOREON_SHEET_PASSWORD || null;

/**
 * Gets the current module's directory path.
 * @type {string}
 */
const projectDirectory = path.resolve();

/**
 * Converts the fs.readdir function to a promise-based function.
 * @type {function(string): Promise<string[]>}
 */
const readdirAsync = promisify(fs.readdir);

/**
 * Prompts the user to select an Excel file and sheet (tab) to process.
 * 
 * This function reads the contents of the 'worksheets' directory, filters for .xlsx files,
 * and prompts the user to select one of the files. It then reads the selected Excel file,
 * retrieves the available sheets (tabs), and prompts the user to select one of the sheets.
 * 
 * @async
 * @function userChosenFile
 * @returns {Promise<{fileName: string, targetTab: string}>} A promise that resolves to an object containing the file path of the selected Excel file and the name of the selected sheet.
 * @throws Will throw an error if reading the 'worksheets' directory or the selected Excel file fails.
 * 
 */
const userChosenFile = async function () {
    try {
        /**
         * Reads the contents of the 'worksheets' directory.
         * @type {string[]} An array of file names in the 'worksheets' directory.
         */
        const files = await readdirAsync(path.join(projectDirectory, 'worksheets'));

        /**
         * Filters the array of file names to retrieve only .xlsx files.
         * @type {string[]} An array of .xlsx file names in the 'worksheets' directory.
         */
        const xlsxFiles = files.filter(file => path.extname(file) === '.xlsx');

        /**
         * Creates an array of choice objects for the user to select an Excel file.
         * @type {Object[]} An array of choice objects.
         * @property {string} name - The name of the Excel file.
         * @property {string} value - The file path of the Excel file.
         */
        const choicesFile = xlsxFiles.map(file => ({
            name: file,
            value: path.join(projectDirectory, 'worksheets', file)
        }));

        if (choicesFile.length === 0) {
            console.log('💥 The content of your "worksheets" directory is empty. There is nothing to analyze.');
            console.log('🌜 Ending Node.js process...');
            process.exit(0);
        }

        /**
         * Prompts the user to select an Excel file to process.
         * @returns {Promise<{fileName: string}>} A promise that resolves to an object containing the file path of the selected Excel file.
         */
        const answerFile = await inquirer.prompt([
            {
                type: 'list',
                name: 'fileName',
                message: '🗯️ Please select an Excel file to process:',
                choices: choicesFile
            }
        ]);

        /**
         * Stores the Excel tab names.
         * @type {string[]|null} The variable holding the Excel tab names. If the Excel file is empty, the variable will be null.
         */
        let sheets = null;

        try {
            const workbookSelected = XLSX.readFile(answerFile.fileName, { password: transporeonSheetPassword });
            sheets = workbookSelected.SheetNames;
        } catch (error) {
            console.error('💥 Error reading the Excel file', error);
            throw error;
        }

        if (!sheets || sheets.length === 0) {
            console.log('💥 The Excel file provided is empty (there isn\'t any tab nor spreadsheet in your Excel file).');
            console.log('🌜 Ending Node.js process...');
            process.exit(0);
        }

        /**
         * Creates a list of sheet choices for the user.
         * @type {Object[]} An array of choice objects.
         * @property {string} name - The name of the Excel spreadsheet (tab).
         * @property {string} value - The name of the Excel spreadsheet (tab).
         */
        const choicesSheet = sheets.map(sheet => ({
            name: sheet,
            value: sheet
        }));

        /**
         * Prompts the user to select a spreadsheet (Excel tab) to process.
         * @returns {Promise<{targetTab: string}>} A promise that resolves to an object containing the name of the selected Excel spreadsheet (tab).
         */
        const answerSheet = await inquirer.prompt([
            {
                type: 'list',
                name: 'targetTab',
                message: '🗯️ Please select a spreadsheet (Excel tab) to process:',
                choices: choicesSheet
            }
        ]);

        return {
            fileName: answerFile.fileName,
            targetTab: answerSheet.targetTab
        };

    } catch (err) {
        console.error(err);
        throw err;
    }
}

export default userChosenFile;
