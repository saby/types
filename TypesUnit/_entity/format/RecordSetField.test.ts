import RecordSetField from 'Types/_entity/format/RecordSetField';

describe('Types/_entity/format/RecordSetField', () => {
    let field: RecordSetField;

    beforeEach(() => {
        field = new RecordSetField();
    });

    describe('.getType()', () => {
        test('should return "RecordSet" by default', () => {
            expect(field.getType()).toBe('RecordSet');
        });
    });
});
