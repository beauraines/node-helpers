const helper = require('./helpers');

describe('helpers',()=> {
    it('should return a title case string',() => {
        const lowerString = 'a quick brown fox';
        const titleString = 'A Quick Brown Fox';
    
        expect(helper.toTitleCase(lowerString)).toBe(titleString);
    })

    it('should return the correctly sparkline',()=>{
        const expectedOutput = 'last 30 days [1,5] ▁▂▄▆█ 5'
        const input = [1,2,3,4,5]
        const label = 'last 30 days'
        expect(helper.sparkline(input,label)).toBe(expectedOutput)

    })


})

