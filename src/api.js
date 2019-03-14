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
 * @param {Object} course
 * 
 * 
 *************************************************************/
async function checkSubAccount(course) {

}

/**************************************************************
 * checkTerm
 * @param {Object} course
 * 
 * 
 *************************************************************/
async function checkTerm(course) {
    let termMap = await helpers.mapTermToInteger();
}

/**************************************************************
 * checkSections
 * @param {Object} course
 * 
 * 
 *************************************************************/
async function checkSections(course) {

}

/**************************************************************
 * analyzeCrossListData
 * @param {Array} crossListData
 * 
 * 
 *************************************************************/
async function analyzeCrossListData(crossListData) {

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