import memoize from 'Types/_function/memoize';

describe('Types/_formatter/memoize', () => {
    test('should save result of the function', () => {
        let value = 1;
        const decorator = memoize(() => {
            return ++value;
        });
        expect(decorator()).toEqual(decorator());
    });

    test('should save result of the function', () => {
        let value = 1;
        const decorator = memoize(() => {
            return ++value;
        });
        expect(decorator()).toEqual(2);
        expect(decorator(1)).toEqual(3);
    });

    test('should clear memoize for function and arguments', () => {
        let value = 1;
        const origin = () => {
            return ++value;
        };
        const decorator = memoize(origin);
        decorator(1);
        //@ts-ignore
        memoize.clear(origin, 1);
        expect(decorator(1)).toEqual(3);
    });
});
