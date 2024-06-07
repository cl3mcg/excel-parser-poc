// Imports necessary libraries.
import fs from 'fs';
import MistralClient from '@mistralai/mistralai';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Imports necessary environment variables.
 * @type {string|null} aiModel - The Mistral AI model to use, or null if not provided.
 */
const aiModel = process.env.MISTRAL_MODEL || null;

/**
 * Imports necessary environment variables.
 * @type {string|null} apiKey - The API key for Mistral AI, or null if not provided.
 */
const apiKey = process.env.MISTRAL_API_KEY || null;

// Defining the necessary variables
import countriesDataSet from "../assets/countries.json" assert { type: "json" };
const client = new MistralClient(apiKey);
const promptAI = fs.readFileSync('./assets/promptAI.txt', 'utf8');

/**
 * Calls the Mistral AI model with a given country name and returns the two-letter country code if valid.
 * 
 * This function uses the Mistral AI client to send a prompt message with a provided country name.
 * It reads a prompt from a text file and appends the country name to it before sending the message.
 * If the AI response is a valid two-letter country code found in the provided dataset, the code is returned.
 * 
 * @async
 * @function callMistral
 * @param {string} countryNameProvided - The pseudo-name of the country to query.
 * @returns {Promise<string|null>} A promise that resolves to the two-letter country code if the AI response is valid, or null if invalid.
 * @throws {Error} Will throw an error if the Mistral AI model or API key is not provided.
 * @throws {Error} Will throw an error if the chat request fails.
 * 
 */
const callMistral = async function (countryNameProvided) {
    if (!aiModel) {
        throw new Error(`Mistral AI model not provided. Make sure to provide a valid "MISTRAL_MODEL" environment variable in your .env file.`);
    }
    if (!apiKey) {
        throw new Error(`Mistral AI API key not provided. Make sure to provide a valid "MISTRAL_API_KEY" environment variable in your .env file.`);
    }

    const pseudoCountryName = countryNameProvided;

    try {
        /**
         * Sends a chat message to the Mistral AI client with the provided country name.
         * @type {Object} chatResponse - The response object from the AI client.
         * @property {Array} chatResponse.choices - Array of response choices.
         * @property {Object} chatResponse.choices[0].message - The message object of the first choice.
         * @property {string} chatResponse.choices[0].message.content - The content of the response message.
         */
        const chatResponse = await client.chat({
            model: aiModel,
            messages: [{ role: 'user', content: `${promptAI} ${pseudoCountryName}` }]
        });

        /**
         * Validates the AI response content.
         * @returns {string|null} The two-letter country code if valid, otherwise null.
         */
        const aiResponse = chatResponse.choices[0].message.content;

        if (aiResponse !== "null"
            && aiResponse.length === 2
            && countriesDataSet.some(country => country.cca2 === aiResponse)) {
            return aiResponse;
        }

        return null;
    } catch (error) {
        console.error('Error calling Mistral AI:', error);
        throw error;
    }
};

export default callMistral;
