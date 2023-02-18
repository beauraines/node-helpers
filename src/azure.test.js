const AzureStorage  = require('./azure.js')

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

    it.todo('should generate a signed URL for a blob')
    it.todo('should upload a blob from a file')
    it.todo('should send a message to the storage queue')

})