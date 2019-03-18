/*
    - Is it the same teacher?
    - Warn if it is not the same course name
    - Grade activity > 0
    - Moving to a course that doesn't have a section.
    - Moving from a course that has more than one section
    - Same subaccount/term -- helpers.mapTermToInteger()
*/

const canvas = require('canvas-api-wrapper');
const helpers = require('./helpers');

/**************************************************************
 * getCourseSections
 * @param {Int} courseId
 * @returns {Array}
 * 
 * This function returns a paginated list of all of the sections
 * associated with the course.
 *************************************************************/
async function getCourseSections(courseId) {
    // https://canvas.instructure.com/doc/api/sections.html#method.sections.index
    return await canvas.get(`/api/v1/courses/${courseId}/sections`);
}

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
 * @param {Object} firstCourse
 * @returns {Bool}
 * 
 * 
 *************************************************************/
async function checkSubAccount(firstCourse, secondCourse) {
    let firstCourse = await canvas.get(`/api/v1/courses/${firstCourse.courseId}?include[]=sections&include[]=term&include[]=account`);
    let secondCourse = await canvas.get(`/api/v1/courses/${secondCourse.courseId}?include[]=sections&include[]=term&include[]=account`);

    if ((!firstCourse.account ||
            !secondCourse.account) ||
        (!firstCourse.account.id ||
            !secondCourse.account.id)) return false;

    return firstCourse.account.id === secondCourse.account.id;
}

/**************************************************************
 * checkTerm
 * @param {Object} firstCourse
 * @param {Object} firstCourse
 * @returns {Bool}
 * 
 * 
 *************************************************************/
async function checkTerm(firstCourse, secondCourse) {
    let firstCourse = await canvas.get(`/api/v1/courses/${firstCourse.courseId}?include[]=sections&include[]=term&include[]=account`);
    let secondCourse = await canvas.get(`/api/v1/courses/${secondCourse.courseId}?include[]=sections&include[]=term&include[]=account`);

    if ((!firstCourse.term ||
            !secondCourse.term) ||
        (!firstCourse.term.id ||
            !secondCourse.term.id)) return false;

    return firstCourse.term.id === secondCourse.term.id;
}

/**************************************************************
 * checkSections
 * @param {Int} courseId
 * 
 * 
 *************************************************************/
async function checkSections(courseId) {
    let sectionsCourse = await canvas.get(`/api/v1/courses/${courseId}/sections`);

    return sectionsCourse > 0;
}

async function retrieveCourses(coursesToRetrieve) {
    let courseObjects = [];

    for (let course in coursesToRetrieve) {
        let courseObject = await canvas.get(`/api/v1/courses/${course.section}?include[]=sections&include[]=term&include[]=account`);
        courseObjects.push(courseObject);
    }

    return courseObjects;
}

/**************************************************************
 * masterChecker
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
async function masterChecker(crossListObject) {
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
        if (gradeActivityResults.events.length > 0) gradeActivityPass = false;
    }

    checkers.push(gradeActivityPass);

    /******************* SAME SUBACCOUNT ******************************/
    let sameSubAccountPass = true;
    for (let source of sources) {
        let subAccountResults = await checkSubAccount(destination, source);
        if (!subAccountResults) sameSubAccountPass = false;
    }

    checkers.push(sameSubAccountPass);

    /****************** SAME TERM ************************************/
    let sameTermPass = true;
    for (let source of sources) {
        let sameTermResults = await checkTerm(destination, source);
        if (!sameTermResults) sameTermPass = false;
    }

    checkers.push(sameTermPass);

    /**************** SECTIONS (SOURCE) *****************************/
    let sectionsPass = true;
    for (let source of sources) {
        let sectionsResults = await checkSections(source);
        if (!sectionsResults) sectionsPass = false;
    }

    checkers.push(sectionsPass);

    /**************** SECTIONS (DEST) ******************************/

}

/**************************************************************
 * analyzeCrossListData
 * @param {Array} crossListData
 * 
 * 
 *************************************************************/
async function analyzeCrossListData(crossListData) {
    //run masterChecker
    //run api
    //store result
}

/**************************************************************
 * reportCrossListResults
 * @param {Array} results
 * 
 * 
 *************************************************************/
async function reportCrossListResults(results) {

}

/**************************************************************
 * crossListApi
 * @param {Array} crossListData
 * 
 *  
 *************************************************************/
async function crossListApi(crossListData) {

}

module.exports = {
    crossListApi
};