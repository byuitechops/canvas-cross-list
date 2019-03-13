const fs = require('fs');
const d3 = require('d3-dsv');
const theCsv = require('../handCsv');

/******************************************
 * getInput
 * @returns {Object}
 * 
 * 
 *****************************************/
async function getInput() {
    return theCsv.retrieveCSV();
}

/******************************************
 * processOutput
 * @param {Object} input
 * @returns {Array}
 * 
 * This returns a JSON object of the CSV
 * given by the user.
 *****************************************/
async function processOutput(input) {
    return d3.csvParse(fs.readFileSync(input.csvLocation, 'utf-8'));
}

/******************************************
 * handleError
 * @param {Error} error
 * 
 * This simply logs the error to the console.
 *****************************************/
function handleError(error) {
    console.log('ERROR: ', error);
}

/******************************************
 * handmadeCsvIO
 * 
 * This function acts as a driver for the
 * CSVs that are handmade by the author.
 *****************************************/
async function handmadeCsvIO() {
    try {
        let input = getInput();
        let output = processOutput(input);

        return output;
    } catch (err) {
        if (err) {
            handleError(err);
            return;
        }
    }
}

module.exports = {
    'handCsv': handmadeCsvIO
}