const fs = require('fs');
const sparkly = require('sparkly')
const gunzip = require('gunzip-maybe');

/**
 * Converts a string to Title Case, using whitespace as the delimiter
 * @param {String} str String to convert
 * @returns The string converted to title case
 */
function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
      }
    );
}

const toUpperSnakeCase = (str) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore before capital letters
        .replace(/[^a-zA-Z0-9_]/g, '_') // Replace non-alphanumeric characters with underscore
        .toUpperCase(); // Convert to uppercase
}


/**
 * Removes newline characters \r and/or \n from a string
 * @param {string} string to remove newlines from
 * @returns string
 */
function stripNewLines(string) {
  return string.replace(/\r|\n/g, '');
}

/**
 * Checks to see if the specified file exists
 * @param {string} filePath fully qualified path and filename 
 * @returns Boolean
 */
async function fileExists(filePath) {
    return fs.existsSync(filePath);
}

/**
 * Asynchronously reads the entire file contents and returns it.
 * @param {string} filePath fully qualified path and filename
 * @returns any
 */
async function readFile(filePath) {
  return fs.readFileSync(filePath,{ encoding: 'utf8', flag: 'r' });
}

/**
 * Asynchronously writes input to filename.
 * @param {string} filePath fully qualified path and filename
 * @returns any
 */
async function writeFile(filePath,data) {
  return fs.writeFileSync(filePath,data,{ encoding: 'utf8' });
}

/**
 * Asynchronously reads the contents of a directory and returns the filenames as an array. Optionally, 
 * filters by the extension
 * @param {String} directory Path to the directory
 * @param {String | null} extension optional file extension to filter for
 * @returns { String[] } of file names
 */
async function listFiles(directory,extension) {
  // TODO check for directory existence
  return fs.readdirSync(directory,{withFileTypes: true})
    .filter(item => !item.isDirectory() && item.name.includes(extension))
    .map(item => item.name)
}

/**
 * Groups an array by specified properties and sums other specified properties
 * 
 * https://stackoverflow.com/questions/46794232/group-objects-by-multiple-properties-in-array-then-sum-up-their-values
 * 
 * @param {Array} arr Array of Objects to aggregate
 * @param {Array} groupKeys keys to group by
 * @param {Array} sumKeys keys of properties to sum by
 * @returns Array of Objects
 */
 function groupAndSum(arr, groupKeys, sumKeys){
  return Object.values(
    arr.reduce((acc,curr)=>{
      const group = groupKeys.map(k => curr[k]).join('-');
      acc[group] = acc[group] || Object.fromEntries(
         groupKeys.map(k => [k, curr[k]]).concat(sumKeys.map(k => [k, 0])));
      sumKeys.forEach(k => acc[group][k] += curr[k]);
      return acc;
    }, {})
  );
}

/**
 * Returns the current unix timestamp in seconds
 * 
 * @returns Number
 */
function unixTimestamp() {
  return Math.floor(Date.now() / 1000)
}

/**
 * Returns unix timestamp in milliseconds
 * 
 * @returns Number
 */
function getEpochMillis() {
  return Date.now()
}



/**
 * Generates a sparkline optionally with labels
 * 
 * labelled sparkline includes a label, min, max and last value
 *
 * last 30 days [1,5] ▁▂▄▆█ 5
 * 
 * unlabled is just that ▁▂▄▆█
 * 
 * Options supported are
 * 
 * {
 * coerceData: true, // coerces the minimum value to zero 
 * }
 * 
 * @param {array} data Array of values to plot in the sparkline
 * @param {string} label Text to display before sparkline, if empty or null, will not display any labels
 * @param {object} options Optional options for display, e.g display min,max,last, range coercion
 * 
 * @returns 
 */
 
function sparkline(data,label,options) {

  options = {
    coerceData: true,
    ...options
  }

  // TODO add handling if data is object
  // Assuming data is array
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const lastValue = data.slice(-1)[0]

  // This is the default behavior
  if ( options.coerceData ) {
    // coerces the minimum value to zero because the mimimum option is only used for range validation, 
    // not display https://github.com/sindresorhus/sparkly/blob/9e33eaff891c41e8fb8c8883f62e9821729a9882/index.js#L15
    // sparkly(open,{minimum:27,maximum:50})
    data = data.map( x=> x- minValue)
  }


  let sparkline
  if (label) {
    sparkline = `${label} [${minValue},${maxValue}] ${sparkly(data)} ${lastValue}`
  } else {
    sparkline = sparkly(data)
  }
  return sparkline
}

/**
 * Given a RESTful url e.g. https://www.example.com/app/#list/44719910/959889147?id=12234&363636=334' 
 * this function will return the resource ID, ignoring the query parameters
 * 
 * @param {string} url The URL to find the resource or last part of the routing
 * @returns string
 */
const getResourceId = (url) => {
  let queryStringStart = url.lastIndexOf('?')
  if (queryStringStart == -1) {
      queryStringStart = url.length
  }
  const lastSlash = url.lastIndexOf('/')
  const id = url.substring(lastSlash+1,queryStringStart) 
  return id
}


// [Node.js only] A helper method used to read a Node.js readable stream into a Buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
       
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => {
       
      resolve(Buffer.concat(chunks));
    });
    readableStream.on("error", reject);
  });
}

// Function to decompress a gzipped file and return a stream
const decompressFile = (filePath) => {
  return fs.createReadStream(filePath).pipe(gunzip());
};


module.exports = {
  decompressFile,
  getEpochMillis,
  getResourceId,
  fileExists,
  groupAndSum,
  readFile,
  listFiles,
  sparkline,
  streamToBuffer,
  stripNewLines,
  toTitleCase,
  toUpperSnakeCase,
  unixTimestamp,
  writeFile
}
