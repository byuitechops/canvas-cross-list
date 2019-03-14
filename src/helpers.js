/**************************************************
 * mapTermToInteger
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

module.exports = {
    mapTermToInteger,
}