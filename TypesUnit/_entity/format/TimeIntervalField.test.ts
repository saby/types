import TimeIntervalField from 'Types/_entity/format/TimeIntervalField';

describe('Types/_entity/format/TimeIntervalField', () => {
    let field: TimeIntervalField;

    beforeEach(() => {
        field = new TimeIntervalField();
    });

    describe('.getDefaultValue()', () => {
        test('should return 0 by default', () => {
            expect(field.getDefaultValue()).toBe(0);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone = field.clone();
            expect(clone).toBeInstanceOf(TimeIntervalField);
            expect(field.isEqual(clone)).toBe(true);
        });
    });
});
