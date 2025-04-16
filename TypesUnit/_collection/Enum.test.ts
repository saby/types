import { Enum } from 'Types/collection';

interface IItem {
    index?: number;
    value?: boolean;
}

describe('Types/_collection/Enum', () => {
    const getDict = () => {
        return ['one', 'two', 'three'];
    };
    const getLocaleDict = () => {
        return ['uno', 'dos', 'tres'];
    };
    let dict: string[];
    let localeDict: string[];
    let testEnum: Enum<string>;

    beforeEach(() => {
        dict = getDict();
        localeDict = getLocaleDict();
        testEnum = new Enum({
            dictionary: dict,
            index: 1,
        });
    });

    describe('.constructor()', () => {
        test('should create Enum', () => {
            expect(testEnum).toBeInstanceOf(Enum);
        });

        test('should translate index to Number', () => {
            expect(
                new Enum({
                    dictionary: dict,
                    index: '1',
                }).get()
            ).toBe(1);
        });
    });

    describe('.get()', () => {
        test('should return the default index', () => {
            expect(testEnum.get()).toEqual(1);
        });
    });

    describe('.getOriginal()', () => {
        test('should return the original index', () => {
            testEnum.set(0);
            expect(testEnum.getOriginal()).toEqual(1);
        });
    });

    describe('.set()', () => {
        test('should change current index', () => {
            testEnum.set(2);
            expect(testEnum.get()).toEqual(2);
            expect(testEnum.getAsValue()).toEqual('three');
        });

        test('should change current index to null', () => {
            testEnum.set(null);
            expect(testEnum.get()).toBe(null);
            expect(testEnum.getAsValue()).not.toBeDefined();
        });

        test('should translate index to Number', () => {
            testEnum.set('2');
            expect(testEnum.get()).toBe(2);
        });

        test('should translate index to Number even if dictonary has taken from object', () => {
            const inst = new Enum({
                dictionary: { 0: 'one', 1: 'two' },
            });

            inst.set('1');
            expect(inst.get()).toBe(1);
        });

        test('should throw an exception if index is out of range', () => {
            expect(() => {
                testEnum.set(569);
            }).toThrow();
        });

        test('should trigger "onChange" if value is changed', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, index, value) {
                fired.index = index;
                fired.value = value;
            };

            testEnum.subscribe('onChange', handler);

            testEnum.set(0);
            expect(fired.index).toBe(0);
            expect(fired.value).toBe('one');

            testEnum.unsubscribe('onChange', handler);
        });

        test('should trigger "onChange" if value is changed from null', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, index, value) {
                fired.index = index;
                fired.value = value;
            };

            testEnum.set(null);
            testEnum.subscribe('onChange', handler);

            testEnum.set(0);
            expect(fired.index).toBe(0);
            expect(fired.value).toBe('one');

            testEnum.unsubscribe('onChange', handler);
        });

        test('should trigger "onChange" if value is changed to null', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, index, value) {
                fired.index = index;
                fired.value = value;
            };

            testEnum.subscribe('onChange', handler);

            testEnum.set(null);
            expect(fired.index).toBe(null);
            expect(fired.value).toBe(undefined);

            testEnum.unsubscribe('onChange', handler);
        });

        test('should not trigger "onChange" if value is not changed', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, index, value) {
                fired.index = index;
                fired.value = value;
            };

            testEnum.subscribe('onChange', handler);

            testEnum.set(1);
            expect(fired.index).not.toBeDefined();
            expect(fired.value).not.toBeDefined();

            testEnum.unsubscribe('onChange', handler);
        });
    });

    describe('.getAsValue()', () => {
        test('should return the default value', () => {
            expect(testEnum.getAsValue()).toEqual('two');
        });

        test('should return original value', () => {
            expect(
                new Enum({
                    dictionary: dict,
                    localeDictionary: localeDict,
                    index: 1,
                }).getAsValue()
            ).toEqual('two');
        });

        test('should return localized value', () => {
            expect(
                new Enum({
                    dictionary: dict,
                    localeDictionary: localeDict,
                    index: 1,
                }).getAsValue(true)
            ).toEqual('dos');
        });
    });

    describe('.getOriginalAsValue()', () => {
        test('should return the original value', () => {
            testEnum.setByValue('one');
            expect(testEnum.getOriginalAsValue()).toEqual('two');
        });

        test('should return original localized value', () => {
            const inst = new Enum({
                dictionary: dict,
                localeDictionary: localeDict,
                index: 1,
            });

            inst.setByValue('uno', true);
            expect(inst.getOriginalAsValue(true)).toEqual('dos');
        });
    });

    describe('.setByValue()', () => {
        test('should set original value', () => {
            testEnum.setByValue('one');
            expect(testEnum.get()).toEqual(0);
            expect(testEnum.getAsValue()).toEqual('one');
        });

        test('should set localized value', () => {
            const inst = new Enum({
                dictionary: dict,
                localeDictionary: localeDict,
            });

            inst.setByValue('uno', true);
            expect(inst.getAsValue()).toEqual('one');
        });

        test('should translate index to Number even if dictonary has taken from object', () => {
            const inst = new Enum({
                dictionary: { 0: 'one', 1: 'two' },
            });

            inst.setByValue('two');
            expect(inst.get()).toBe(1);
        });

        test('should change current index to null', () => {
            //@ts-ignore
            testEnum.setByValue(null);
            expect(testEnum.get()).toBe(null);
            expect(testEnum.getAsValue()).not.toBeDefined();
        });

        test('should throw ReferenceError for not exists index', () => {
            expect(() => {
                testEnum.setByValue('doesntExistingValue');
            }).toThrow();

            expect(() => {
                testEnum.setByValue('doesntExistingValue', true);
            }).toThrow();
        });
    });

    describe('.produceInstance()', () => {
        test('should return instance of Enum', () => {
            expect(Enum.produceInstance()).toBeInstanceOf(Enum);
        });

        test('should return instance of Enum with dictionary returned by getDictionary()', () => {
            const options = {
                format: {
                    getDictionary: () => {
                        return ['foo'];
                    },
                },
            };
            //@ts-ignore
            const inst = Enum.produceInstance(0, options);

            expect(inst.getAsValue()).toBe('foo');
        });

        test('should return instance of Enum with dictionary returned by meta.dictionary', () => {
            const options = {
                format: {
                    meta: {
                        dictionary: ['foo'],
                    },
                },
            };
            //@ts-ignore
            const inst = Enum.produceInstance(0, options);

            expect(inst.getAsValue()).toBe('foo');
        });

        test('should return instance of Enum with localized dictionary returned by getLocaleDictionary()', () => {
            const options = {
                format: {
                    getDictionary: () => {
                        return ['foo'];
                    },
                    getLocaleDictionary: () => {
                        return ['bar'];
                    },
                },
            };
            //@ts-ignore
            const inst = Enum.produceInstance(0, options);

            expect(inst.getAsValue()).toBe('foo');
            expect(inst.getAsValue(true)).toBe('bar');
        });

        test('should return instance of Enum with localized dictionary returned by meta.localeDictionary', () => {
            const options = {
                format: {
                    meta: {
                        dictionary: ['foo'],
                        localeDictionary: ['bar'],
                    },
                },
            };
            //@ts-ignore
            const inst = Enum.produceInstance(0, options);

            expect(inst.getAsValue()).toBe('foo');
            expect(inst.getAsValue(true)).toBe('bar');
        });
    });

    describe('.isEqual()', () => {
        test('should return false for the different value', () => {
            const e = new Enum({
                dictionary: getDict(),
                index: 0,
            });
            expect(testEnum.isEqual(e)).toBe(false);
        });

        test('should return false for not an Enum', () => {
            //@ts-ignore
            expect(testEnum.isEqual()).toBe(false);
            //@ts-ignore
            expect(testEnum.isEqual(null)).toBe(false);
            //@ts-ignore
            expect(testEnum.isEqual(false)).toBe(false);
            //@ts-ignore
            expect(testEnum.isEqual(true)).toBe(false);
            //@ts-ignore
            expect(testEnum.isEqual(0)).toBe(false);
            //@ts-ignore
            expect(testEnum.isEqual(1)).toBe(false);
            expect(testEnum.isEqual({})).toBe(false);
            expect(testEnum.isEqual([])).toBe(false);
        });
    });

    describe('.valueOf()', () => {
        test('should return the current index', () => {
            //@ts-ignore
            expect(0 + testEnum).toEqual(1);
        });
    });

    describe('.toString()', () => {
        test('should return the current value', () => {
            expect(testEnum.toString()).toEqual('two');
        });

        test('should return the current value if Enum used as string', () => {
            //@ts-ignore
            expect(''.concat(testEnum)).toEqual('two');
        });

        test('should return empty string for null', () => {
            const inst = new Enum({
                dictionary: { null: null, 0: 'one' },
            });
            expect(inst.getAsValue()).toBeNull();
            expect(inst.toString()).toBe('');
        });

        test('should return empty string for undefined', () => {
            const inst = new Enum({
                dictionary: { 0: undefined, 1: 'foo' },
                index: 0,
            });
            expect(inst.getAsValue()).not.toBeDefined();
            expect(inst.toString()).toBe('');
        });
    });

    describe('.toJson()', () => {
        test('should serialize to json', () => {
            const inst = new Enum({
                dictionary: ['one', 'two'],
                index: 1,
            });
            expect(() => {
                JSON.stringify(inst);
            }).not.toThrow();
        });
    });

    describe('.clone()', () => {
        test('should clone value', () => {
            const clone = testEnum.clone();
            expect(clone).not.toEqual(testEnum);
            //@ts-ignore
            expect(clone.isEqual(testEnum)).toBe(true);
        });
    });

    describe('.acceptChanges', () => {
        test('should change state to "Changed" on value set', () => {
            const inst = new Enum({
                dictionary: ['one', 'two'],
                index: 1,
            });
            expect(inst.isChanged()).toBe(false);

            inst.set(0);

            expect(inst.isChanged()).toBe(true);
        });

        test('should reset "Changed" state to "Unchanged"', () => {
            const inst = new Enum({
                dictionary: ['one', 'two'],
                index: 1,
            });
            inst.set(0);
            inst.acceptChanges();
            expect(inst.isChanged()).toBe(false);
        });

        test('should keep values after acceptChanges', () => {
            const inst = new Enum({
                dictionary: ['one', 'two'],
                index: 1,
            });

            inst.set(0);

            inst.acceptChanges();

            expect(inst.getAsValue()).toBe('one');
        });
    });

    describe('.rejectChanges', () => {
        test('should reset "Changed" state to "Unchanged"', () => {
            const inst = new Enum({
                dictionary: ['one', 'two'],
                index: 1,
            });

            inst.set(0);
            inst.rejectChanges();
            expect(inst.isChanged()).toBe(false);
        });

        test('should reset "Changed" state to "Unchanged" after old value set', () => {
            const inst = new Enum({
                dictionary: ['one', 'two'],
                index: 1,
            });

            const oldIndex = inst.get();

            inst.set(0);
            inst.set(oldIndex);

            expect(inst.isChanged()).toBe(false);
        });

        test('should revert value after rejectChanges', () => {
            const inst = new Enum({
                dictionary: ['one', 'two'],
                index: 1,
            });
            inst.set(0);

            inst.rejectChanges();

            expect(inst.getAsValue()).toBe('two');
        });
    });
});
