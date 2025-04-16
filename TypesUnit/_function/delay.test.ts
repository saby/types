import delay from 'Types/_function/delay';

describe('Types/_formatter/delay', () => {
    test('should call method', (done) => {
        delay(() => {
            done();
        });
    });
});
