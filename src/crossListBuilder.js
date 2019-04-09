const _ = require('underscore');
const asyncLib = require('async');
const blacklist = require('./helpers');
const {
    promisify
} = require('util');
const asyncReduce = promisify(asyncLib.reduce);

const BLACKLIST = blacklist.createBlacklist();

/**************************************
 * transformData
 * @param {Object} csvEntries
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
function transformData(csvEntries) {
    return csvEntries.reduce((instructorsCourses, csvEntry) => {
        let instructor = csvEntry.instructor;
        let instructorId = csvEntry.instructor_id;
        let sisId = csvEntry.sis_course_id.split('.').slice(-2);
        let courseId = csvEntry.id;

        let instructorsCourse = instructorsCourses.find(instructorsCourse => {
            return instructorsCourse.id === instructorId;
        });

        if (instructorsCourse === undefined) {
            instructorsCourses.push({
                name: instructor,
                id: instructorId,
                courses: []
            });
            instructorsCourse = instructorsCourses[instructorsCourses.length - 1];
        }

        instructorsCourse.courses.push({
            course: sisId[0],
            section: Number(sisId[1]),
            courseId: courseId
        });

        return instructorsCourses;
    }, []);
}

/*********************************************************
 * filterInstructors
 * @param {Array} instructorsCourses
 * @returns {Object}
 * 
 * This function will go through and filter out the things
 * we do not need for the cross list such as the following:
 *      - No instructors for the course
 *      - Teachers only teaching one section for a course
 * 
 * It will return an object that is like:
 *  {
 *      validInstructors: [],    // valid courses here
 *      invalidInstructors: [],  // Courses that don't have an instructor
 *      blacklistedCourses: [],  // Courses that are not to be cross listed.
 *  }
 ********************************************************/
function filterInstructors(instructors) {
    const BAD = 'none found';

    let identifyValidInstructors = {
        validInstructors: [],
        invalidInstructors: [],
        blacklistedCourses: []
    }

    identifyValidInstructors = instructors.reduce((identifyValidInstructors, instructor) => {
        if (instructor.name !== BAD && Number(instructor.id) !== -1) {
            let splitInstructor = {
                validCourses: [],
                blacklistedCourses: []
            };

            splitInstructor = instructor.courses.reduce((splitInstructor, course) => {
                if (BLACKLIST.indexOf(course.course) === -1) {
                    splitInstructor['validCourses'].push(course);
                } else {
                    splitInstructor['blacklistedCourses'].push(course);
                }

                return splitInstructor;
            }, splitInstructor)

            let newValidInstructorObject = {
                name: instructor.name,
                id: instructor.id,
                courses: splitInstructor.validCourses
            };

            let newBlacklistInstructorObject = {
                name: instructor.name,
                id: instructor.id,
                courses: splitInstructor.blacklistedCourses
            }

            if (newValidInstructorObject.courses.length > 0)
                identifyValidInstructors['validInstructors'].push(newValidInstructorObject)

            if (newBlacklistInstructorObject.courses.length > 0)
                identifyValidInstructors['blacklistedCourses'].push(newBlacklistInstructorObject);
        } else {
            identifyValidInstructors['invalidInstructors'].push(instructor);
        }

        return identifyValidInstructors;
    }, identifyValidInstructors);

    return {
        validInstructors: identifyValidInstructors.validInstructors,
        invalidInstructors: identifyValidInstructors.invalidInstructors,
        blacklistedCourses: identifyValidInstructors.blacklistedCourses
    }
}

/*********************************************************
 * createCrossList
 * @param {Array} instructors
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
 *         ]
 *      },
 *      ...
 * ]
 ********************************************************/
async function createCrossList(instructors) {
    return await asyncReduce(instructors, [], async (acc, instructor) => {
        let crossLists;

        let combinedCourses = instructor.courses.reduce((combinedCourses, course) => {
            let combinedCourse = combinedCourses.find(combinedCourse => combinedCourse.name === course.course);

            if (combinedCourse === undefined) {
                combinedCourses.push({
                    name: course.course,
                    sections: []
                });
                combinedCourse = combinedCourses[combinedCourses.length - 1];
            }

            combinedCourse.sections.push({
                courseId: course.courseId,
                section: course.section
            })

            return combinedCourses;
        }, []);

        // looping through all of the sections and build out the object array we want
        crossLists = combinedCourses
            //we don't care for classes taught by an instructor that only has one section
            .filter(combinedCourse => combinedCourse.sections.length > 1)
            //sort by least to greatest so we can grab destination/source
            .map(combinedCourse => {
                combinedCourse.sections.sort((a, b) => a.section - b.section);
                return combinedCourse;
            })
            //build out the object array
            .map(combinedCourse => {
                //grab first number in array for the destination and removing it from the array too
                let destination = combinedCourse.sections.shift();

                //we have the information now so we build an object and push it to the accumulator
                return {
                    instructor: instructor.name,
                    instructorId: instructor.id,
                    course: combinedCourse.name,
                    destination: destination,
                    sources: combinedCourse.sections
                };
            });

        return acc.concat(crossLists);
    });
}

/***************************************************
 * logic
 * @param {Object} csvData
 * @returns {Array}
 * 
 * This function acts as a driver for the logic
 * functions to ensure that we are building the 
 * proper array.
 **************************************************/
async function buildCrossListData(csvData) {
    /*
    requirements:
        - same teacher          X
        - same course name      X
        - grade activity        X (apiIO) - https://canvas.instructure.com/doc/api/all_resources.html#method.grade_change_audit_api.for_course
        - moving to a course that does not have a section      
        - moving from a course that has more than one section
    */
    console.log('Constructing cross list data');
    let instructorsCourses = transformData(csvData);
    let filteredInstructorsCourses = filterInstructors(instructorsCourses);
    let preparedCrossListData = await createCrossList(filteredInstructorsCourses.validInstructors);

    console.log('Successfully built cross listing data.');
    return {
        readyForCrossList: preparedCrossListData,
        dontHaveTeachers: filteredInstructorsCourses.invalidInstructors,
        blacklistedCourses: filteredInstructorsCourses.blacklistedCourses
    }
}

module.exports = {
    buildCrossListData
}