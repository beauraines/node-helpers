const helper = require('./helpers');

describe('helpers',()=> {
    it('should return a title case string',() => {
        const lowerString = 'a quick brown fox';
        const titleString = 'A Quick Brown Fox';
    
        expect(helper.toTitleCase(lowerString)).toBe(titleString);
    })

    it('should return the correctly formatted sparkline',()=>{
        const expectedOutput = 'last 30 days [1,5] ▁▂▄▆█ 5'
        const input = [1,2,3,4,5]
        const label = 'last 30 days'
        expect(helper.sparkline(input,label)).toBe(expectedOutput)
    })

    it('should return a sparkline with no additional labeling',()=>{
        const expectedOutput = '▁▂▄▆█'
        const input = [1,2,3,4,5]
        const label = ''
        expect(helper.sparkline(input,label)).toBe(expectedOutput)
    })

    it('should return a sparkline with no range coercion',()=>{
        const expectedOutput = '▂▄▅▇█'
        const input = [1,2,3,4,5]
        const label = ''
        const options = { coerceData: false }
        expect(helper.sparkline(input,label, options)).toBe(expectedOutput)
    })

    it('should return an upper case snake case string',()=>{
        const expectedOutput = 'NEXT_WEEK';
        const inputs = ['nextWeek','next-week','next_week'];
        inputs.forEach( i => {
            expect(helper.toUpperSnakeCase(i)).toBe(expectedOutput)
        })
    })

    it('should return the correct date-time for a timestamp',() =>{
        const timestamp = 1729396788;
        const expectedOutput = '2024-10-20T03:59:48.000Z';
        const convertedDate = helper.unixTimestampToDate(timestamp);
        expect(convertedDate).toBe(expectedOutput);
    })

    it('should sleep for 1 second', async () => {
        let expectedEnd = new Date();
        expectedEnd.setSeconds(expectedEnd.getSeconds() + 1);  // Modify expectedEnd directly
        await helper.sleep(1000);
        const end = new Date();
        expect(end.getTime()).toBeCloseTo(expectedEnd.getTime(), -2);  // Allow slight deviation
    })

})

