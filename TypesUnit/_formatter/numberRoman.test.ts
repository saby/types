import numberRoman from 'Types/_formatter/numberRoman';

describe('Types/_formatter/numberRoman', () => {
    test('should format 5 in roman numerals', () => {
        expect(numberRoman(5)).toStrictEqual('V');
    });

    test('should format 1236 in roman numerals', () => {
        expect(numberRoman(1236)).toStrictEqual('MCCXXXVI');
    });
});
