const cxModule = require('../adapter');
const crossListBuilder = require('../crossListBuilder');

async function getInput() {
    // get the lmsFilename/cxFilename
    let cxInformation = await cxModule.retrieveCx();

    try {
        fs.accessSync(cxInformation.cxFilename, fs.constants.F_OK);
    } catch (err) {
        throw new Error('File does not exist...');
    }

    return JSON.parse(fs.readFileSync(cxInformation.cxFilename, 'utf-8'));
}

async function processOutput(input) {
    try {
        return await crossListBuilder.buildCrossListData(input);
    } catch (err) {
        throw err;
    }
}

function handleError(error) {
    console.log('ERROR: ', error);
}

async function cxIO() {
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
    cxIO
}