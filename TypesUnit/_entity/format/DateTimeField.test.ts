import DateTimeField from 'Types/_entity/format/DateTimeField';

describe('Types/_entity/format/DateTimeField', () => {
    let field: DateTimeField;

    beforeEach(() => {
        field = new DateTimeField();
    });

    describe('.getDefaultValue()', () => {
        test('should return null by default', () => {
            expect(field.getDefaultValue()).toBeNull();
        });
    });

    describe('.isWithoutTimeZone()', () => {
        test('should return false by default', () => {
            expect(field.isWithoutTimeZone()).toBe(false);
        });

        test('should return value passed to the constructor', () => {
            const fieldA = new DateTimeField({
                withoutTimeZone: true,
            });
            expect(fieldA.isWithoutTimeZone()).toBe(true);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(DateTimeField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
