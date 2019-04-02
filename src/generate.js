const canvas = require('canvas-api-wrapper');

/**************************************************
 * filterResults
 * @param {Array} results
 * @param {Object} term
 * @returns {Array}
 * 
 * This function also goes through all of the results
 * and picks out the necessary stuff for the csv.
 *************************************************/
function filterResults(results, term) {
    let arr = [];

    results.forEach(result => {
        let id = result.id;
        let name = result.name;
        let sis_course_id = result.sis_course_id;
        let course_code = result.course_code;
        let instructors = result.teachers;

        //ensure that all necessary info exist
        if (id && name && sis_course_id && course_code && instructors) {
            arr.push({
                id: id,
                name: name,
                sis_course_id: sis_course_id,
                course_code: course_code,
                instructor: (instructors.length > 0) ? instructors[0].display_name : "none found",
                instructor_id: (instructors.length > 0) ? instructors[0].id : -1
            });
        }
    });

    return cleanResults(arr, term);
}

/**************************************************
 * cleanResults
 * @param {Array} results
 * @param {Object} term
 * @returns {Array}
 * 
 * This function goes through each row and looks at the 
 * sis_course_id and checks it against the user's input to 
 * help verify that it is correct and complete.
 *************************************************/
function cleanResults(results, term) {
    let semester = term.semester;
    let year = term.year;
    let type = (term.type.toLowerCase() === 'online/pathway'.toLowerCase() ? ['online', 'pathway'] : ['campus']);

    return results.filter(result => {
        let resultArr = result.sis_course_id.toLowerCase().split('.');

        //does it meet the requirements?
        if (type.includes(resultArr[1]) &&
            resultArr[2] === year &&
            resultArr[3] === semester) return true;

        return false;
    });
}

/**************************************************
 * apiCall
 * @param {Object} term
 * @returns {Array}
 * 
 * This makes an API call to Canvas and gets the
 * necessary requirements.
 *************************************************/
async function apiCall(term) {
    const accountId = 1;
    const termInt = await identifyTermInteger(term);

    let results = await canvas.get(`/api/v1/accounts/${accountId}/courses?enrollment_term_id=${termInt}&blueprint=false&include[]=teachers`);

    return results;
}

/**************************************************
 * mapTermToInteger
 * @returns {Array}
 * 
 * This retrieves the terms and creates a map
 * to help ensure that we get the correct term
 * number since Canvas only uses integers for 
 * terms and it's not easy to understand.
 *************************************************/
async function mapTermToInteger() {
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

/**************************************************
 * identifyTermInteger
 * @param {Object} term
 * @returns {Int}
 * 
 * This function returns the integer for the
 * user's input.
 *************************************************/
async function identifyTermInteger(term) {
    let map = await mapTermToInteger();
    let id = -1;

    map.forEach(ele => {
        if (ele.term.toUpperCase() === term.toUpperCase()) {
            id = ele.id;
        }
    });

    return id;
}

/*************************************************
 * generate
 * @param {Object} term
 * @returns {Array}
 *
 * This is the main function behind the whole 
 * generator.
 ************************************************/
async function generate(term) {
    let data = await apiCall(`${term.semester} ${term.year}`);

    return filterResults(data, term);
}

module.exports = {
    generate
}