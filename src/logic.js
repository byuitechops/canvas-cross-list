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
 *      {
 *          instructor: <string>                 //the instructor's name
 *          instructorId: <int>                  //the instructor's id to double check identity
 *          courses: <Array of JSON objects>     //array of  courses that the instructor is teaching
 *      },
 *      ...,
 *      {  
 *          instructor: 'none found',            //no instructors were found so this object serves as a junk drawer
 *          instructorId: -1                     //number that represents 'none found'
 *          courses: <Array of JSON objects>     //array of courses that has no instructor
 *      }
 *  ]
 *************************************/
async function parse(data) {
    let results = data;
    delete results.columns;

    return await asyncReduce(results, [], async (accArr, result) => {
        let instructor = result.instructor;
        let instructorId = result.instructor_id;
        let sisId = result.sis_course_id.split('.').slice(-2);
        let foundFlag = false;

        // check through the array
        for (let i = 0; i < accArr.length; i++) {
            if (accArr[i].instructor.toLowerCase() === instructor.toLowerCase() &&
                accArr[i].instructorId === instructorId) {

                accArr[i].courses.push({
                    course: sisId[0],
                    section: sisId[1]
                });

                foundFlag = true;
            }
        }

        // the instructor and/or instructor with the same ID was not found
        if (!foundFlag) {
            //create new entry
            accArr.push({
                instructor: instructor,
                instructorId: instructorId,
                courses: []
            });

            //update the course array with the current course/section
            accArr[accArr.length - 1].courses.push({
                course: sisId[0],
                section: sisId[1]
            });
        }

        return accArr;
    });
}

/*********************************************************
 * createCrossList
 * @param {Array} data
 * @returns {Array}
 * 
 * This function will go through the recently parsed CSV
 * data and create an array of objects that will go through
 * the cross list API call function.
 * 
 * The expected output is like:
 * 
 * [
 *      {
 *          instructor: <string>
 *          instructorId: <int>
 *          crossList: [{
 *              course: <string>        //adding to double check before official cross list
 *              destination: <int>      //destination section
 *              sources: [<ints>]       //sources to cross list into destination
 *          },
 *          ...
 *          {
 *              course: <string>        //adding to double check before official cross list
 *              destination: <int>      //destination section
 *              sources: [<ints>]       //sources to cross list into destination
 *          }]
 *      },
 *      ...
 *      {
 *          instructor: <string>
 *          instructorId: <int>
 *          crossList: [{
 *              course: <string>        //adding to double check before official cross list
 *              destination: <int>      //destination section
 *              sources: [<ints>]       //sources to cross list into destination
 *          },
 *          ...
 *          {
 *              course: <string>        //adding to double check before official cross list
 *              destination: <int>      //destination section
 *              sources: [<ints>]       //sources to cross list into destination
 *          }]
 *      }
 * ]
 ********************************************************/
async function createCrossList(data) {
    return await asyncReduce(data, [], async (acc, ele) => {
        let instructor = ele.instructor;
        let instructorId = ele.instructorId;
        let courses = ele.courses;

        if (instructor !== 'none found') {
            //this returns all of the sections for a course
            let temp = courses.reduce((coursesAcc, course) => {
                // create an array if it doesn't exist and push the sections to  it
                coursesAcc[course.course] = Array.isArray(coursesAcc[course.course]) ? coursesAcc[course.course] : [];
                coursesAcc[course.course].push(course.section);
                return coursesAcc;
            }, {})

            // looping through all of the sections and build out the object array we want
            Object.keys(temp)
                //we don't care for classes taught by an instructor that only has one section
                .filter(key => temp[key].length > 1)
                //build out the object array
                .forEach(course => {
                    //sort by least to greatest so we can grab destination/source
                    let sortedSections = temp[course].sort((a, b) => Number(a) - Number(b));

                    //we have the information now so we build an object and push it to the accumulator
                    acc.push({
                        instructor: instructor,
                        instructorId: instructorId,
                        course: course,
                        destination: sortedSections.shift(),
                        sources: sortedSections
                    });
                });
        }

        return acc;
    });
}

/***************************************************
 * logic
 * @param {Object} data
 * @returns {Array}
 * 
 * This function acts as a driver for the logic
 * functions to ensure that we are building the 
 * proper array.
 **************************************************/
async function logic(data) {
    return await createCrossList(await parse(data));
}

module.exports = {
    logic
}