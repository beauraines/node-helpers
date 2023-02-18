
const azureStorage = require("./src/azure")
const credentials = require("./src/credentials.js");
const database = require("./src/database");
const helpers = require("./src/helpers");
const jira = require("./src/jira");

module.exports = {
    azureStorage,
    credentials,
    database,
    helpers,
    jira
}
