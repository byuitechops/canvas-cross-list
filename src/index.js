const fs = require('fs');
const d3 = require('d3-dsv');
const log = console.log;
const crossListBuilder = require('./crossListBuilder');
const io = require('./IO/generateIO');
const api = require('./api');

(async () => {
    // await io.generateIO();

    let data = d3.csvParse(fs.readFileSync('./generatedCsv/generated_on_03-26-19.csv', 'utf-8'));
    let results = await crossListBuilder.buildCrossListData(data);
    // log(JSON.stringify(results, null, 4));

    let checkResults = await api.crossListApi(results);
})();