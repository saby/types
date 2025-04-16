import RecordField from 'Types/_entity/format/RecordField';

describe('Types/_entity/format/RecordField', () => {
    let field: RecordField;

    beforeEach(() => {
        field = new RecordField();
    });

    describe('.getType()', () => {
        test('should return "Record" by default', () => {
            expect(field.getType()).toBe('Record');
        });
    });
});
