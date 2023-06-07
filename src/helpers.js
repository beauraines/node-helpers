const fs = require('fs');
const sparkly = require('sparkly')

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

// TODO Add unit test
// Expected output last 30 days [1,5] ▁▂▄▆█ 5 from [1,2,3,4,5]
/**
 * Generates a sparkline with labels
 * 
 * @param {array} data Array of values to plot in the sparkline
 * @param {string} label Text to display before sparkline
 * @param {object} options Optional options for display, e.g display min,max,last, range coercion
 * @returns 
 */
function sparkline(data,label,options) {
  // TODO add handling if data is object
  // let open = last30days.map( x=> x.open_count)

  // Assuming data is array
  const minValue = Math.min(...data)
  const maxValue = Math.max(...data)
  const lastValue = data.slice(-1)[0]

  // coerces the minimum value to zero because the mimimum option is only used for range validation, 
  // not display https://github.com/sindresorhus/sparkly/blob/9e33eaff891c41e8fb8c8883f62e9821729a9882/index.js#L15
  // sparkly(open,{minimum:27,maximum:50})
  return `${label} [${minValue},${maxValue}] ${sparkly(data.map( x=> x- minValue))} ${lastValue}`
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

module.exports = {
    getEpochMillis,
    getResourceId,
    fileExists,
    groupAndSum,
    readFile,
    listFiles,
    sparkline,
    stripNewLines,
    toTitleCase,
    unixTimestamp
}
