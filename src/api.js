/*
    - Is it the same teacher?
    - Warn if it is not the same course name
    - Grade activity > 0
    - Moving to a course that doesn't have a section.
    - Moving from a course that has more than one section
    - Same subaccount/term -- helpers.mapTermToInteger()
*/

const _ = require('underscore');
const fs = require('fs');
const d3 = require('d3-dsv');
const moment = require('moment');
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
            (tempCheck.length > 0) ? checkResultsReduce.fail.push(checkToPush): checkResultsReduce.success.push(checkToPush)
        }

        return checkResultsReduce;
    }, checkResultsReduce)

    return checkResultsReduce;
}

/**************************************************************
 * executeApi
 * @param {Array} checkResultsData
 * @returns {Object}
 * 
 * This function executes the api and returns a object of how
 * it went.
 *************************************************************/
async function executeApi(checkResultsData) {
    //run api
    console.log('Cross list execution module initiating.');
    let updatedCheckData = fixResultsData(checkResultsData);
    // logMe(updatedCheckData);
    let reportData = {
        apiSuccess: [],
        requirementsFailed: updatedCheckData.fail
    };

    for (let course of updatedCheckData.success) {
        let destination = course.destination.courseId;

        for (let source of course.sources) {
            console.log(`Section: ${source.courseId}. Destination: ${destination}. API Call: "canvas.post('/api/v1/sections/${source.courseId}/crosslist/${destination}');"`);
            reportData.apiSuccess.push(`${source.courseId} <-- ${destination}`);
        }
    }

    return reportData;
}

/**************************************************
 * checkFolder
 * @param {String} path
 * 
 * This function checks for a folder and creates one
 * if it does not exist
 *************************************************/
function checkFolder(path) {
    if (!fs.existsSync(path)) fs.mkdirSync(path);
}

/**************************************************************
 * reportCrossListResults
 * @param {Array} apiResults
 * @param {Array} crossListData
 * @param {Array} failedRequirements
 * 
 * This function simply calls the correct function and creates
 * a CSV of how the API went.
 *************************************************************/
function reportCrossListResults(apiResults, crossListData, failedRequirements) {
    const path = './apiReports';

    checkFolder(path);

    const columns = [
        'Successful',
        'Failed Requirements',
        'No Instructors',
        'Courses Blacklisted'
    ];

    reports = organizeReport(apiResults, crossListData, failedRequirements);
    fs.writeFileSync('./toDelete6.json', JSON.stringify(reports, null, 4));

    let csv = d3.csvFormat(reports, columns);
    let time = moment().format('MM-DD-YY');
    fs.writeFileSync(`${path}/report_generated_on_${time}.csv`, csv);
    console.log('Successfully saved report');
}

/**************************************************************
 * organizeReport
 * @param {Array} apiResults
 * @param {Array} crossListData
 * @param {Array} failedRequirements
 * @returns {Array}
 * 
 * This function organizes the report so it can be fed into 
 * d3-dsv.
 *************************************************************/
function organizeReport(apiResults, crossListData, failedRequirements) {
    //only going to have one element
    let noTeachers = crossListData.dontHaveTeachers[0].courses;

    //removing instructors with one course since we don't need to report that
    let blacklistedCourses = crossListData.blacklistedCourses.filter(blacklist => blacklist.courses.length > 1);

    const zippedArray = _.zip(apiResults,
        noTeachers,
        [].concat.apply([], blacklistedCourses.map(blacklist => blacklist.courses)),
        failedRequirements);

    let reports = [];
    reports = zippedArray.reduce((reports, report) => {
        let apiSuccess = report[0];
        let dontHaveTeacher = report[1];
        let blacklistedCourse = report[2];
        let failedRequirement = report[3];

        //the null/undefined part will be omitted. yay for es8.
        reports.push({
            ...(apiSuccess && {
                apiSuccess
            }),
            ...(dontHaveTeacher && {
                dontHaveTeacher
            }),
            ...(blacklistedCourse && {
                blacklistedCourse
            }),
            ...(failedRequirement && {
                failedRequirement
            })
        });

        return reports
    }, reports);

    return fixReports(reports);
}

/********************************************************
 * fixReports
 * @param {Array} reports
 * @returns {Array}
 * 
 * This goes through and fixes the array of objects to
 * make it work with a CSV. This function will 
 *******************************************************/
function fixReports(reports) {
    return reports.map(report => {
        let failed = report.failedRequirement;

        // build out the csv object and omit null/defined through some fancy ES8 stuff
        return {
            ...(report.apiSuccess && {
                'Successful': report.apiSuccess
            }),
            ...(report.dontHaveTeacher.courseId && {
                'No Instructors': report.dontHaveTeacher.courseId
            }),
            ...(report.blacklistedCourse && {
                'Courses Blacklisted': report.blacklistedCourse.courseId
            }),
            ...(failed && {
                'Failed Requirements': `${failed.destination.courseId} <-- ${createSourceString(failed.sources)}`
            }),
        };
    });
}

/****************************************
 * createSourceString
 * @param {Array} sources
 * @return {String}
 * 
 * This creates the source string for the
 * csv.
 ***************************************/
function createSourceString(sources) {
    let sourceString = '';

    sources.forEach(source => sourceString += `${source.courseId} `);

    return sourceString;
}

/**************************************************************
 * crossListApi
 * @param {Object} crossListData
 * 
 * This is the main function behind the whole api portion. There
 * must be a property named readyForCrossList in the parameter
 * or it will print out that it will not able to process the data.
 *************************************************************/
async function crossListApi(crossListData) {
    if (!crossList.readyForCrossList) {
        console.log('Unable to process request. Please check the data.');
        return;
    }

    processCrossListData(crossListData.readyForCrossList)
        .then(async checkResults => {
            // logMe(checkResults);
            let apiResults = await executeApi(checkResults);
            reportCrossListResults(apiResults.apiSuccess, crossListData, apiResults.requirementsFailed);
            console.log('Complete.');
        });
}

// for testing purposes
function logMe(msg) {
    console.log(JSON.stringify(msg, null, 4));
}

module.exports = {
    crossListApi
};