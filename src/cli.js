const log = console.log;
const chalk = require('chalk');
const questions = require('./questions.js');

/*****************************************
 * cli
 * 
 * This function is the driver for all
 * CLI related stuff.
 ****************************************/
async function cli() {
    let flag = false;
    let firstFlag = false;
    let userObj;

    while (!flag) {
        userObj = await prompt(firstFlag);
        displayObj(userObj);
        let results = await questions.promptRedo();

        if (results.redo) flag = true;

        firstFlag = true;
    }

    return userObj;
}

/*****************************************
 * prompt
 * @param {Boolean} val
 * @return {Object} both source and dest
 * 
 * This function prompts for both source
 * and destination.
 ****************************************/
async function prompt(val) {
    log(chalk.yellow(`${val ? '\n' : ''}Enter ${chalk.bold('source course OU')} to cross list from (Enter 0 to finish):`));
    let sourceOUs = await getSource();

    log(chalk.yellow(`\nEnter ${chalk.bold('destination course OU')} to cross list source OUs to:`));
    let destinationOU = await getDestination();

    return {
        sourceOUs,
        destinationOU
    };
}

/*****************************************
 * displayObj
 * @param {Object} obj
 * 
 * This displays the object in a pretty
 * way.
 ****************************************/
function displayObj(obj) {
    log(chalk.bold('Source OU(s):'), chalk.bold(displayArray(obj.sourceOUs)));

    log(chalk.bold(`Destination OU: ${obj.destinationOU}`));
}

/*****************************************
 * displayArray
 * @param {Array} arr
 * @returns {String} final string to 
 * print out
 * 
 * This displays the Array with commas 
 * and the word and between second to last
 * and the last word.
 ****************************************/
function displayArray(arr) {
    return [arr.slice(0, -1).join(', '), arr.slice(-1)[0]].join(arr.length < 2 ? '' : ' and ');
}

/*****************************************
 * getSource
 * 
 * This gets all of the source OUs. There
 * can be one or more source OU.
 ****************************************/
async function getSource() {
    let sourceOUs = [];
    flag = false;
    while (!flag) {
        let answer = await questions.promptSource();
        answer = parseInt(answer.sourceOU, 10);

        if (answer !== 0) sourceOUs.push(answer);
        if (answer === 0) flag = true;
    }

    return sourceOUs;
}

/*****************************************
 * getDestination
 * 
 * This gets the destination OU. There is
 * only one destination OU.
 ****************************************/
async function getDestination() {
    let answer = await questions.promptDestination();

    return answer.destinationOU;
}

module.exports = {
    cli
}