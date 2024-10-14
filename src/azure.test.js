const dayjs = require('dayjs')
const { fileExists } = require('./helpers.js')
const AzureStorage  = require('./azure.js')
const os = require('os');
const path = require('path');
  
describe('Azure Storage module', () => {

    it('should be created with default values', () => {
        let azure = new AzureStorage('account','key')
        expect(azure.cloudName).toBe('AzureCloud')
        expect(azure.tokenExpiry).toBe(60)
        expect(azure.queueMessageTTLSeconds).toBe(3600)
    })

    it('defaults can be overidden', () => {
        let options = {
            tokenExpiry: 30,
            queueMessageTTLSeconds: 500,
            cloudName: 'AzureUSGovernment'
        }

        let azure = new AzureStorage('account','key', options)
        expect(azure.cloudName).toBe('AzureUSGovernment')
        expect(azure.tokenExpiry).toBe(30)
        expect(azure.queueMessageTTLSeconds).toBe(500)
    })

    it('should generate host URLs', () => {

        let azure = new AzureStorage('account','key')

        const azuriteBlobUrl = azure.host('blob','Azurite')
        const governmentQueueUrl = azure.host('queue','AzureUSGovernment')
        const chinaTableUrl = azure.host('table','AzureChinaCloud')
        const germanCloudBlobUrl = azure.host('blob','AzureGermanCloud')
        const azureCloudBlobUrl = azure.host('blob','AzureCloud')
        const defaultQueueUrl = azure.host('queue')

        expect(azuriteBlobUrl).toBe('http://127.0.0.1:10000/account')
        expect(governmentQueueUrl).toBe('https://account.queue.core.usgovcloudapi.net')
        expect(chinaTableUrl).toBe('https://account.table.core.chinacloudapi.cn')
        expect(germanCloudBlobUrl).toBe('https://account.blob.core.cloudapi.de')
        expect(azureCloudBlobUrl).toBe('https://account.blob.core.windows.net')
        expect(defaultQueueUrl).toBe('https://account.queue.core.windows.net')

    })

    it.skip('should generate a signed URL for a blob', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let containerName = 'node-helpers-testing'
        let blobName = 'package.json'

        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const options = {
            tokenExpiry: 42
        }
        const signedUrl = await azure.generateBlobSignedUrl(containerName,blobName,options)
        let url = new URL(signedUrl)
        const sasTokenParams = url.searchParams;

        expect(signedUrl).toContain(azure.host('blob','Azurite'))
        expect(dayjs(sasTokenParams.get('st')).isBefore(dayjs()))
        expect(dayjs(sasTokenParams.get('se')).isAfter(dayjs()))
        expect(dayjs(sasTokenParams.get('st')).add(azure.tokenExpiry).isSame(dayjs(sasTokenParams.get('se'))))
        expect(sasTokenParams.get('sp')).toBe('r') // Read only by default
    })

    it.skip('should upload a blob from a file',async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let containerName = 'node-helpers-testing'
        let file = 'package.json'
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        let success = await azure.uploadBlobFromFile(containerName,file)
        expect(success)
    })

    it.skip('should get a blob from azure storage', async () =>{
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let containerName = 'node-helpers-testing'
        let blobName = 'package.json'
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        let file = await azure.getBlob(containerName,blobName)
        file = JSON.parse(file)
        expect(file.name).toBe("@beauraines/node-helpers")

    })

    it.skip('should download a blob to a file', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let containerName = 'node-helpers-testing'
        let blobName = 'package.json'
        let file = path.join(os.tmpdir(),`package.${dayjs().unix()}.json`)
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        await azure.downloadBlobToFile(containerName,blobName,file)
        expect(fileExists(file))
    })

    it.skip('should list blobs from azure storage', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let containerName = 'node-helpers-testing'
        let blobName = 'package.json'
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        let blobs = await azure.listBlobs(containerName)
        console.log(blobs)
        expect(Array.isArray(blobs));
        expect(blobs.length).toBeGreaterThan(0)
        expect(blobs.filter(b => b.name == blobName).length).toBe(1)
    })

    it.skip('should send a message to the storage queue', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const message = {foo:"bar"}
        const queueName = 'node-helpers-testing'
        let response = await azure.sendMessageToQueue(queueName,JSON.stringify(message))
        expect(response.status).toBe(201)
    })

    it.skip('should error when generating a SAS URL for the storage queue without permissions', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const queueName = 'node-helpers-testing'
        expect(() => azure.getStorageQueueSignedURL(queueName)).toThrow();
    })

    it.skip('should generate a SAS URL for the storage queue', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const queueName = 'node-helpers-testing'
        const options = {permissions:"r"}
        let response = await azure.getStorageQueueSignedURL(queueName,options)
        expect(response.includes('sp=r')).toBe(true) // Read permissions
        expect(response.includes('http://127.0.0.1:10001/devstoreaccount1/node-helpers-testing')).toBe(true) // Azurite URL for storage queue
        // TODO compute the expected expiration time
        // expect(response.includes('se=2024-10-13T23%3A59%3A02Z')).toBe(true) // Expiration time defaults to 30 minutes
    })


    it.skip('should list the queues in the storage account', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const queueName = 'node-helpers-testing';
        let queues = await azure.listsQueues();
        expect(queues.map(x => x.name).indexOf(queueName)).toBeGreaterThan(-1)
    })

    it.skip('should get the queue properties', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const queueName = 'node-helpers-testing';
        let properties = await azure.getQueueProperties(queueName);
        expect(properties.approximateMessagesCount).toBeGreaterThan(0)
    })

    it.skip('should get a message from the queue', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const queueName = 'node-helpers-testing';
        let response = await azure.getQueueMessages(queueName);
        const expectedMessage = {foo:"bar"}
        expect(response._response.status).toBe(200)
        expect(response.receivedMessageItems.length).toBeGreaterThan(0)
        expect(response.receivedMessageItems[0].messageText).toBe(JSON.stringify(expectedMessage))
    })

    it.skip('should get multiple messages from the queue', async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const queueName = 'node-helpers-testing';
        let response = await azure.getQueueMessages(queueName,{numberOfMessages:5});
        expect(response._response.status).toBe(200)
        expect(response.receivedMessageItems.length).toBeGreaterThan(1)
        expect(response.receivedMessageItems.length).toBeLessThan(6)
    })

    it.skip('should delete a message from the queue',async () => {
        const account = "devstoreaccount1";
        const accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
        let azure = new AzureStorage(account,accountKey,{cloudName:'Azurite'})
        const queueName = 'node-helpers-testing';
        expect(() => azure.deleteQueueMessage(queueName,undefined,undefined)).toThrow() // popReceipt cannot be null
        let addedMessage = await azure.sendMessageToQueue(queueName,'abc123')
        let response = await azure.deleteQueueMessage(queueName,addedMessage.messageId,addedMessage.popReceipt);
        expect(response.errorCode).toBe(undefined)
    })


})