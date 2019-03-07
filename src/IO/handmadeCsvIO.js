const questions = require('./questions.js');
const theCsv = require('./handCsv');

async function getInput() {
    return parseCSV(await questions.promptCSV());
}

// return it as js object
async function processOutput(input) {

}

function handleError(error) {
    console.log('ERROR: ', error);
}

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