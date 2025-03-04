import MoneyField from 'Types/_entity/format/MoneyField';

describe('Types/_entity/format/MoneyField', () => {
    let field: MoneyField;

    beforeEach(() => {
        field = new MoneyField();
    });

    describe('.getPrecision()', () => {
        test('should return 2 by default', () => {
            expect(field.getPrecision()).toBe(2);
        });
    });

    describe('.isLarge()', () => {
        test('should return false by default', () => {
            expect(field.isLarge()).toBe(false);
        });

        test('should return the value passed to the constructor', () => {
            const field = new MoneyField({
                large: true,
            });
            expect(field.isLarge()).toBe(true);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(MoneyField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
