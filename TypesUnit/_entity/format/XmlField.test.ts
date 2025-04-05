import XmlField from 'Types/_entity/format/XmlField';

describe('Types/_entity/format/XmlField', () => {
    let field: XmlField;

    beforeEach(() => {
        field = new XmlField();
    });

    describe('.getDefaultValue()', () => {
        test('should return an empty string by default', () => {
            expect(field.getDefaultValue()).toBe('');
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(XmlField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
