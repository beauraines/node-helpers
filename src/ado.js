const azdev = require('azure-devops-node-api')
const {getResourceId} = require('./helpers.js')
const {readConfig } = require('./config.js')
const fetch = require('node-fetch');

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
    // eslint-disable-next-line no-undef
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
    callRestApi
} 