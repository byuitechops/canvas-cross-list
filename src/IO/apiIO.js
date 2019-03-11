const d3 = require('d3-dsv');
const fs = require('fs');
const canvas = require('canvas-api-wrapper');
const questions = require('../questions');

async function getInput() {

}

// return it as js object
async function processOutput(input) {

}

function handleError(error) {
    console.log('ERROR: ', error);
}

async function apiIO() {
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
    apiIO
}