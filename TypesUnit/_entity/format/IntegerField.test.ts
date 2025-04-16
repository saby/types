import IntegerField from 'Types/_entity/format/IntegerField';

describe('Types/_entity/format/IntegerField', () => {
    let field: IntegerField;

    beforeEach(() => {
        field = new IntegerField();
    });

    describe('.getDefaultValue()', () => {
        test('should return null by default', () => {
            expect(field.getDefaultValue()).toBe(null);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(IntegerField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
