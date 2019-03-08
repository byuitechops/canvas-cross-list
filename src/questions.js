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

const termSemesterQuestion = [{
    type: 'list',
    name: 'termSemester',
    message: 'Choose term semester:',
    choices: ['Winter', 'Spring', 'Summer', 'Fall'],
    filter: val => val.toLowerCase()
}];

const termYearQuestion = [{
    type: 'input',
    name: 'termYear',
    message: 'Enter term year (2019):',
    validation: answer => {
        if (!answer.test(/^\s*\d{4}\s*$/g)) return 'Invalid input';
        return true;
    }
}];

const termTypeQuestion = [{
    type: 'list',
    name: 'termType',
    message: 'Choose the following:',
    choices: ['Campus', 'Online/Pathway'],
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

async function promptTermSemesterQuestion() {
    return await inquirer.prompt(termSemesterQuestion);
}

async function promptTermYearQuestion() {
    return await inquirer.prompt(termYearQuestion);
}

async function promptTermTypeQuestion() {
    return await inquirer.prompt(termTypeQuestion);
}

module.exports = {
    promptSource,
    promptDestination,
    promptRedo,
    promptCSV,
    promptInitialQuestion,
    promptTermSemesterQuestion,
    promptTermYearQuestion,
    promptTermTypeQuestion
};