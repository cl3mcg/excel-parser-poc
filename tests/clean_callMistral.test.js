// Import the required libraries
import { expect, expectTypeOf, test } from 'vitest';

// Import the required function
import callMistral from '../functions/clean_callMistral.js';

// Defining a test variable
const testCountryName = "Ytaly";

// Define the test(s)
test('Mistral AI call test', async () => {

    // Call the chatResponse function with the test variable and await the result
    const resultOfTheCall = await callMistral(testCountryName);

    // Now you can use the resultOfTheCall variable in your tests
    expectTypeOf(resultOfTheCall).not.toBeUndefined();
    expectTypeOf(resultOfTheCall).not.toBeNull();
    expectTypeOf(resultOfTheCall).toBeString();
    expect(resultOfTheCall).toHaveLength(2);
});
