const azure = require('azure-storage');
const { QueueClient, StorageSharedKeyCredential } = require("@azure/storage-queue");
var path = require('path');

/**
 * Creates an AzureStorage class to interact with Azure Storage Blob Containers and Storage Queues.
 * 
 * @param {string} storageAccountName the name of the storage account
 * @param {string} storageAccountKey the key for the storage account
 * @param {Object} [options]
 * @param {int} [options.tokenExpiry] expiration minutes for SAS tokens, defaults to 60 minutes
 * @param {int} [options.queueMessageTTLSeconds] expiration in seconds for messages written to storage queues, defaults to 3600 (1 hour)
 * @param {string} [options.cloudName] AzureCloud, AzureChinaCloud. AzureUSGovernment, AzureGermanCloud or Azurite for the emulator. Defaults to AzureCloud
 */
class AzureStorage {

  constructor(storageAccountName,storageAccountKey,options) {
    this.storageAccountName = storageAccountName
    this.storageAccountKey = storageAccountKey
    this.tokenExpiry = options?.tokenExpiry || 60 // defaults to 60 minute expiry
    this.queueMessageTTLSeconds = options?.queueMessageTTLSeconds || 60 *60 // defaults to 60 minutes
    this.cloudName = options?.cloudName || 'AzureCloud'
    
  }


  /**
   * Determines the Azure Storage service URL, accounting for the service type, government cloud or if
   * the Azurite storage emulator is used. 
   * @param {string} service The Azure Storage service, one of `blob`,`queue` or `table`
   * @param {string} cloudName One of AzureCloud, AzureChinaCloud. AzureUSGovernment, AzureGermanCloud or Azurite for the emulator
   * @returns 
   */
  host(service,cloudName) {
      let port,url;
      switch (service) {
          case 'blob':
              port = 10000
              break;
          case 'queue':
              port = 10001
              break;
          case 'table':
              port = 10002
              break;
          default:
              break;
      }
      switch (cloudName) {
        case 'Azurite':
          url =  `http://127.0.0.1:${port}/${this.storageAccountName}`
          break;
        case 'AzureUSGovernment':
          url = `https://${this.storageAccountName}.${service}.core.usgovcloudapi.net`
          break;
        case 'AzureChinaCloud':
          url = `https://${this.storageAccountName}.${service}.core.chinacloudapi.cn`
          break;
        case 'AzureGermanCloud':
          url = `https://${this.storageAccountName}.${service}.core.cloudapi.de`
          break;
        case 'AzureCloud':
        default:
          url = `https://${this.storageAccountName}.${service}.core.windows.net`
          break;
      }
      return url
  }


  /**
   * Sends a message to the specified storage queue. The messages are given a TTL based upon the
   * class's `queueMessageTTLSeconds` value.
   * @param {string} queueUrl The URL to the storage queue
   * @param {string} messageContent The message to send to the queue
   */
  async sendMessageToQueue(queueUrl, messageContent,) {
    try {
      const queueClient = new QueueClient(
        queueUrl,
        new StorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
      );
      let queueOptions = {
        messageTimeToLive: this.queueMessageTTLSeconds
      };
      let sendMessageResponse = await queueClient.sendMessage(messageContent, queueOptions);
      console.log(
        "Sent message successfully, service assigned message Id:", sendMessageResponse.messageId,
        "service assigned request Id:", sendMessageResponse.requestId
      );
    } catch (error) {
      console.error(error.message)
    }
  }

  /**
   * Generates a signed URL for the specified blob in the specified container. The signed URL will expire
   * after the class's `tokenExpiry` minutes, which defaults to 60 if not specified. 
   * 
   * @param {string} containerName The name of the parent container for the blob
   * @param {string} blobName The name of the blob to generate the token
   * @returns {string} the signed URL for the blob
   */
  generateBlobSignedUrl(containerName, blobName) {

    const sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
            Start: new Date(),
            Expiry: azure.date.minutesFromNow(this.tokenExpiry),
        },
    };

    const blobService = azure.createBlobService(this.storageAccountName, this.storageAccountKey, this.host('blob',this.cloudName));
    const sasToken = blobService.generateSharedAccessSignature(containerName, blobName, sharedAccessPolicy);
    const blobUrl = blobService.getUrl(containerName, blobName, sasToken);

    return blobUrl;
  }

  /**
   * Uploads a local file to an Azure container as a blob. 
   * 
   * @param {string} containerName the container to which the file will be uploaded
   * @param {string} file The path the the local file to upload to the container
   */
  uploadBlobFromFile(containerName,file) {
    const blobService = azure.createBlobService(this.storageAccountName, this.storageAccountKey, this.host('blob',this.cloudName));
    const options = {
        access: 'container'
    };
    
    let blobName = path.basename(file)
    blobService.createBlockBlobFromLocalFile(containerName,blobName,file,options,function(error,response) {
      if( error) {
        console.error(error.message)
      } else {
        console.log(`${response.name} uploaded to ${response.container} container`)
      }
    });
  }

}

module.exports = AzureStorage