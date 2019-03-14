const pretty = require('json-stringify-pretty-compact');
const fs = require('fs');
const d3 = require('d3-dsv');
const log = console.log;
const crossListBuilder = require('./crossListBuilder');
const canvas = require('canvas-api-wrapper');

(async () => {
    let data = d3.csvParse(fs.readFileSync('./generatedCsv/generated_on_03-11-19.csv', 'utf-8'));
    let results = await crossListBuilder.buildCrossListData(data);
    log(pretty(results));
})();