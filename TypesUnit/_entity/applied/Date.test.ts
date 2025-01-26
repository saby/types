import TheDate from 'Types/_entity/applied/Date';

describe('Types/_entity/applied/Date', () => {
    describe('.constructor()', () => {
        test('should create instance of Date', () => {
            const instance = new TheDate();
            expect(instance).toBeInstanceOf(TheDate);
        });

        test('should create instance with zero time', () => {
            const instance = new TheDate();
            expect(instance.getHours()).toBe(0);
            expect(instance.getMinutes()).toBe(0);
            expect(instance.getSeconds()).toBe(0);
            expect(instance.getMilliseconds()).toBe(0);
        });
    });

    describe('.toJSON()', () => {
        test('should serialize in custom format', () => {
            const instance = new TheDate(2019, 11, 21);
            expect(instance.toJSON().state).toEqual({
                $options: 'ISO:2019-12-21',
            });
        });
    });

    describe('::fromJSON()', () => {
        test('should create date from custom format', () => {
            const instance = TheDate.fromJSON({
                $serialized$: 'inst',
                module: '',
                id: 0,
                state: {
                    $options: 'ISO:2019-12-21',
                },
            });

            expect(instance.getFullYear()).toEqual(2019);
            expect(instance.getMonth()).toEqual(11);
            expect(instance.getDate()).toEqual(21);
        });
    });
});
