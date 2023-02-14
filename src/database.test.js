const os = require('os');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const helpers = require('./helpers');
const { getDBConnection } = require('./database');


jest.mock('sqlite');
jest.mock('os');
jest.mock('./helpers');


describe.skip('database module', () => {

    it('should exit if the database does not exist', () => {
        helpers.fileExists.mockReturnValue(false);
        console.error = jest.fn()
        process.exit = jest.fn()

        const db = getDBConnection('/home/database-does-not-exist.db')
        expect(process.exit).toHaveBeenCalled()

    })
    
    it('should open the default database if no file specified', () => {
        // mock sqlite.open()
        // Need `${homedir}/BurnDownStatus.db` or do we mock it?
        const expectedHomeDir = '/home';

        os.homedir.mockReturnValue(expectedHomeDir);
        // helpers.fileExists.mockResolvedValue(true);
        helpers.fileExists.mockReturnValue(true);


        const expectedDefaultFile = `${os.homedir()}/BurnDownStatus.db`
        
        const file = undefined;
        // call function with null file
        const db = getDBConnection(file)

        // In theory you should mock the open function and what it returns.

        // expect that sqlite.open() is called with `${homedir}/BurnDownStatus.db`
        expect(sqlite.open).toHaveBeenCalledWith({
            filename: expectedDefaultFile,
            driver: sqlite3.Database
        })
        
    })
    
    it('should open the specified database if a file is specified', () => {


        const expectedHomeDir = '/home';
        
        os.homedir.mockReturnValue(expectedHomeDir);
        helpers.fileExists.mockReturnValue(true);

        const expectedDefaultFile = `${os.homedir()}/my_database.db`

        const db = getDBConnection(expectedDefaultFile)

        expect(sqlite.open).toHaveBeenCalledWith({
            filename: expectedDefaultFile,
            driver: sqlite3.Database
        })


    })

})



