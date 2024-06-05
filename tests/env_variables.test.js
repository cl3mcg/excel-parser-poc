// Import the necessary libraries
import { expectTypeOf, test } from 'vitest'
import dotenv from 'dotenv';
dotenv.config();

// Import the necessary variables
const apiKey = process.env.MISTRAL_API_KEY || null;
const aiModel = process.env.MISTRAL_MODEL || null;
const transporeonSheetPassword = process.env.TRANSPOREON_SHEET_PASSWORD || null;

// Define the test(s)
test('MistralAI API key test', () => {
    expectTypeOf(apiKey).not.toBeNull();
    expectTypeOf(apiKey).not.toBeUndefined();
    expectTypeOf(apiKey).toBeString();
});

test('MistralAI model test', () => {
    expectTypeOf(aiModel).not.toBeNull();
    expectTypeOf(aiModel).not.toBeUndefined();
    expectTypeOf(aiModel).toBeString();
});

test('Transporeon Spreadsheet password test', () => {
    expectTypeOf(transporeonSheetPassword).not.toBeNull();
    expectTypeOf(transporeonSheetPassword).not.toBeUndefined();
    expectTypeOf(transporeonSheetPassword).toBeString();
});