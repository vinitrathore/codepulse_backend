const { v4: uuidv4 } = require('uuid');


function generateCustomKey() {
// simple pattern: USR-<uuid-part>
return 'USR-' + uuidv4().split('-')[0];
}


module.exports = { generateCustomKey };