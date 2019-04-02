const d3 = require('d3-dsv');
const fs = require('fs');
const moment = require('moment');
const canvas = require('canvas-api-wrapper');
const questions = require('../questions');
const generator = require('../generate');

const TEST = false;

/**************************************************
 * getInput
 * @returns {Object}
 * 
 * This function handles all of the input from the
 * user.
 *************************************************/
async function getInput() {
    let s = await questions.promptTermSemesterQuestion();
    let y = await questions.promptTermYearQuestion();
    let t = await questions.promptTermTypeQuestion();

    return {
        semester: s.termSemester,
        year: y.termYear,
        type: t.termType
    };
}

/**************************************************
 * processOutput
 * @param {Object} term
 * 
 * This function processes the output by calling
 * the correct functions to organize/filter data
 * into an array of objects to be injected into 
 * a csv.
 *************************************************/
async function processOutput(term) {
    //ensure that the folder exists 
    checkFolder();

    let time = moment().format('MM-DD-YY');
    const path = `./generatedCsv/generated_on_${time}${TEST ? '_test' : ''}.csv`;
    const columns = [
        'id',
        'name',
        'sis_course_id',
        'course_code',
        'instructor',
        'instructor_id'
    ];

    //retrieve and filter data 
    let results = await generator.generate(term);
    // let data = await apiCall(`${term.semester} ${term.year}`);
    // let results = filterResults(data, term);

    //store data
    let csv = d3.csvFormat(results, columns);
    fs.writeFileSync(path, csv);
    console.log('Inserted a CSV in generatedCsv folder.');
}

/**************************************************
 * handleError
 * @param {Error} error
 * 
 * This function simply handles all of the errors
 * that could possibly happen.
 *************************************************/
function handleError(error) {
    console.log('ERROR: ', error);
}

/**************************************************
 * checkFolder
 * 
 * This function checks for a folder and creates one
 * if it does not exist
 *************************************************/
function checkFolder() {
    const path = './generatedCsv';

    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}

/**************************************************
 * generateIO
 * @returns {undefined}
 * 
 * This serves as a driver function to generate
 * the CSV necessary for the job.
 *************************************************/
async function generateIO() {
    try {
        let input = await getInput();
        let output = await processOutput(input);

        return output;
    } catch (err) {
        if (err) {
            handleError(err);
            return;
        }
    }
}

module.exports = {
    generateIO
}