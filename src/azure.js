const dayjs = require('dayjs')
const fs = require('fs');
const { streamToBuffer } = require('./helpers.js')
const { BlobServiceClient, StorageSharedKeyCredential:BlobStorageSharedKeyCredential } = require("@azure/storage-blob");
const { QueueServiceClient ,StorageSharedKeyCredential:QueueStorageSharedKeyCredential } = require("@azure/storage-queue");
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
   * 
   * The response includes the `expiresOn`, `messageId` and `requestId` as well as a status code in 
   * `_response.status`
   * 
   * @param {string} queueUrl The URL to the storage queue
   * @param {string} messageContent The message to send to the queue
   * 
   * @returns {Object} sendMessageResponse
   */
  async sendMessageToQueue(queueName, messageContent) {
    try {
      const queueServiceClient = new QueueServiceClient(
        this.host('queue',this.cloudName),
        new QueueStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
      );

      const queueClient = queueServiceClient.getQueueClient(queueName);
        
      let queueOptions = {
        messageTimeToLive: this.queueMessageTTLSeconds
      };

      let sendMessageResponse = await queueClient.sendMessage(messageContent,queueOptions);
      sendMessageResponse.status = sendMessageResponse._response.status;
      delete sendMessageResponse._response;
      return sendMessageResponse;

    } catch (error) {
      console.log(error.message)      
    }
  }

  /**
   * Gets any number of messages from the queue. The messages themselves are in the property
   * `receivedMessageItems[]messageText` Use the options to control the number of messages returned, 
   * defaults are 1 with a 30 second timeout. You will need the `messageId` and `popReceipt` to
   * delete the message after processing.
   * 
   * @param {string} queueName The name of the queue
   * @param {object} options Any options such as `numberOfMessages` or `visibilityTimeout`
   * @returns {object} The queue messages response
   */
  async getQueueMessages(queueName,options) {
    const queueServiceClient = new QueueServiceClient(
      this.host('queue',this.cloudName),
      new QueueStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );

    const queueClient = queueServiceClient.getQueueClient(queueName);
    const receivedMessagesResponse = await queueClient.receiveMessages(options);
    return receivedMessagesResponse;

  }


  /**
   * Deletes a message, by `messageId` and `popReceipt` from a named queue
   * 
   * @param {string} queueName The name of the queue that has the message
   * @param {string} messageId The message id to be deleted
   * @param {string} popReceipt The popReceipt of teh message to be deleted
   * @returns object with a nothing really useful
   */
  async deleteQueueMessage(queueName,messageId,popReceipt) {
    const queueServiceClient = new QueueServiceClient(
      this.host('queue',this.cloudName),
      new QueueStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );

    const queueClient = queueServiceClient.getQueueClient(queueName);
    const deleteMessageResponse = await queueClient.deleteMessage(messageId,popReceipt);
    return deleteMessageResponse

  }

  /**
   * Gets the named queues properties, which includes the approximateMessagesCount
   * 
   * @param {string} queueName 
   * 
   * @returns {Object} the queues properties
   */
  async getQueueProperties(queueName) {
    const queueServiceClient = new QueueServiceClient(
      this.host('queue',this.cloudName),
      new QueueStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );

    const queueClient = queueServiceClient.getQueueClient(queueName);
    const properties = await queueClient.getProperties();
    return properties

  }

  /**
   * Lists storage queues in the  storage account
   * 
   * @returns Array
   */
  async listsQueues() {
    try {
    const queueServiceClient = new QueueServiceClient(
      this.host('queue',this.cloudName),
      new QueueStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );

    let queues = []
    for await (const queue of queueServiceClient.listQueues()) {
        queues.push(queue)
    }

    return queues;

  } catch (error) {
    console.log(error.message)
  }
}

  /**
   * Gets a SAS URL for the storage queue
   * .
   * @param {string} queueName The name of the storage queue
   * @param {object} options Should include `permissions: "raup"` or some combination thereof Any additional options supported. https://docs.microsoft.com/en-us/rest/api/storageservices/constructing-a-service-sas
   * 
   * @returns {string} SAS URL for the specified queue
   */
getStorageQueueSignedURL(queueName,options) {
  const queueServiceClient = new QueueServiceClient(
    this.host('queue',this.cloudName),
    new QueueStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
  );

  const queueClient = queueServiceClient.getQueueClient(queueName);
 
  options = {
    startsOn: dayjs().toDate(),
    expiresOn: dayjs().add(this.tokenExpiry,'minutes'),
    ...options
  }
  
  if (!options.permissions || !options.expiresOn) {
    throw new Error("Must provide 'permissions' and 'expiresOn' for Queue SAS generation when 'identifier' is not provided");    
  }

  return queueClient.generateSasUrl(options)
  
}

  /**
   * Generates a signed URL for the specified blob in the specified container. The signed URL will expire
   * after the class's `tokenExpiry` minutes, which defaults to 60 if not specified. 
   * 
   * @param {string} containerName The name of the parent container for the blob
   * @param {string} blobName The name of the blob to generate the token
   * @returns {string} the signed URL for the blob
   */
  async generateBlobSignedUrl(containerName, blobName) {

    const blobServiceClient = new BlobServiceClient(
      this.host('blob',this.cloudName),
      new BlobStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const now = dayjs()

    const options = {
      permissions: 'r',
      startsOn: now.toDate(), 
      expiresOn: now.add(this.tokenExpiry,'minutes')
    }

    const signedUrl = await blockBlobClient.generateSasUrl(options)
    console.log(signedUrl)
    return signedUrl;
  }

  /**
   * Uploads a local file to an Azure container as a blob. 
   * 
   * @param {string} containerName the container to which the file will be uploaded
   * @param {string} file The path the the local file to upload to the container
   * @returns {boolean} Success or failure to upload
   */
  async uploadBlobFromFile(containerName,file) {
    const blobServiceClient = new BlobServiceClient(
      this.host('blob',this.cloudName),
      new BlobStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    const options = {
      access: 'container'
    };
    
    let blobName = path.basename(file)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
      // eslint-disable-next-line no-unused-vars
      const response = await blockBlobClient.uploadFile(file,options)
      // TODO remove this from this function - separation of concerns, let the caller do the logging
      console.log(`${file} uploaded to ${containerName} container as ${blobName}`)
      return true
    } catch (error) {
      console.error(error.message)
      return false
    }


      
  }


  /**
   * Downloads a blob to a local file
   * 
   * @param {string} containerName the name of the container to download the blob from
   * @param {string} blob The blob to download
   * @param {string} file The path to the location to write the file
   */
  async downloadBlobToFile(containerName,blobName,file) {
    const blobServiceClient = new BlobServiceClient(
      this.host('blob',this.cloudName),
      new BlobStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadBlockBlobResponse = await blobClient.download();
    // TODO add a success and failure test
    let writer = fs.createWriteStream(file) 
    downloadBlockBlobResponse.readableStreamBody.pipe(writer)
    // TODO remove this from this function - separation of concerns, let the caller do the logging
    console.log(`${blobName} downloaded to ${file}`)

  }

  /**
   * Gets a blob and returns the content. The idea is that you can get a blob without 
   * having to save it to a file and then re-read it. This cannot handle binary data
   * 
   * @param {string} containerName the container to get the blob from
   * @param {string} blobName the name of the blob to get
   * @returns {string} the downloaded blob as 
   */
  async getBlob(containerName,blobName) {
    const blobServiceClient = new BlobServiceClient(
      this.host('blob',this.cloudName),
      new BlobStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

     // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = (
      await streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
    ).toString(); // FIXME - what happens with binary content?
    // console.log("Downloaded blob content:", downloaded);
    return downloaded

  }


  /**
   * Gets a blob and returns the content as a Buffer.
   * 
   * @param {string} containerName the container to get the blob from
   * @param {string} blobName the name of the blob to get
   * @returns {Buffer} the downloaded blob as 
   */
  async getBinaryBlob(containerName,blobName) {
    const blobServiceClient = new BlobServiceClient(
      this.host('blob',this.cloudName),
      new BlobStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

     // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    const downloadBlockBlobResponse = await blobClient.download();
    const downloaded = await streamToBuffer(downloadBlockBlobResponse.readableStreamBody);
    return downloaded

  }

  /**
   * Lists the blobs in a specified container, returning an array of the BlobItem object
   * 
   * @param {string} containerName 
   * @returns Blob[] 
   */
  async listBlobs(containerName) {
    const blobServiceClient = new BlobServiceClient(
      this.host('blob',this.cloudName),
      new BlobStorageSharedKeyCredential(this.storageAccountName, this.storageAccountKey)
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    let blobs = []
    for await (const blob of containerClient.listBlobsFlat()) {
      blobs.push(blob)
    }

    return blobs

  }


}

module.exports = AzureStorage