const azdev = require('azure-devops-node-api')
const {getResourceId} = require('./helpers.js')
const {readConfig } = require('./config.js')
// eslint-disable-next-line no-redeclare
const fetch = require('node-fetch');
const util = require('util')
const exec = util.promisify(require('child_process').exec)

// get Current iteration
// Get current iteration work items
// get Teams
// get workitems
// update work items

async function getAdoApi(configFile) {
	const config = await readConfig(configFile)

    const orgUrl = config.org;
    // let token: string = process.env.AZURE_PERSONAL_ACCESS_TOKEN;
    const token= config.token
    const teamContext = { project: config.project, team: config.team};
    
    const authHandler = azdev.getPersonalAccessTokenHandler(token); 
    const connection = new azdev.WebApi(orgUrl, authHandler);    
    
    const workAPI = await connection.getWorkApi();

    const workItemAPI = await connection.getWorkItemTrackingApi();
    
    return {
        workAPI,
        workItemAPI,
        teamContext,
        config
    }
}

/**
 * Authenticate to Azure DevOps using the local `az` CLI login credentials.
 *
 * This function calls `az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798`
 * to get an AAD access token for Azure DevOps and then constructs the same
 * `azdev.WebApi` connection as `getAdoApi`.
 *
 * Usage: ensure the user has run `az login` and that `az` is available in PATH.
 * Returns an object with `{ workAPI, workItemAPI, teamContext, config }`.
 */
async function getAdoApiWithAzCli(configFile) {
    const config = await readConfig(configFile)

    const orgUrl = config.org;
    const teamContext = { project: config.project, team: config.team };

    // Azure DevOps resource (AAD) id
    const adoResource = '499b84ac-1321-427f-aa17-267ca6975798'

    try {
        const cmd = `az account get-access-token --resource ${adoResource} --output json`
        const { stdout } = await exec(cmd)
        const tokenObj = JSON.parse(stdout || '{}')
        const accessToken = tokenObj.accessToken || tokenObj.access_token || tokenObj.token

        if (!accessToken) {
            throw new Error('No access token returned from az CLI')
        }

        const authHandler = azdev.getBearerHandler(accessToken)
        const connection = new azdev.WebApi(orgUrl, authHandler)

        const workAPI = await connection.getWorkApi()
        const workItemAPI = await connection.getWorkItemTrackingApi()

        config.token = accessToken;

        return {
            workAPI,
            workItemAPI,
            teamContext,
            config
        }
    } catch (err) {
        console.error('getAdoApiWithAzCli: failed to obtain token from az CLI -', err.message)
        throw err
    }
}

async function getChildWorkItems(workItemAPI, id) {
    let parentWorkItem = await workItemAPI.getWorkItem(id, undefined, undefined, 'Relations');


    const childWorkItemIds = parentWorkItem.relations.filter(x => x.attributes.name == 'Child').map((x) => {
        return getResourceId(x.url)
    });

    let childWorkItems = childWorkItemIds.map(id => workItemAPI.getWorkItem(id, undefined, undefined));
    childWorkItems = await Promise.all(childWorkItems);

    return childWorkItems
}

/**
 * Gets array of distinct parent items when passed an array of work-item IDs
 * 
 * @param {WorkItemAPI} workItemAPI 
 * @param {Array} ids The array of work-items of which to find the distinct parents
 * @returns WorkItems[] Array of distinct parent work itesm
 */
async function getDistinctParentWorkItems(workItemAPI, ids) {
    let workItems = ids.map(id => {
        return workItemAPI.getWorkItem(id, undefined, undefined, 'Relations')
    })
    workItems = await Promise.all(workItems)   

    let parentIds = workItems.map(wi => {
        const parent = wi?.relations?.filter(x => x.attributes.name == 'Parent')[0]
        return parent ? getResourceId(parent.url) : null
    })

    let parentWorkItems = parentIds.map(parentId => workItemAPI.getWorkItem(parentId,undefined, undefined, 'Relations'))
    parentWorkItems = await Promise.all(parentWorkItems)
    parentWorkItems = parentWorkItems.filter(x => x!=null)
    
    let distinctParentWorkItemIds = [...new Set(parentWorkItems.map(wi => wi?.id))];

    let distinctParentWorkItems = distinctParentWorkItemIds.map(distinctParentId => workItemAPI.getWorkItem(distinctParentId,undefined, undefined, 'Relations'))
    distinctParentWorkItems = await Promise.all(distinctParentWorkItems)

    return distinctParentWorkItems
}


// TODO do something different about how to Auth
async function callRestApi(url, username, token) {
    // console.log(url) // Only display this in verbose mode
    // Bearer token format for ADO
     
    let bearerToken = Buffer.from(`${username}:${token}`).toString('base64');

    let response;
    try {
        response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${bearerToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
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
    getAdoApi,
    getChildWorkItems,
    getDistinctParentWorkItems,
    callRestApi,
    getAdoApiWithAzCli
} 