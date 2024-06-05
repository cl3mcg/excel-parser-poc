// Importing the necessary libraries
import fs from 'fs';
import MistralClient from '@mistralai/mistralai';
import dotenv from 'dotenv';
dotenv.config();

// Importing the necessary .env variables
const aiModel = process.env.MISTRAL_MODEL || null;
const apiKey = process.env.MISTRAL_API_KEY || null;

// Defining the necessary variables
import countriesDataSet from "../assets/countries.json" assert { type: "json" };
const client = new MistralClient(apiKey);
const promptAI = fs.readFileSync('./assets/promptAI.txt', 'utf8');

// Define function
const callMistral = async function (countryNameProvided) {
    const pseudoCountryName = countryNameProvided;

    const chatResponse = await client.chat({
        model: aiModel,
        messages: [{ role: 'user', content: `${promptAI} ${pseudoCountryName}` }]
    });

    if (chatResponse.choices[0].message.content !== "null"
        && chatResponse.choices[0].message.content.length === 2
        && countriesDataSet.filter((country) => country.cca2 === chatResponse.choices[0].message.content).length > 0) {
        return chatResponse.choices[0].message.content;
    }

    return null;
};

export default callMistral;