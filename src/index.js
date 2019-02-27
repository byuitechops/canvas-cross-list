const log = console.log;
const canvas = require('canvas-api-wrapper');
const theCli = require('./cli.js');

(async () => {
    let userObj = await theCli.cli();
})();