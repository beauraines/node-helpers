const fs = require('fs');

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

module.exports = {
    groupAndSum,
    toTitleCase,
    fileExists,
    stripNewLines,
    readFile
}