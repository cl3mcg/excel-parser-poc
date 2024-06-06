// Import the required libraries
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { promisify } from 'util';
import XLSX from "xlsx";

// Import the required .env variables
const transporeonSheetPassword = process.env.TRANSPOREON_SHEET_PASSWORD || null;

// Get the current module's directory path
const projectDirectory = path.resolve()

const readdirAsync = promisify(fs.readdir);

const userChosenFile = async function () {

    // Read the contents of the worksheets directory
    try {
        const files = await readdirAsync(path.join(projectDirectory, 'worksheets'));

        // Filter out only .xlsx files
        const xlsxFiles = files.filter(file => path.extname(file) === '.xlsx');

        // Create a list of choices for the user
        const choicesFile = xlsxFiles.map(file => ({
            name: file,
            value: path.join(projectDirectory, 'worksheets', file)
        }));

        // Check if the "worksheet" directory actually has any Excel files in it.
        if (choicesFile.length === 0) {
            // Gracefully end the script
            console.log('💥 The content of your "worksheet" directory is empty. There is nothing to analyse.');
            console.log('🌜 Ending Node.js process...');
            process.exit(0);
        };

        // Prompt the user to select a file
        const answerFile = await inquirer.prompt([
            {
                type: 'list',
                name: 'fileName',
                message: '🗯️ Please select an Excel file to process:',
                choices: choicesFile
            },
        ]);

        // Create a sheets variable used to store the Excel tab names.
        let sheets = null;

        try {
            const workbookSelected = XLSX.readFile(answerFile.fileName, { password: `${transporeonSheetPassword}` }) ? XLSX.readFile(answerFile.fileName, { password: `${transporeonSheetPassword}` }) : new Error;
            sheets = workbookSelected.SheetNames ? workbookSelected.SheetNames : new Error;
        } catch (error) {
            console.error('💥 Error reading the Excel file', error)
        }

        // Check if the Excel file actually has any tabs in it.
        if (!sheets || sheets.length === 0) {
            // Gracefully end the script
            console.log(`💥 The Excel file provided is empty (there isn't any tab nor speadsheet in your Excel file).`);
            console.log('🌜 Ending Node.js process...');
            process.exit(0);
        };


        // Create a list of sheet choices for the user
        const choicesSheet = sheets.map(sheet => ({
            name: sheet,
            value: sheet
        }));

        // Prompt the user to select a sheet
        const answerSheet = await inquirer.prompt([
            {
                type: 'list',
                name: 'targetTab',
                message: '🗯️ Please select an speadsheet (Excel tab) to process:',
                choices: choicesSheet
            },
        ]);

        // Use the selected file and target tab in your app
        return {
            fileName: answerFile.fileName,
            targetTab: answerSheet.targetTab
        }

    } catch (err) {
        console.error(err);
        return;
    }
}

export default userChosenFile
