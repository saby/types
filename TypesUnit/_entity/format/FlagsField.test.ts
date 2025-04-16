import FlagsField from 'Types/_entity/format/FlagsField';

describe('Types/_entity/format/FlagsField', () => {
    let field: FlagsField;

    beforeEach(() => {
        field = new FlagsField();
    });

    describe('.getType()', () => {
        test('should return "Flags" by default', () => {
            expect(field.getType()).toBe('Flags');
        });
    });
});
