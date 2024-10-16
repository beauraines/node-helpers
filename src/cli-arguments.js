/**
 * Parses command-line parameters and returns an array of the parameters. This is really getting the 
 * "arguments" passed from the command-line, but there is no additional parsing or formatting, so 
 * this is best suited to just parameters. You could handle each element in the array yourself for 
 * involved processing
 * 
 * `node script.js beau 42`
 * 
 * returns
 * `[ 'beau', '42' ]`
 * 
 *  * 
 * @returns Array 
 */
const getParameters = () => {
    // process.argv is an array where:
    // - The first element is the path to the Node.js executable (e.g., '/usr/local/bin/node')
    // - The second element is the path to the script file (e.g., '/path/to/script.js')
    // - The subsequent elements are the command-line arguments

    // Get the arguments starting from the third element
    const args = process.argv.slice(2).length > 0 ? process.argv.slice(2) : []
    return args
}

/**
 * Parses named command-line arguments. This only supports long-named arguments prefixed with a `--`.
 * Short arguments .e.g. `-d` are not supported. The value can either be space separated or with an
 * equals sign
 * 
 * `node name-arguments.js  --age=42 --name=Beau`
 * 
 * Using this function this will return
 * 
 * { age: '42', name: 'Beau' }
 * 
 * 
 * @returns Object
 */
const getNamedArguments = () => {
    const args = {};
  
    const argv =process.argv;
    // Start from index 2 to skip the node executable and script file paths
    for (let i = 2; i < argv.length; i++) {
      let arg = argv[i];
  
      if (arg.startsWith('--')) {
        // Remove the leading --
        arg = arg.slice(2);
  
        // Handle --key=value
        if (arg.includes('=')) {
          const [key, value] = arg.split('=');
          args[key] = value;
        } else {
          // Handle --key value
          const key = arg;
          const value = argv[i + 1];
  
          if (!value || value.startsWith('--')) {
            args[key] = true; // For flags without values
          } else {
            args[key] = value;
            i++; // Skip the next item as it's the value for this key
          }
        }
      }
    }
  
    return args;
  }


module.exports = {
    getNamedArguments,
    getParameters
}