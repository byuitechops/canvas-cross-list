const log = console.log;
const canvas = require('canvas-api-wrapper');
const generate = require('./IO/generateIO');

(async () => {
    let results = await generate.generateIO();
})();