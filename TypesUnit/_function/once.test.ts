import once from 'Types/_function/once';

describe('Types/_formatter/once', () => {
    test('should save result of the function', () => {
        let value = 1;
        const decorator = once(() => {
            return ++value;
        });
        expect(decorator()).toEqual(decorator());
        expect(value).toEqual(2);
    });
});
