const fs = require('fs');
const {fileExists} = require('./helpers');

/**
 * Reads a file for credentials and validates that the file has the required attributes. 
 * It will throw an error and EXIT if the file is not found or the file does not pass validation.
 * @param {string} file the fully qualified path and file to the credentials file
 * @returns Object containing the validated credentials
 */
async function getCredentials(file) {
    const filePath = `${file}`
    if (! await fileExists(filePath))  {
        console.error(`Credentials file not found: ${filePath}`);
        process.exit(1);
    } 
    let credentials = fs.readFileSync(filePath,
        { encoding: 'utf8', flag: 'r' });
    credentials = JSON.parse(credentials);
    if (! await validateCredentials(credentials))  {
        console.error(`Invalid credentials file ${filePath}`);
        process.exit(1);
    } 

    return credentials;
}

/**
 * Validates that the credentials include the token property
 * @param {Object} credentials The credentials object
 * @returns Boolean
 */
async function validateCredentials(credentials){
    // TODO include the properties array as a parameter
    let properties = ['token'];
    let credentialKeys =  Object.keys(credentials);
    let validCredentials = true;
    properties.forEach(property=>{
        let found = credentialKeys.find(x=>(x==property));
        if (!found) {
            validCredentials = false;
        }
        });
    return validCredentials;
}

module.exports = {
    getCredentials
}