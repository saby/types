import Dictionary from 'Types/_collection/Dictionary';
import ArrayEnumerator from 'Types/_collection/enumerator/Arraywise';
import ObjectEnumerator from 'Types/_collection/enumerator/Objectwise';

describe('Types/_collection/Dictionary', () => {
    const getDict = () => {
        return ['one', 'two', 'three'];
    };
    const getLocaleDict = () => {
        return ['uno', 'dos', 'tres'];
    };
    let dict: string[];
    let localeDict: string[];
    let instance: Dictionary<string>;

    beforeEach(() => {
        dict = getDict();
        localeDict = getLocaleDict();
        //@ts-ignore
        instance = new Dictionary({
            dictionary: dict,
        });
    });

    describe('.constructor()', () => {
        test('should create Dictionary', () => {
            expect(instance).toBeInstanceOf(Dictionary);
        });
    });

    describe('.getDictionary', () => {
        test('should return dictionary copy', () => {
            expect(instance.getDictionary() !== dict).toBeTruthy();
            expect(instance.getDictionary()).toEqual(dict);
        });

        test('should return localized dictionary copy', () => {
            //@ts-ignore
            const innerInstance = new Dictionary({
                dictionary: dict,
                localeDictionary: localeDict,
            });
            expect(innerInstance.getDictionary(true) !== localeDict).toBeTruthy();
            expect(innerInstance.getDictionary(true)).toEqual(localeDict);
        });
    });

    describe('.getEnumerator', () => {
        test('should return Array', () => {
            expect(instance.getEnumerator()).toBeInstanceOf(ArrayEnumerator);
        });

        test('should return Objectwise', () => {
            //@ts-ignore
            const innerInstance = new Dictionary({
                dictionary: {},
            });

            expect(innerInstance.getEnumerator()).toBeInstanceOf(ObjectEnumerator);
        });

        test('should return valid enumerator', () => {
            const enumerator = instance.getEnumerator();
            let index = 0;

            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(dict[index]);
                index++;
            }
            expect(index).toBe(dict.length);
        });

        test('should return localized enumerator', () => {
            //@ts-ignore
            const innerInstance = new Dictionary({
                dictionary: dict,
                localeDictionary: localeDict,
            });
            const enumerator = innerInstance.getEnumerator(true);
            let index = 0;

            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(localeDict[index]);
                index++;
            }
            expect(index).toBe(localeDict.length);
        });
    });

    describe('.each', () => {
        test('should return each value', () => {
            let count = 0;
            instance.each(function (item, index) {
                expect(index).toEqual(count);
                expect(item).toEqual(dict[count]);
                count++;
            });
            expect(count).toEqual(dict.length);
        });

        test('should return each localized value', () => {
            //@ts-ignore
            const innerInstance = new Dictionary({
                dictionary: dict,
                localeDictionary: localeDict,
            });
            let index = 0;

            innerInstance.each(
                //@ts-ignore
                function (item) {
                    expect(item).toBe(localeDict[index]);
                    index++;
                },
                innerInstance,
                true
            );
            expect(index).toBe(localeDict.length);
        });

        test('should skip null as index', () => {
            const dictionary = {
                0: 'one',
                1: 'two',
                null: 'null',
                2: 'three',
            };
            //@ts-ignore
            const innerInstance = new Dictionary({
                dictionary,
            });
            //@ts-ignore
            innerInstance.each(function (item, index) {
                expect(index).not.toBeNull();
                expect(dictionary.hasOwnProperty(index)).toBe(true);
            });
        });
    });

    describe('.isEqual()', () => {
        test('should return true for the same dictionary', () => {
            //@ts-ignore
            const same = new Dictionary({
                dictionary: getDict(),
            });
            expect(instance.isEqual(same)).toBe(true);
        });

        test('should return false for the different dictionary', () => {
            const dictionary = getDict();
            dictionary[0] = 'uno';
            //@ts-ignore
            const diff = new Dictionary({
                dictionary,
            });
            expect(instance.isEqual(diff)).toBe(false);
        });

        test('should return false for not a Dictionary', () => {
            //@ts-ignore
            expect(instance.isEqual()).toBe(false);
            expect(instance.isEqual(null)).toBe(false);
            expect(instance.isEqual(false)).toBe(false);
            expect(instance.isEqual(true)).toBe(false);
            expect(instance.isEqual(0)).toBe(false);
            expect(instance.isEqual(1)).toBe(false);
            expect(instance.isEqual({})).toBe(false);
            expect(instance.isEqual([])).toBe(false);
        });
    });
});
