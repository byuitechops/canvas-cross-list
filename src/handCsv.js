const fs = require('fs');
const getCSV = require('read-in-csv');
const questions = require('./questions.js');

/********************************
 * retrieveCSV
 * @returns {Array}
 *
 * This retrieves the path for
 * the CSV from the user.
 * *****************************/
async function retrieveCSV() {
    return parseCSV(await questions.promptCSV());
}

/********************************
 * parseCSV
 * @param {String} filePath
 * @returns {Array}
 * 
 * This checks to see if the file
 * exists. If it does, it'll call
 * the correct function to proceed
 * with the parsing.
 * *****************************/
async function parseCSV(filePath) {
    let path = filePath.csvLocation;

    try {
        fs.accessSync(path, fs.constants.F_OK);
    } catch (err) {
        throw new Error('CSV file does not exist...');
    }

    return await fixCsvObject(getCSV(path));
}

/********************************
 * checkCsv
 * @param {Object} csvObject
 * @returns {Boolean}
 *
 * This checks the csv against
 * a series of constraints
 * 
 * NOTE: This function is still
 * a WIP -- need to run it against
 * requirements inside api. Thinking
 * about abstracting it.
 * *****************************/
function checkCsv(csvObject) {
    //need to add more constraints but this will do for now
    return csvObject.columns.length > 2;
}

/********************************
 * exists
 * @param {Object} object
 * @param {Array} arr
 *
 * This function checks to see if
 * the things we are looking for
 * are in the array.
 * *****************************/
function exists(obj, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].destinationOU === obj.destinationOU) return true;
    }

    return false;
}

/********************************
 * fixCsvObject
 * @param {Object} csvObject
 * @returns {Object}
 *  
 * This function builds out
 * the array of objects to what
 * we want.
 * *****************************/
function fixCsvObject(csvObject) {
    if (checkCsv(csvObject)) {
        return [{
            'sourceOUs': [],
            'destinationOUs': -1,
            'success': false
        }];
    }

    let objs = csvObject;
    delete objs.columns;

    let finalObj = [];

    objs.forEach(obj => {
        let sourceOU = obj.sourceOU;
        let destinationOU = obj.destinationOU;

        if (!exists(obj, finalObj)) {
            let newTemplate = {
                'sourceOUs': [],
                'destinationOU': -1,
            };
            newTemplate.sourceOUs.push(sourceOU);
            newTemplate.destinationOU = destinationOU;
            finalObj.push(newTemplate);
        } else {
            finalObj.forEach(ele => {
                if (ele.destinationOU === destinationOU) ele.sourceOUs.push(sourceOU);
            });
        }
    });

    return finalObj;
}

module.exports = {
    retrieveCSV
};