import DateTime from 'Types/_entity/applied/DateTime';

describe('Types/_entity/applied/DateTime', () => {
    describe('.constructor()', () => {
        test('should create instance of Date', () => {
            const instance = new DateTime();
            expect(instance).toBeInstanceOf(Date);
        });
    });

    describe('.withoutTimeZone', () => {
        test('should return false by default', () => {
            const instance = new DateTime();
            expect(instance.withoutTimeZone).toBe(false);
        });

        test('should get the value from constructor argument', () => {
            const instanceA = new DateTime(true);
            expect(instanceA.withoutTimeZone).toBe(true);

            const instanceB = new DateTime(new Date(), true);
            expect(instanceB.withoutTimeZone).toBe(true);

            const instanceC = new DateTime(2020, 6, 21, true);
            expect(instanceC.withoutTimeZone).toBe(true);
        });
    });

    describe('.toJSON()', () => {
        test('should save milliseconds into $options', () => {
            const instance = new DateTime();
            const time = instance.getTime();
            const serialized = instance.toJSON();

            expect(serialized.state.$options).toEqual(time);
        });

        test('should save withoutTimeZone flag into state', () => {
            const instance = new DateTime(true);
            const serialized = instance.toJSON();

            expect(serialized.state.withoutTimeZone).toBe(true);
        });
    });

    describe('::fromJSON()', () => {
        test('should create date from $options', () => {
            const time = 1234567890;
            const instance = DateTime.fromJSON({
                $serialized$: 'inst',
                module: '',
                id: 0,
                state: {
                    $options: time,
                },
            });

            expect(instance.getTime()).toEqual(time);
        });

        test('should create date with withoutTimeZone flag', () => {
            const instance = DateTime.fromJSON({
                $serialized$: 'inst',
                module: '',
                id: 0,
                state: {
                    withoutTimeZone: true,
                },
            });

            expect(instance.withoutTimeZone).toBe(true);
        });
    });

    describe('::getClientTimezoneOffset()', () => {
        test('should return local time zone by default', () => {
            const offset = DateTime.getClientTimezoneOffset();
            const now = new Date();

            expect(offset).toBe(now.getTimezoneOffset());
        });

        test('should return time zone from cookie on SSR environment', () => {
            //@ts-ignore
            const process = globalThis.process;
            const tz = 123;

            //@ts-ignore
            globalThis.process = {
                //@ts-ignore
                domain: {
                    req: {
                        cookies: { tz },
                    },
                },
            };

            const offset = DateTime.getClientTimezoneOffset();

            //@ts-ignore
            globalThis.process = process;

            expect(offset).toBe(tz);
        });
    });
});
