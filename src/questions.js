const inquirer = require('inquirer');

/**************************QUESTIONS****************************/

const sourceQuestion = [{
    type: 'input',
    name: 'sourceOU',
    message: 'Enter source OU:',
    validation: answer => {
        if (!answer.test(/^\d+$/)) return 'Invalid input';

        return true;
    }
}];

const destinationQuestion = [{
    type: 'input',
    name: 'destinationOU',
    message: 'Enter destination OU:',
    validation: answer => {
        if (!answer.test(/^\d+$/)) return 'Invalid input';

        return true;
    }
}];

const redoQuestion = [{
    type: 'confirm',
    name: 'redo',
    message: 'Is the above OUs correct?',
}];

const csvQuestion = [{
    type: 'input',
    name: 'csvLocation',
    message: 'Enter the path to your CSV file:'
}];

const initialQuestion = [{
    type: 'list',
    name: 'type',
    message: 'CLI or CSV?',
    choices: ['CLI', 'CSV'],
    filter: val => val.toLowerCase()
}];

/**************************FUNCTIONS**************************/

async function promptSource() {
    return await inquirer.prompt(sourceQuestion);
}

async function promptDestination() {
    return await inquirer.prompt(destinationQuestion);
}

async function promptRedo() {
    return await inquirer.prompt(redoQuestion);
}

async function promptCSV() {
    return await inquirer.prompt(csvQuestion);
}

async function promptInitialQuestion() {
    return await inquirer.prompt(initialQuestion);
}

module.exports = {
    promptSource,
    promptDestination,
    promptRedo,
    promptCSV,
    promptInitialQuestion
};