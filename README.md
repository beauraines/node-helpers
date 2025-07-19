# Node Helpers

This is a set of helpers for NodeJS. They're written for quick reuse rather than robust functions or efficiency. For instance, the database functions will create a new database connection every time. This is not efficient, but it makes making the function call simple.

My use is primarily in quicker one-off scripts that sometimes morph into something long-lasting...

<a href="https://deepwiki.com/beauraines/node-helpers"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>


## Azure Storage

Get blob from Azure example, downloads `bar.jpg` from `foo` container to `baz.jpg`

```javascript
const AzureStorage  = require('./src/azure.js')


let storageAccountName = 'devstoreaccount1'
let storageAccountKey = 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw=='
let options = {cloudName: 'Azurite'}

let azure = new AzureStorage(storageAccountName,storageAccountKey,options)

let containerName = 'foo'
let blob = 'bar.jpg'
let file = 'baz.jpg'
await azure.downloadBlobToFile(containerName,blob,file)
```
