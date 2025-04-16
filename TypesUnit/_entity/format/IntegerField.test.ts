import IntegerField from 'Types/_entity/format/IntegerField';

describe('Types/_entity/format/IntegerField', () => {
    let field: IntegerField;

    beforeEach(() => {
        field = new IntegerField();
    });

    describe('.getDefaultValue()', () => {
        test('should return 0 by default', () => {
            expect(field.getDefaultValue()).toBe(0);
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
