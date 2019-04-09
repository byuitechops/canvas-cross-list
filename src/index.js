const fs = require('fs');
const d3 = require('d3-dsv');
const log = console.log;
const crossListBuilder = require('./crossListBuilder');
const io = require('./IO/generateIO');
const api = require('./api');
const cxAdapter = require('./cxAdapter');
const c = require('./compare');
const f = require('./getFailed');

(async () => {
    // c.compare();
    // await io.generateIO();

    let data = await cxAdapter.adapterWithFile();
    // let data = d3.csvParse(fs.readFileSync('./generatedCsv/generated_on_04-03-19.csv', 'utf-8'));
    let results = await crossListBuilder.buildCrossListData(data);
    fs.writeFileSync(`./results/cxCrosslist_${Date.now()}.json`, JSON.stringify(results, null, 4));
    // let coursesNotCrossListed = f.getFailed(results);

    // fs.writeFileSync('./results/coursesFailedRequirements.json', JSON.stringify(coursesNotCrossListed, null, 4));

    // console.log(Array.isArray(results));
    // log(JSON.stringify(results, null, 4));
    // results = results.slice(0, 10)

    // let checkResults = await api.crossListApi(results);
})();