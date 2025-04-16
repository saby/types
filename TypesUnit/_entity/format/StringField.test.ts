import StringField from 'Types/_entity/format/StringField';

describe('Types/_entity/format/StringField', () => {
    let field: StringField;

    beforeEach(() => {
        field = new StringField();
    });

    describe('.getDefaultValue()', () => {
        test('should return null by default', () => {
            expect(field.getDefaultValue()).toBeNull();
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(StringField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
