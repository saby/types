import BooleanField from 'Types/_entity/format/BooleanField';

describe('Types/_entity/format/BooleanField', () => {
    let field: BooleanField;

    beforeEach(() => {
        field = new BooleanField();
    });

    describe('.getDefaultValue()', () => {
        test('should return null by default', () => {
            expect(field.getDefaultValue()).toBeNull();
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(BooleanField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
