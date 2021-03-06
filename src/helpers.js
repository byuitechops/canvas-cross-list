/****************************
 * createBlacklist
 * @returns {Array}
 * 
 * Returns a list of courses
 * that is blacklisted
 ***************************/
function createBlacklist() {
    return [
        'GE 101',
    ];
}

/**************************************************
 * createSubAccountsMap
 * @returns {Object}
 * 
 * This returns the object that will help determine
 * if two courses are in the same subaccount.
 *************************************************/
function createSubAccountsMap() {
    return {
        '100': 'Online',
        '102': 'Pathway',
        '104': 'Non-Academic',
        '106': 'Pathway',
        '108': 'Pathway',
        '110': 'Pathway',
        '112': 'Development',
        '114': 'Development',
        '118': 'Pathway',
        '13': 'Development',
        '17': 'Development',
        '18': 'Development',
        '19': 'Development',
        '24': 'Pathway',
        '25': 'Non-Academic',
        '26': 'Manually-Created Courses',
        '27': 'Development',
        '35': 'Campus',
        '39': 'Pathway',
        '41': 'Development',
        '42': 'Online',
        '43': 'Online',
        '44': 'Online',
        '45': 'Online',
        '46': 'Online',
        '47': 'Pathway',
        '48': 'BYUI',
        '49': 'BYUI',
        '5': 'Online',
        '50': 'BYUI',
        '51': 'BYUI',
        '52': 'BYUI',
        '53': 'BYUI',
        '54': 'BYUI',
        '55': 'BYUI',
        '56': 'BYUI',
        '57': 'BYUI',
        '58': 'BYUI',
        '59': 'BYUI',
        '60': 'BYUI',
        '61': 'BYUI',
        '62': 'BYUI',
        '63': 'BYUI',
        '64': 'BYUI',
        '65': 'BYUI',
        '66': 'BYUI',
        '67': 'BYUI',
        '68': 'BYUI',
        '69': 'BYUI',
        '7': 'Campus',
        '70': 'BYUI',
        '71': 'BYUI',
        '72': 'BYUI',
        '73': 'BYUI',
        '74': 'BYUI',
        '75': 'BYUI',
        '76': 'BYUI',
        '77': 'BYUI',
        '78': 'BYUI',
        '79': 'BYUI',
        '8': 'Sandbox',
        '80': 'BYUI',
        '81': 'BYUI',
        '82': 'BYUI',
        '83': 'BYUI',
        '84': 'BYUI',
        '85': 'BYUI',
        '86': 'BYUI',
        '96': 'Non-Academic',
        '98': 'Non-Academic',
    };
}

module.exports = {
    createSubAccountsMap,
    createBlacklist
}