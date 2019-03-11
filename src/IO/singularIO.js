const singular = require('../singularCrossList');

/*******************************************
 * getInput
 * @returns {Object}
 * 
 * This calls the CLI portion from the 
 * singularCrossList library. 
 ******************************************/
async function getInput() {
    return singular.cli();
}

/*******************************************
 * getInput
 * @returns {Object}
 * 
 * Since getInput makes a call to the singular
 * library that handles everything, this does
 * not need to do anything. It just returns
 * the object.
 ******************************************/
async function processOutput(input) {
    return input;
}

/*******************************************
 * handleError
 * @param {Error} error
 * 
 * This simply logs the error to the console.
 ******************************************/
function handleError(error) {
    console.log('ERROR: ', error);
}

/******************************************
 * singularCrossListIO
 * 
 * This function acts as a driver for the
 * singular cross list.
 *****************************************/
async function singularCrossListIO() {
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
    'singularCL': singularCrossListIO
}