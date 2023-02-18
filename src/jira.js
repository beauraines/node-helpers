const fetch = require('node-fetch');

/**
 * Converts an email and password to a base64 encoded string to be used as a Bearer token. 
 * NB: This only converts the string and does not pre-pend Bearer
 * @param {string} email email address
 * @param {string} token access token or password
 * @returns String
 */
function credentialsToToken(email,token) {
    let bearerToken = Buffer.from(`${email}:${token}`).toString('base64');
    return bearerToken
}

/**
 * Gets up to 100 issues by JQL query, retuning the "key","summary","status","statusCategory",
 * "labels","parent","project","customfield_10013" 
 * @param {string} jql A valid JQL statement, NB: any quotation marks should be single quotes
 * @param {object} credentials A object at least with the property `bearerToken`
 * @returns Object
 */
async function getIssuesByJql(jql,credentials) {
    let {domain } = credentials;
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Authorization": `Basic ${credentials.bearerToken}`,
        "Content-Type": "application/json"
    }

    // TODO make this an option parameter
    let fields = [
        "key","summary","status","statusCategory","labels","parent","project","customfield_10013"
    ];

    // TODO make the max results an option parameter and variable to be reused in the paginated data increments
    let bodyContent = {
        "startAt": 0,
        "maxResults": 100,
        "jql": jql,
        "fields": fields
    };
    
    let response = await fetch(`https://${domain}.atlassian.net/rest/api/3/search`, { 
        method: "POST",
        body: JSON.stringify(bodyContent),
        headers: headersList
    })

    let body

    if (response.ok) {
        body = await response.json();
        // console.log('total',body.total);
        // console.log('maxResults',body.maxResults);
        if (body.total < body.maxResults) {
            return body;
        } 
    } else {
        throw new Error(response.statusText);
    }

    console.log('There is more data to be pulled...');
    let retrieveCount = 100;
    let totalResults = body.total;

    let requestBodies = []
    // console.log(bodyContent);
    while (retrieveCount < totalResults) {
        bodyContent.startAt = retrieveCount;
        requestBodies.push({...bodyContent}); 
        retrieveCount = retrieveCount + 100;
    }

    // for of is a better practice than forEach

    // TODO move this to function like
    // const callApi = async (): Promise<ResponseModel> => { /* function code here */ } (edited) 
    // Return an array of Promises and wait for all of them to resolve with  Promise.all()

    for (const requestBody of requestBodies) {
        console.log(`Making API call startAt ${requestBody.startAt}`);
        let response = await fetch(`https://${domain}.atlassian.net/rest/api/3/search`, {
            method: "POST",
            body: JSON.stringify(requestBody),
            headers: headersList
        });

        if (response.ok) {
            let responseBody = await response.json();
            body.issues = body.issues.concat(responseBody.issues);
            console.log(`API call startAt ${requestBody.startAt} complete, found ${responseBody.issues.length}, body length is now ${body.issues.length}`);
        } else {
            throw new Error(response.statusText);
        }
    }

    console.log("issues", body.issues.length)
    return body;

}

/**
 * Gets up to 100 Jira issues that belong to the specified Epic
 * @param {string} epic Epic Key, e.g. CEC-3360
 * @param {Object} credentials An object with at least the `bearerToken` property
 * @returns Object
 */
async function getIssuesForEpic(epic,credentials) {
    let {domain } = credentials;
    let headersList = {
        "Accept": "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Authorization": `Basic ${credentials.bearerToken}`
    }
       
    // TODO make the max results an option parameter
    let response = await fetch(`https://${domain}.atlassian.net/rest/agile/1.0/epic/${epic}/issue?maxResults=100`, { 
        method: "GET",
        headers: headersList
    })

    if (response.ok) {
        return response.json();
    } else {
        throw new Error(response.statusText);
    }
}

/**
 * gets data from any Jira API end point
 * @param {string} url Jira API Endpoint
 * @param {object} credentials the credentials object, with email and token
 * @returns Object
 */
async function getJiraData(url,credentials) {
    let {domain, email, token} = credentials;
    let response;
    try {
        response = await fetch(`https://${domain}.atlassian.net/${url}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${credentialsToToken(email,token)}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    } catch (error) {
        console.error(error.message)
    }
}

module.exports = { 
    getIssuesByJql, 
    getIssuesForEpic,
    credentialsToToken,
    getJiraData
}