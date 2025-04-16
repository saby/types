import IdentityField from 'Types/_entity/format/IdentityField';

describe('Types/_entity/format/IdentityField', () => {
    let field: IdentityField;

    beforeEach(() => {
        field = new IdentityField();
    });

    describe('.getDefaultValue()', () => {
        test('should return 0 by default', () => {
            expect(field.getDefaultValue()).toEqual([null]);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(IdentityField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
