import Time from 'Types/_entity/applied/Time';

describe('Types/_entity/applied/Time', () => {
    describe('.constructor()', () => {
        test('should create instance of Time', () => {
            const instance = new Time();
            expect(instance).toBeInstanceOf(Time);
        });
    });
});
