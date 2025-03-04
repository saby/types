import Identity from 'Types/_entity/applied/Identity';

describe('Types/_entity/applied/Identity', () => {
    describe('.constructor()', () => {
        test('should create Identity', () => {
            const instance = new Identity([]);
            expect(instance).toBeInstanceOf(Identity);
        });
    });

    describe('.getValue()', () => {
        test('should return the value from scalar', () => {
            const value = 1;
            const instance = new Identity(value);

            expect(instance.getValue()).toBe(value);
        });

        test('should return the value from String', () => {
            const value = '1,foo';
            const instance = new Identity(value);

            expect(instance.getValue()).toBe('1');
        });

        test('should return the value from Array', () => {
            const value = [1];
            const instance = new Identity(value);

            expect(instance.getValue()).toBe(value[0]);
        });
    });

    describe('.getName()', () => {
        test('should return undefined', () => {
            const value = 1;
            const instance = new Identity(value);

            expect(instance.getName()).not.toBeDefined();
        });

        test('should return the value from String', () => {
            const value = '1,foo';
            const instance = new Identity(value);

            expect(instance.getName()).toBe('foo');
        });

        test('should return the value from Array', () => {
            const value = [1, 'foo'];
            const instance = new Identity(value);

            expect(instance.getName()).toBe(value[1]);
        });
    });

    describe('.valueOf()', () => {
        test('should return the original value', () => {
            const value: string[] = [];
            const instance = new Identity(value);

            expect(instance.valueOf()).toBe(value);
        });
    });

    describe('.toString()', () => {
        test('should return null', () => {
            const value = [null];
            const instance = new Identity(value);

            expect(instance.toString()).toBeNull();
        });

        test('should return String with commas', () => {
            const value = [0, 'foo'];
            const instance = new Identity(value);

            expect(instance.toString()).toEqual(value.join(','));
        });
    });
});
