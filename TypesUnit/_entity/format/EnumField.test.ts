import EnumField from 'Types/_entity/format/EnumField';

describe('Types/_entity/format/EnumField', () => {
    let field: EnumField;

    beforeEach(() => {
        field = new EnumField();
    });

    describe('.getType()', () => {
        test('should return "Enum" by default', () => {
            expect(field.getType()).toBe('Enum');
        });
    });
});
