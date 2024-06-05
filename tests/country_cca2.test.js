// Import the required libraries
import { expect, expectTypeOf, test } from 'vitest';

// Import the required function(s)
import getCleanedCountryCodes from '../functions/country_cca2.js';

// Create variables
const dummy_mostProbableCountryColumns = [{ columnIndex: 0, columnName: 'Country', bestProbabilityResult: 1 }]
const dummy_excelData = [
    {
        Country: 'China',
        'Shipper City': 'Chengdu',
        'Shipper Zip code': 'All zip codes',
        'Consignee City ': 'Cochin',
        'Consignee Zipcode': 682314,
        'Port Pair': 'CTU to COK',
        'Payor name': 'AFCI Cochin',
        "20'": 5,
        "40'": 0
    },
    {
        Country: 'Estonia',
        'Shipper City': 'Talin',
        'Shipper Zip code': 13914,
        'Consignee City ': 'Bangalore',
        'Consignee Zipcode': 560076,
        'Port Pair': 'TLL to MAA',
        'Payor name': 'AFCI Bangalore',
        "20'": 2,
        "40'": 6
    },
    {
        Country: 'Hongkong',
        'Shipper City': 'Hongkong',
        'Shipper Zip code': 'All zip codes',
        'Consignee City ': 'Cochin',
        'Consignee Zipcode': 682315,
        'Port Pair': 'HKG to COK',
        'Payor name': 'AFCI Cochin',
        "20'": 12,
        "40'": 18
    },
    {
        Country: 'India',
        'Shipper City': 'Cochin',
        'Shipper Zip code': 682314,
        'Consignee City ': 'Houten',
        'Consignee Zipcode': 3992,
        'Port Pair': 'COK to RTM',
        'Payor name': 'AFCI IRTW',
        "40'": 45
    },
    {
        Country: 'India',
        'Shipper City': 'Cochin',
        'Shipper Zip code': 682314,
        'Consignee City ': 'Hongkong',
        'Consignee Zipcode': 'All zipcode',
        'Port Pair': 'COK to HKG',
        'Payor name': 'AFCI Cochin',
        "20'": 25,
        "40'": 40
    },
    {
        Country: 'India',
        'Shipper City': 'Cochin',
        'Shipper Zip code': 682314,
        'Consignee City ': 'Singapore',
        'Consignee Zipcode': 'All zipcode',
        'Port Pair': 'COK to SIN',
        'Payor name': 'AFCI Cochin',
        "20'": 60,
        "40'": 30
    },
    {
        Country: 'JPN',
        'Shipper City': 'Narita',
        'Shipper Zip code': '100-8164',
        'Consignee City ': 'Singapore',
        'Consignee Zipcode': '629216',
        'Port Pair': 'NRT to SIN',
        'Payor name': 'AFCI Connectors Singapore',
        "20'": 6,
        "40'": 5
    },
    {
        Country: 'Malsia',
        'Shipper City': 'Bukit',
        'Shipper Zip code': 'All Zipcodes',
        'Consignee City ': 'Calexico',
        'Consignee Zipcode': 'All Zipcodes',
        'Port Pair': 'PEN to SAN',
        'Payor name': 'ATCS Mexicali',
        "20'": 12,
        "40'": 4
    },
    {
        Country: 'Mexico',
        'Shipper City': 'Calexico',
        'Shipper Zip code': 'All Zipcodes',
        'Consignee City ': 'Penang',
        'Consignee Zipcode': 'All Zipcodes',
        'Port Pair': 'SAN to PEN',
        'Payor name': 'ATCS Penang',
        "20'": 8,
        "40'": 7
    },
    {
        Country: 'Singapore',
        'Shipper City': 'Singapore',
        'Shipper Zip code': '128470',
        'Consignee City ': 'Cochin',
        'Consignee Zipcode': '682314',
        'Port Pair': 'SIN to COK',
        'Payor name': 'AFCI Cochin',
        "20'": 24
    },
    {
        Country: 'SG',
        'Shipper City': 'Singapore',
        'Shipper Zip code': 'All zip codes',
        'Consignee City ': 'Bangalore',
        'Consignee Zipcode': 560076,
        'Port Pair': 'SIN to MAA',
        'Payor name': 'AFCI Bangalore',
        "20'": 3,
        "40'": 4
    },
    {
        Country: 'Taiwan',
        'Shipper City': 'Taoyun',
        'Shipper Zip code': 'All Zipcodes',
        'Consignee City ': 'Bangalore',
        'Consignee Zipcode': 560076,
        'Port Pair': 'KEE to MAA',
        'Payor name': 'AFCI Bangalore',
        "20'": 10,
        "40'": 12
    },
    {
        Country: 'USA',
        'Shipper City': 'Chicago',
        'Shipper Zip code': 'All zip codes',
        'Consignee City ': 'Bangalore',
        'Consignee Zipcode': 560076,
        'Port Pair': 'LGB to MAA',
        'Payor name': 'AFCI Bangalore',
        "20'": 5,
        "40'": 2
    }
]

// Define the test(s)
test('getCleanedCountryCodes test', async () => {
    expectTypeOf(await getCleanedCountryCodes(dummy_mostProbableCountryColumns, dummy_excelData)).not.toBeNull();
    expectTypeOf(await getCleanedCountryCodes(dummy_mostProbableCountryColumns, dummy_excelData)).not.toBeUndefined();
    expectTypeOf(await getCleanedCountryCodes(dummy_mostProbableCountryColumns, dummy_excelData)).toBeArray();
    expect(await getCleanedCountryCodes(dummy_mostProbableCountryColumns, dummy_excelData)).not.toHaveLength(0);
});
