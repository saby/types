import cyrTranslit from 'Types/_formatter/cyrTranslit';

describe('Types/_formatter/cyrTranslit', () => {
    test('should write phrase in translite', () => {
        expect(cyrTranslit('Привет мир')).toStrictEqual('Privet_mir');
    });
});
