import throttle from 'Types/_function/throttle';

describe('Types/_formatter/throttle', () => {
    test('should call method only one time', (done) => {
        let value = 1;
        const decorator = throttle(() => {
            value += 1;
        }, 0);
        decorator();
        decorator();
        setTimeout(() => {
            expect(value).toEqual(2);
            done();
        }, 150);
    });
});
