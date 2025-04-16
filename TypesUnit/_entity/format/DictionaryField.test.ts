import DictionaryField from 'Types/_entity/format/DictionaryField';

describe('Types/_entity/format/DictionaryField', () => {
    let field: DictionaryField;

    beforeEach(() => {
        field = new DictionaryField();
    });

    describe('.getDictionary()', () => {
        test('should return null by default', () => {
            expect(field.getDictionary()).toBeNull();
        });

        test('should return the value passed to the constructor', () => {
            const dict: string[] = [];
            const field = new DictionaryField({
                dictionary: dict,
            });
            expect(field.getDictionary()).toBe(dict);
        });
    });

    describe('.getLocaleDictionary()', () => {
        test('should return null by default', () => {
            expect(field.getLocaleDictionary()).toBeNull();
        });

        test('should return the value passed to the constructor', () => {
            const dict: string[] = [];
            const field = new DictionaryField({
                localeDictionary: dict,
            });
            expect(field.getLocaleDictionary()).toBe(dict);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone: DictionaryField = field.clone();
            expect(clone).toBeInstanceOf(DictionaryField);
            expect(field.isEqual(clone)).toBe(true);
            expect(field.getDictionary()).toEqual(clone.getDictionary());
        });
    });
});
