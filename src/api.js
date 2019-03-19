/*
    - Is it the same teacher?
    - Warn if it is not the same course name
    - Grade activity > 0
    - Moving to a course that doesn't have a section.
    - Moving from a course that has more than one section
    - Same subaccount/term -- helpers.mapTermToInteger()
*/

const canvas = require('canvas-api-wrapper');
const asyncLib = require('async');
const promiseQueueLimit = require('./promiseQueueLimit');
const {
    promisify
} = require('util');
const asyncEach = promisify(asyncLib.each);

/**************************************************************
 * checkGradebookActivity
 * @param {Int} courseId
 * @returns {Bool}
 * 
 * This function returns a boolean on whether there was any
 * grade change events in the gradebook when given a course id.
 *************************************************************/
async function checkGradebookActivity(courseId) {
    let gradeChanges = await canvas.get(`/api/v1/audit/grade_change/courses/${courseId}`);

    return gradeChanges.events.length === 0;
}

/**************************************************************
 * checkSubAccount
 * @param {Object} firstCourse
 * @param {Object} secondCourse
 * @returns {Bool}
 * 
 * 
 *************************************************************/
async function checkSubAccount(firstCourse, secondCourse) {
    if ((!firstCourse.account ||
            !secondCourse.account) ||
        (!firstCourse.account.id ||
            !secondCourse.account.id)) return false;

    return firstCourse.account.id === secondCourse.account.id;
}

/**************************************************************
 * checkTerm
 * @param {Object} firstCourse
 * @param {Object} secondCourse
 * @returns {Bool}
 * 
 * 
 *************************************************************/
async function checkTerm(firstCourse, secondCourse) {
    if ((!firstCourse.term ||
            !secondCourse.term) ||
        (!firstCourse.term.id ||
            !secondCourse.term.id)) return false;

    return firstCourse.term.id === secondCourse.term.id;
}

/**************************************************************
 * checkTermAccount
 * @param {Object} firstCourse
 * @param {Object} secondCourse
 * @returns {Object}
 * 
 * 
 *************************************************************/
async function checkTermAccount(firstCourse, secondCourse) {
    let fCourse = await canvas.get(`/api/v1/courses/${firstCourse.courseId}?include[]=sections&include[]=term&include[]=account`);
    let sCourse = await canvas.get(`/api/v1/courses/${secondCourse.courseId}?include[]=sections&include[]=term&include[]=account`);

    return {
        term: await checkTerm(fCourse, sCourse),
        subAccount: await checkSubAccount(fCourse, sCourse)
    }
}

/**************************************************************
 * checkSections
 * @param {Int} sourceId
 * @returns {Bool}
 * 
 * 
 *************************************************************/
async function checkSections(sourceId) {
    let sectionsCourse = await canvas.get(`/api/v1/courses/${sourceId}/sections`);

    return sectionsCourse.length === 1;
}

/**************************************************************
 * checkDestination
 * @param {Int} destinationId
 * @returns {Bool}
 * 
 * 
 *************************************************************/
async function checkDestination(destinationId) {
    let destinationCourse = await canvas.get(`/api/v1/courses/${destinationId}/sections`);

    return destinationCourse.length > 0;
}

/**************************************************************
 * checkCourse
 * @param {Object} crossListObject
 * @returns {Object}
 * 
 * This is the master for all checks and makes sure that all
 * of the requirements are checked before initiating the API
 * call to do the cross list. This will return an object
 * like this: 
 * 
 * {
 *      pass: true/false
 *      reason: (this will be NULL or the requirement it failed)
 * }
 * 
 * Whatever this function returns is what will be put into the 
 * report.
 *************************************************************/
async function checkCourse(crossListObject) {
    //check grade book activity
    //same subaccount
    //moving to a course that has no sections
    //moving from a course that has more than one section

    let checkers = [];
    let destination = crossListObject.destination;
    let sources = crossListObject.sources;

    /******************** GRADE ACTIVITY *******************************/
    let gradeActivityPass = true;
    for (let source of sources) {
        let gradeActivityResults = await checkGradebookActivity(source.courseId);
        if (!gradeActivityResults) gradeActivityPass = false;
    }

    checkers.push({
        pass: gradeActivityPass,
        type: 'Grade Activity'
    });

    /******************** TERM/SUBACCOUNT ******************************/
    let sameSubAccountPass = true;
    let sameTermPass = true;
    for (let source of sources) {
        let termSubAccountResults = await checkTermAccount(destination, source);
        if (!termSubAccountResults.term) sameTermPass = false;
        if (!termSubAccountResults.subAccount) sameSubAccountPass = false;
    }

    checkers.push({
        pass: sameTermPass,
        type: 'Same Term'
    });

    checkers.push({
        pass: sameSubAccountPass,
        type: 'Same Subaccount'
    });

    /**************** SECTIONS (SOURCE) *****************************/
    let sectionsPass = true;
    for (let source of sources) {
        let sectionsResults = await checkSections(source.courseId);
        if (!sectionsResults) sectionsPass = false;
    }

    checkers.push({
        pass: sectionsPass,
        type: 'Source sections'
    });

    /**************** SECTIONS (DEST) ******************************/
    let sectionsDestinationPass = await checkDestination(destination.courseId);
    checkers.push({
        pass: sectionsDestinationPass,
        type: 'Destination sections'
    });

    return checkers;
}

function masterChecker(crossListData, crossListCounter) {
    return async function check(crossListObject) {
        return new Promise(async (resolve, reject) => {
            checkCourse(crossListObject)
                .then(singleChecker => {
                    console.log(`(${++crossListCounter}/${crossListData.length}) Course: ${crossListObject.course} with Professor ${crossListObject.instructor} checked.`);
                    resolve(singleChecker);
                })
                .catch(err => {
                    console.log(`(${++crossListCounter}/${crossListData.length}) Course: ${crossListObject.course} with Professor ${crossListObject.instructor} checked.`);
                    reject({
                        courseObject: crossListObject,
                        message: err
                    });
                });
        });
    }
}

async function processCrossListData(crossListData) {
    let queueLimit = 10;
    let crossListCounter = 0;

    console.log(`Found ${crossListData.length} potential cross-listing matches.`);
    console.log(`Checking each against requirements...`);

    await promiseQueueLimit(crossListData, masterChecker(crossListData, crossListCounter), queueLimit, closingSteps);
}

function closingSteps(err, data) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(data);
    console.log('FINISHED RUNNING');
}

/**************************************************************
 * analyzeCrossListData
 * @param {Array} crossListData
 * 
 * 
 *************************************************************/
async function analyzeCrossListData(crossListData) {
    await processCrossListData(crossListData);
    // return await Promise.all(crossListData.map(async crossListObject => {
    //     let data = await masterChecker(crossListObject);
    //     console.log(data);
    //     return data;
    // }));

    // return checkResults;
    //run api
    //store result
}

/**************************************************************
 * reportCrossListResults
 * @param {Array} results
 * @param {Object} crossListData
 * 
 * 
 *************************************************************/
async function reportCrossListResults(results, crossListData) {

}

/**************************************************************
 * crossListApi
 * @param {Object} crossListData
 * 
 *  
 *************************************************************/
async function crossListApi(crossListData) {
    return await analyzeCrossListData(crossListData.readyForCrossList);
}

module.exports = {
    crossListApi
};