const d3 = require('d3-dsv');
const path = require('path');
const getCSV = require('read-in-csv');
const apiModule = require('../api');
const crossListBuilder = require('../crossListBuilder');

async function getInput() {
    let csvFile = process.argv[2];

    if (!csvFile) {
        throw new Error('Error with file. Please ensure that you are including it in the commandline.\nRefer to the README for more information.');
    }

    if (path.extname(csvFile) !== '.csv') {
        throw new Error('Error with file. It must be a CSV file.\nRefer to the README for more information.');
    }

    try {
        fs.accessSync(path, fs.constants.F_OK);
    } catch (err) {
        throw new Error('CSV file does not exist...');
    }

    return csvFile;
}

// return it as js object
async function processOutput(input) {
    try {
        let csvInfo = d3.csvParse(fs.readFileSync(input, 'utf-8'));
        let csvData = await crossListBuilder.buildCrossListData(csvInfo);

        await apiModule.crossListApi(csvData);
    } catch (err) {
        throw err;
    }
}

function handleError(error) {
    console.log('ERROR: ', error);
}

async function apiIO() {
    try {
        let input = getInput();
        return await processOutput(input);
    } catch (err) {
        if (err) {
            handleError(err);
            return;
        }
    }
}

module.exports = {
    apiIO
}