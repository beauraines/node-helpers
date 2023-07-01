const {homedir} = require('os');
const process = require('node:process')
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const {fileExists} = require('./helpers');
const path = require('path');

/**
 * Opens the BurnDownStatus SQLite3 Database
 * @param file file name of the SQLite3 DB. If not provided, defaults to BurnDownStatus.db in the users home
 * @returns SQLite database connection
 */
async function getDBConnection(file) {
    file = file ? file : path.join(homedir(),'BurnDownStatus.db');
    if (! await fileExists(file)){
        console.error(`${file} not found`);
        // ! Separation of concerns - this should probably not be doing the exiting, but it is.
        // This should return something and the calling script will exit
        process.exit(1)
    }
    const db = await sqlite.open({
        filename: file,
        driver: sqlite3.Database
    });
    return db;
}

/**
 * 
 * @param {Object} data The burndown data to be inserted into the Burndown database
 * 
 * @returns {Object} The result of the database running the provided query
 * @deprecated Should be replaced with the insert function
 */
async function writeToDb(data) {
    // TODO should take db, query and values as parameters
    let db = await getDBConnection();
    let query = `insert into qa_burndown (date, qa_review_count, qa_validated_count) values (?,?,?) on conflict do update set qa_review_count = excluded.qa_review_count, qa_validated_count = excluded.qa_validated_count`;

    let values = [data.date, data.qa_review_count, data.qa_validated_count];
    let result = await db.run(query, values);
    await db.close();
    return result;

}

/**
 * 
 * Inserts or upserts data into the specified table in the specified database
 * 
 * @param {string} database Path and filename to the SQLite3 DB
 * @param {string} table 
 * @param {array} data array of fields and values to be inserted
 * @param {array} keys Optional array of record keys, if provided will perform an UPSERT
 * @returns {array} A not very useful of responses from the individual insert statements
 */
async function insert(database,table,data,keys) {
    let db = await getDBConnection(database);

    let fields = Object.keys(data[0]).toString();
    let fieldsCount = Object.keys(data[0]).length;
    let valueSubstitution = Array(fieldsCount).fill('?').toString();

    let query = `insert into ${table}  (${fields}) values (${valueSubstitution})`
    if (keys) {
        query = query + buildOnConflictStatement(fields,keys);
    }
    query = query.concat(';');
    let result = []
    data.forEach(async (row) => {
        // TODO add try/catch for SQL error errno and code
        // TODO switch to db.exec() for more meaningful response
        let response = await db.run(query,Object.values(row));
        result.push(response);
    });
    await db.close();
    // TODO clean up result
    return result;
}

/**
 * 
 * @param {string} fields Comma separated list of fields from the data
 * @param {array} keys Array of key values for the record, these will be excluded form the UPSERT statement
 * @returns {string} the on conflict statement for an UPSERT based on the fields and keys provide
 */
function buildOnConflictStatement(fields,keys) {
    fields = fields.split(',');
    let upsertFields = fields.filter( x => !keys.includes(x));
    let conflictStatement = ` on conflict do update set`;
    for (let i = 0; i < upsertFields.length; i++) {
        const field = upsertFields[i];
        conflictStatement = conflictStatement + ` ${field} = excluded.${field}`
        i != upsertFields.length -1 ? conflictStatement = conflictStatement + `,` : null
    }
    return conflictStatement;

}

async function query(database,query) {
    let db = await getDBConnection(database);
    // TODO add try/catch for SQL error errno and code
    let response = await db.all(query);
    return response;
}


module.exports = {
    getDBConnection,
    writeToDb,
    insert,
    query
}