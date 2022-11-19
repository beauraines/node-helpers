const helper = require('./helpers');

it('should return a title case string',() => {
    const lowerString = 'a quick brown fox';
    const titleString = 'A Quick Brown Fox';

    expect(helper.toTitleCase(lowerString)).toBe(titleString);
})

