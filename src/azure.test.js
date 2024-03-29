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

    it.todo('should send a message to the storage queue')

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

})