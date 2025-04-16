import RealField from 'Types/_entity/format/RealField';

describe('Types/_entity/format/RealField', () => {
    let field: RealField;

    beforeEach(() => {
        field = new RealField();
    });

    describe('.getDefaultValue()', () => {
        test('should return null by default', () => {
            expect(field.getDefaultValue()).toBe(null);
        });
    });

    describe('.getPrecision()', () => {
        test('should return 16 by default', () => {
            expect(field.getPrecision()).toBe(16);
        });
        test('should return the value passed to the constructor', () => {
            const prec = 3;
            const field = new RealField({
                precision: prec,
            });
            expect(field.getPrecision()).toBe(prec);
        });
    });

    describe('.setPrecision()', () => {
        test('should set the default value', () => {
            const prec = 2;
            field.setPrecision(prec);
            expect(field.getPrecision()).toBe(prec);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone<RealField>();
            expect(clone).toBeInstanceOf(RealField);
            expect(field.isEqual(clone)).toBe(true);
            expect(field.getPrecision()).toBe(clone.getPrecision());
        });
    });
});
