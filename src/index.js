const log = console.log;
const canvas = require('canvas-api-wrapper');
const theCli = require('./cli');
const theCsv = require('./csv');
const questions = require('./questions');

(async () => {
    const results = await questions.promptInitialQuestion();
    let data;

    if (results.type === 'csv') {
        data = await theCsv.retrieveCSV();
    } else {
        data = await theCli.cli();
    }
})();