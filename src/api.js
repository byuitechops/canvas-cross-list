/*
    - Is it the same teacher?
    - Warn if it is not the same course name
    - Grade activity > 0
    - Moving to a course that doesn't have a section.
    - Moving from a course that has more than one section
    - Same subaccount/term -- helpers.mapTermToInteger()
*/

const canvas = require('canvas-api-wrapper');
const promiseLimit = require('promise-limit');
var crossListCounter = 0;

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

    checkers.push({
        object: crossListObject,
        type: 'Cross List Object'
    });

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

/****************************************************************
 * masterChecker
 * @param {Array} crossListData
 * @param {Int} crossListCounter
 * @returns {Promise}
 * 
 * This is the driver for the promise queue and keeps track
 * of all checks.
 ***************************************************************/
async function masterChecker(crossListObject, crossListData) {
    //call checkCourse function which essentially performs all checks
    return new Promise(async (resolve, reject) => {
        checkCourse(crossListObject)
            .then(singleChecker => {
                console.log(`(${++crossListCounter}/${crossListData.length}) Course: ${crossListObject.course} with Professor ${crossListObject.instructor} successfully checked.`);
                resolve({
                    instructor: crossListObject.instructor,
                    course: crossListObject.course,
                    checkResults: singleChecker
                });
            })
            .catch(err => {
                console.log(`(${++crossListCounter}/${crossListData.length}) Course: ${crossListObject.course} with Professor ${crossListObject.instructor} checked and a warning has occurred.`);

                //the reason why it is a resolve is because of the Promise.all() stopping once an element rejects
                resolve({
                    courseObject: crossListObject,
                    errorMessage: err
                });
            });
    });
}

/***********************************************************
 * processCrossListData
 * @param {Array} crossListData
 * @returns {Array}
 * 
 * This functions processes the data inside the parameter
 * and sends it to the checkers to ensure that requirements
 * are met before cross list.
 **********************************************************/
function processCrossListData(crossListData) {
    let queueLimit = 30;
    const limit = promiseLimit(queueLimit);

    console.log(`Found ${crossListData.length} potential cross-listing matches.`);
    console.log(`Checking each against requirements...`);

    //checking requirements through promised based queue with limits
    return Promise.all((crossListData.map(crossListObject => limit(() => masterChecker(crossListObject, crossListData)))));
}

/**************************************************************
 * fixResultsData
 * @param {Array} checkResultsData
 * @return {Array}
 * 
 * This function goes through the array and does a "shelf sort"
 * with the requirements and returns the following:
 * 
 * {
 *      success: []   // the array of all of the crossList data that PASSED all requirements
 *      fail: []      // the array of all of the crossList data that FAILED all requirements
 * }
 *************************************************************/
function fixResultsData(checkResultsData) {
    let checkResultsReduce = {
        success: [],
        fail: []
    };

    checkResultsReduce = checkResultsData.reduce((checkResultsReduce, check) => {
        if (!check.checkResults) {
            checkResultsReduce.fail.push(check);
        } else {
            let tempCheck = check.checkResults.filter(checkObject => checkObject.pass === false);

            let checkToPush = check.checkResults[0].object;
            (tempCheck.length > 0) ? checkResultsReduce.success.push(checkToPush): checkResultsReduce.fail.push(checkToPush)
        }

        return checkResultsReduce;
    }, checkResultsReduce)

    return checkResultsReduce.success;
}

/**************************************************************
 * executeApi
 * @param {Array} checkResultsData
 * 
 * 
 *************************************************************/
async function executeApi(checkResultsData) {
    //run api
    console.log('Cross list execution module initiating.');
    let updatedCheckData = fixResultsData(checkResultsData);
    // console.log(JSON.stringify(updatedCheckData, null, 4));

    for (let course of updatedCheckData) {
        let destination = course.destination.courseId;

        for (let source of course.sources) {
            console.log(`Section: ${source.courseId}. Destination: ${destination}. API Call: "canvas.post('/api/v1/sections/${source.courseId}/crosslist/${destination}');"`);
        }
    }
}

/**************************************************************
 * reportCrossListResults
 * @param {Array} results
 * @param {Object} crossListData
 * 
 * 
 *************************************************************/
async function reportCrossListResults(results, crossListData, apiError) {
    //store results
}

/**************************************************************
 * crossListApi
 * @param {Object} crossListData
 * 
 *  
 *************************************************************/
async function crossListApi(crossListData) {
    processCrossListData(crossListData.readyForCrossList)
        .then(async checkResults => {
            // console.log(JSON.stringify(checkResults, null, 4));
            let apiResults = await executeApi(checkResults);
        });
}

module.exports = {
    crossListApi
};