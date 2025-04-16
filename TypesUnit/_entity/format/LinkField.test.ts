import LinkField from 'Types/_entity/format/LinkField';

describe('Types/_entity/format/LinkField', () => {
    let field: LinkField;

    beforeEach(() => {
        field = new LinkField();
    });

    describe('.getDefaultValue()', () => {
        test('should return 0 by default', () => {
            expect(field.getDefaultValue()).toBe(0);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(LinkField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
