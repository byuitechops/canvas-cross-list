const d3 = require('d3-dsv');
const fs = require('fs');
const moment = require('moment');
const canvas = require('canvas-api-wrapper');
const questions = require('../questions');

const BAD_PHRASES = [
    'Master',
    'Initiative'
];

// cli stuff here
async function getInput() {
    let s = await questions.promptTermSemesterQuestion();
    let y = await questions.promptTermYearQuestion();

    return {
        semester: s.termSemester,
        year: y.termYear
    };
}

function checkFolder() {
    const path = './generatedCsv';

    if (!fs.existsSync(path))
        fs.mkdirSync(path);
}

// generate CSV here
async function processOutput(term) {
    checkFolder();

    let time = moment().format('MM-DD-YY');
    const path = `./generatedCsv/generated_${time}`;
    const columns = [
        'id',
        'name',
        'sis_course_id',
        'course_code'
    ];

    let data = await apiCall(`${term.semester} ${term.year}`)
    let results = filterResults(data);

    console.log(results);
    let csv = d3.csvFormat(results, columns);
    fs.writeFileSync(path, csv);
}

function handleError(error) {
    console.log('ERROR: ', error);
}

function filterResults(results) {
    let arr = [];

    results.forEach(result => {
        let id = result.id;
        let name = result.name;
        let sis_course_id = result.sis_course_id;
        let course_code = result.course_code;
        if (id && name && sis_course_id && course_code) {
            arr.push({
                id: id,
                name: name,
                sis_course_id: sis_course_id,
                course_code: course_code
            });
        }
    });

    return arr;
}

async function apiCall(term) {
    const accountId = 1;
    const termInt = await identifyTermInteger(term);

    let results = await canvas.get(`/api/v1/accounts/${accountId}/courses?enrollment_term_id=${termInt}&blueprint=false`);

    return results;
}

async function mapTermToInteger(term) {
    const accountId = 1;
    let termsArr = [];

    let results = await canvas.get(`/api/v1/accounts/${accountId}/terms`);

    results.forEach(result => {
        // only append the ones that matter to the array
        if (/\d/g.test(result.name)) {
            termsArr.push({
                'id': result.id,
                'term': result.name,
            });
        }
    });

    return termsArr;
}

async function identifyTermInteger(term) {
    let map = await mapTermToInteger(term);
    let id = -1;

    map.forEach(ele => {
        if (ele.term.toUpperCase() === term.toUpperCase()) {
            id = ele.id;
        }
    });

    return id;
}

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