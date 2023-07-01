const os = require('os');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const helpers = require('./helpers');
const { getDBConnection } = require('./database');
const path = require('path');
const process = require('node:process')

jest.mock('sqlite');
jest.mock('os');
jest.mock('./helpers');


describe('database module', () => {

    it('should exit if the database does not exist', async () => {
        helpers.fileExists.mockReturnValue(false);
        console.error = jest.fn()
        const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});


        await getDBConnection('/home/database-does-not-exist.db')
        expect(mockExit).toHaveBeenCalledWith(1)

    })
    
    it('should open the default database if no file specified', async () => {
        // mock sqlite.open()
        // Need `${homedir}/BurnDownStatus.db` or do we mock it?
        const expectedHomeDir = '/home';

        os.homedir.mockReturnValue(expectedHomeDir);
        // helpers.fileExists.mockResolvedValue(true);
        helpers.fileExists.mockReturnValue(true);


        const expectedDefaultFile = path.join(os.homedir(),'BurnDownStatus.db')
        
        const file = undefined;
        // call function with null file
        // eslint-disable-next-line no-unused-vars
        const db = await getDBConnection(file)

        // In theory you should mock the open function and what it returns.

        // expect that sqlite.open() is called with `${homedir}/BurnDownStatus.db`
        expect(sqlite.open).toHaveBeenCalledWith({
            filename: expectedDefaultFile,
            driver: sqlite3.Database
        })
        
    })
    
    it('should open the specified database if a file is specified', async () => {


        const expectedHomeDir = '/home';
        
        os.homedir.mockReturnValue(expectedHomeDir);
        helpers.fileExists.mockReturnValue(true);

        const expectedDefaultFile = path.join(os.homedir(),'BurnDownStatus.db')

        // eslint-disable-next-line no-unused-vars
        const db = await getDBConnection(expectedDefaultFile)

        expect(sqlite.open).toHaveBeenCalledWith({
            filename: expectedDefaultFile,
            driver: sqlite3.Database
        })


    })

})



