const canvas = require('canvas-api-wrapper');
const asyncLib = require('async');
const {
    promisify
} = require('util');
const asyncReduce = promisify(asyncLib.reduce);

/**************************************
 * parse
 * @param {Object} data
 * @returns {Array}
 * 
 * This function will reduce through all
 * of the parsed CSV data and build out
 * an array like this:
 * 
 * [
        {
            instructor: <string>                 //the instructor's name
            courses: <Array of JSON objects>     //array of  courses that the instructor is teaching
        },
        ...,
        {  
            instructor: 'none found',            //no instructors were found so this object serves as a junk drawer
            courses: <Array of JSON objects>     //array of courses that has no instructor
        }
    ]
 *************************************/
async function parse(data) {
    let results = data;
    delete results.columns;

    return await asyncReduce(results, [], async (acc, result) => {

    });
}

module.exports = {
    parse
}