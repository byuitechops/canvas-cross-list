const fs = require('fs');
const d3 = require('d3-dsv');
const log = console.log;
const logic = require('./logic');
const canvas = require('canvas-api-wrapper');

(async () => {
    let data = d3.csvParse(fs.readFileSync('./generatedCsv/generated_on_03-11-19.csv', 'utf-8'));
    let results = await logic.logic(data);
    log(JSON.stringify(results, null, 4));
})();