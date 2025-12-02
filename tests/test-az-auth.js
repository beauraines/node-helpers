const { getAdoApiWithAzCli } = require('../src/ado.js');

async function run() {
  try {
    // pass path to your config file (same used by other scripts), or undefined if readConfig handles default
    const ado = await getAdoApiWithAzCli('./adoUtilities.json');
    console.log('workAPI, workItemAPI available:', !!ado.workAPI, !!ado.workItemAPI);
  } catch (err) {
    console.error('Auth failed:', err.message);
  }
}

run();