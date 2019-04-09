const fs = require('fs');
const canvas = require('canvas-api-wrapper');

/*********************************************
 * adapter
 * @param {Array} cxData
 * @returns {Array}
 * 
 * This function acts as an adapter for the 
 * cross list builder. This forms the CX data
 * to comply with the crossListBuilder module.
 ********************************************/
function adapter(cxData) {
    return cxData.reduce((cxCrosslist, cxElement) => {
        let cxObject = {
            id: `sis_course_id:C.${cxElement.entityCode}`,
            name: '', //doesn't come with Cx - not necessary for crossListBuilder
            sis_course_id: `C.${cxElement.entityCode}`,
            course_code: cxElement.entityCode.split('.').splice(-2, 1)[0],
            instructor: '', // doesn't come with Cx
            instructor_id: cxElement.teacherId
        };

        cxCrosslist.push(cxObject);

        return cxCrosslist;
    }, [])
}

/*********************************************
 * adapterWithFile
 * @returns {Array}
 * 
 * This is just a dummy function to play around
 * with a .json file.
 ********************************************/
function adapterWithFile() {
    let fileData = JSON.parse(fs.readFileSync('./src/CXCoursesTest.json', 'utf-8'));

    return adapter(fileData);
}

module.exports = {
    adapterWithFile,
    adapter,
}