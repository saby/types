import { Flags } from 'Types/collection';

interface IItem {
    name?: string;
    index?: number;
    value?: boolean;
}

describe('Types/_collection/Flags', () => {
    const getDict = () => {
        return ['one', 'two', 'three'];
    };
    const getLocaleDict = () => {
        return ['uno', 'dos', 'tres'];
    };
    const getValues = () => {
        return [true, false, null];
    };
    let dict: string[];
    let localeDict: string[];
    let values: (boolean | null)[];
    let testFlags: Flags<string>;
    let flagsInterval: Flags<string>;

    beforeEach(() => {
        dict = getDict();
        localeDict = getLocaleDict();
        values = getValues();
        testFlags = new Flags({
            dictionary: dict,
            values,
        });
        flagsInterval = new Flags({
            dictionary: { 1: 'one', 10: 'two', 16: 'three' },
            values: [true, false, null],
        });
    });

    describe('.constructor()', () => {
        test('should create Flags', () => {
            expect(testFlags).toBeInstanceOf(Flags);
        });
    });

    describe('.get()', () => {
        test('should return value for the each flag', () => {
            expect(testFlags.get('one')).toBe(true);
            expect(testFlags.get('two')).toBe(false);
            expect(testFlags.get('three')).toBeNull();
        });

        test('should return value for the each localized flag', () => {
            testFlags = new Flags({
                dictionary: dict,
                localeDictionary: localeDict,
                values,
            });

            expect(testFlags.get('uno', true)).toBe(true);
            expect(testFlags.get('dos', true)).toBe(false);
            expect(testFlags.get('tres', true)).toBeNull();
        });

        test('should return value for the each flag with intervals', () => {
            expect(flagsInterval.get('one')).toBe(true);
            expect(flagsInterval.get('two')).toBe(false);
            expect(flagsInterval.get('three')).toBeNull();
        });
    });

    describe('.getOriginal()', () => {
        test('should return original value for the each flag', () => {
            testFlags.set('one', false);
            testFlags.set('two', true);
            testFlags.set('three', true);

            expect(testFlags.getOriginal('one')).toBe(true);
            expect(testFlags.getOriginal('two')).toBe(false);
            expect(testFlags.getOriginal('three')).toBeNull();
        });

        test('should return original value for the each localized flag', () => {
            testFlags = new Flags({
                dictionary: dict,
                localeDictionary: localeDict,
                values,
            });
            testFlags.set('uno', false, true);
            testFlags.set('dos', true, true);
            testFlags.set('tres', true, true);

            expect(testFlags.getOriginal('uno', true)).toBe(true);
            expect(testFlags.getOriginal('dos', true)).toBe(false);
            expect(testFlags.getOriginal('tres', true)).toBeNull();
        });

        test('should return original value for the each flag with intervals', () => {
            flagsInterval.set('one', false);
            flagsInterval.set('two', true);
            flagsInterval.set('three', true);

            expect(flagsInterval.getOriginal('one')).toBe(true);
            expect(flagsInterval.getOriginal('two')).toBe(false);
            expect(flagsInterval.getOriginal('three')).toBeNull();
        });
    });

    describe('.set()', () => {
        test('should set the flag value', () => {
            testFlags.set('two', true);
            expect(testFlags.get('two')).toBe(true);
            expect(testFlags.getByIndex(1)).toBe(true);

            testFlags.set('two', null);
            expect(testFlags.get('two')).toBeNull();
            expect(testFlags.getByIndex(1)).toBeNull();
        });

        test('should set localized flag value', () => {
            testFlags = new Flags({
                dictionary: dict,
                localeDictionary: localeDict,
                values,
            });

            testFlags.set('dos', true, true);
            expect(testFlags.get('two')).toBe(true);
            expect(testFlags.getByIndex(1)).toBe(true);

            testFlags.set('dos', null, true);
            expect(testFlags.get('two')).toBeNull();
            expect(testFlags.getByIndex(1)).toBeNull();
        });

        test('should change the flags value with intervals', () => {
            flagsInterval.set('two', true);
            expect(flagsInterval.get('two')).toBe(true);
            expect(flagsInterval.getByIndex(10)).toBe(true);

            flagsInterval.set('two', null);
            expect(flagsInterval.get('two')).toBeNull();
            expect(flagsInterval.getByIndex(10)).toBeNull();
        });

        test('should throw an error for undefined value', () => {
            expect(() => {
                testFlags.set('dev', true);
            }).toThrow();
        });

        test('should trigger "onChange" if flag changed', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, name, index, value) {
                fired.name = name;
                fired.index = index;
                fired.value = value;
            };

            testFlags.subscribe('onChange', handler);
            testFlags.set('one', false);
            testFlags.unsubscribe('onChange', handler);

            expect(fired.name).toBe('one');
            expect(fired.index).toBe(0);
            expect(fired.value).toBe(false);
        });

        test('should trigger "onChange" if with valid index', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, name, index) {
                fired.name = name;
                fired.index = index;
            };

            flagsInterval.subscribe('onChange', handler);
            flagsInterval.set('two', true);
            flagsInterval.unsubscribe('onChange', handler);

            expect(fired.name).toBe('two');
            expect(fired.index).toBe('10');
        });

        test('should not trigger "onChange" if flag not changed', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, name, index, value) {
                fired.name = name;
                fired.index = index;
                fired.value = value;
            };

            testFlags.subscribe('onChange', handler);
            testFlags.set('one', true);
            testFlags.unsubscribe('onChange', handler);

            expect(fired.name).not.toBeDefined();
            expect(fired.index).not.toBeDefined();
            expect(fired.value).not.toBeDefined();
        });
    });

    describe('.getByIndex()', () => {
        test('should return flags value by index', () => {
            expect(testFlags.getByIndex(0)).toBe(true);
            expect(testFlags.getByIndex(1)).toBe(false);
            expect(testFlags.getByIndex(2)).toBeNull();
        });
    });

    describe('.getOriginalByIndex()', () => {
        test('should return original flags value by index', () => {
            testFlags.setByIndex(0, false);
            testFlags.setByIndex(1, true);
            testFlags.setByIndex(2, true);

            expect(testFlags.getOriginalByIndex(0)).toBe(true);
            expect(testFlags.getOriginalByIndex(1)).toBe(false);
            expect(testFlags.getOriginalByIndex(2)).toBeNull();
        });
    });

    describe('.setByIndex()', () => {
        test('should change the flags value by index', () => {
            testFlags.setByIndex(1, null);
            expect(testFlags.get('two')).toBeNull();
            expect(testFlags.getByIndex(1)).toBeNull();

            testFlags.setByIndex(2, true);
            expect(testFlags.get('three')).toBe(true);
            expect(testFlags.getByIndex(2)).toBe(true);
        });

        test('should throw an error for undefined index', () => {
            expect(() => {
                testFlags.setByIndex(400, true);
            }).toThrow();
        });

        test('should trigger "onChange" if flag changed', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, name, index, value) {
                fired.name = name;
                fired.index = index;
                fired.value = value;
            };

            testFlags.subscribe('onChange', handler);
            testFlags.setByIndex(0, false);
            testFlags.unsubscribe('onChange', handler);

            expect(fired.name).toBe('one');
            expect(fired.index).toBe(0);
            expect(fired.value).toBe(false);
        });

        test('should not trigger "onChange" if flag not changed', () => {
            const fired: IItem = {};
            //@ts-ignore
            const handler = function (e, name, index, value) {
                fired.name = name;
                fired.index = index;
                fired.value = value;
            };

            testFlags.subscribe('onChange', handler);
            testFlags.setByIndex(0, true);
            testFlags.unsubscribe('onChange', handler);

            expect(fired.name).not.toBeDefined();
            expect(fired.index).not.toBeDefined();
            expect(fired.value).not.toBeDefined();
        });
    });

    describe('.fromArray()', () => {
        test('should set all flags', () => {
            const flags = new Flags({
                dictionary: dict,
            });
            const expected = [null, false, true];

            flags.fromArray([null, false, true]);
            let index = 0;
            flags.each(function (name) {
                expect(flags.get(name)).toBe(expected[index]);
                index++;
            });
        });

        test('should set rest of the flags to null', () => {
            const flags = new Flags({
                dictionary: dict,
                values: [true, true, true],
            });
            const expected = [false, null, null];

            flags.fromArray([false]);
            let index = 0;
            flags.each(function (name) {
                expect(flags.get(name)).toBe(expected[index]);
                index++;
            });
        });
    });

    describe('.setFalseAll()', () => {
        test('should set false to all flags', () => {
            testFlags.setFalseAll();
            testFlags.each(function (name) {
                expect(testFlags.get(name)).toBe(false);
            });
        });

        test('should trigger "onChange"', () => {
            const fired: IItem[] = [];
            //@ts-ignore
            const handler = function (e, name, index, value) {
                fired.push({
                    name,
                    index,
                    value,
                });
            };

            testFlags.subscribe('onChange', handler);
            testFlags.setFalseAll();
            testFlags.unsubscribe('onChange', handler);

            expect(fired.length).toBe(2);

            expect(fired[0].name).toBe('one');
            expect(fired[0].index).toBe(0);
            expect(fired[0].value).toBe(false);

            expect(fired[1].name).toBe('three');
            expect(fired[1].index).toBe(2);
            expect(fired[1].value).toBe(false);
        });
    });

    describe('.setTrueAll()', () => {
        test('should set true to all flags', () => {
            testFlags.setTrueAll();
            testFlags.each(function (name) {
                expect(testFlags.get(name)).toBe(true);
            });
        });

        test('should set false to all flags with intervals', () => {
            flagsInterval.setFalseAll();
            flagsInterval.each(function (name) {
                expect(flagsInterval.get(name)).toBe(false);
            });
        });
    });

    describe('.setNullAll()', () => {
        test('should set null to all flags', () => {
            testFlags.setNullAll();
            testFlags.each(function (name) {
                expect(testFlags.get(name)).toBeNull();
            });
        });
    });

    describe(':produceInstance()', () => {
        test('should return instance of Flags', () => {
            expect(Flags.produceInstance()).toBeInstanceOf(Flags);
        });

        test('should return instance of Flags with dictionary returned by getDictionary()', () => {
            const options = {
                format: {
                    getDictionary: () => {
                        return ['foo'];
                    },
                },
            };
            //@ts-ignore
            const inst = Flags.produceInstance([true], options);

            expect(inst.get('foo')).toBe(true);
        });

        test('should return instance of Flags with dictionary returned by meta.dictionary', () => {
            const options = {
                format: {
                    meta: {
                        dictionary: ['foo'],
                    },
                },
            };
            //@ts-ignore
            const inst = Flags.produceInstance([true], options);

            expect(inst.get('foo')).toBe(true);
        });

        test('should return instance of Flags with localized dictionary returned by meta.localeDictionary', () => {
            const options = {
                format: {
                    meta: {
                        dictionary: ['foo'],
                        localeDictionary: ['bar'],
                    },
                },
            };
            //@ts-ignore
            const inst = Flags.produceInstance([true], options);

            expect(inst.get('foo')).toBe(true);
            expect(inst.get('bar', true)).toBe(true);
        });
    });

    describe('.isEqual()', () => {
        test('should return true for the same dictionary and values', () => {
            const e = new Flags({
                dictionary: dict,
                values,
            });
            expect(testFlags.isEqual(e)).toBe(true);
        });

        test('should return true for the equal dictionary and values', () => {
            const e = new Flags({
                dictionary: getDict(),
                values: getValues(),
            });
            expect(testFlags.isEqual(e)).toBe(true);
        });

        test('should return false for the different values', () => {
            const innerValues = getValues();
            innerValues[1] = null;
            const e = new Flags({
                dictionary: dict,
                values: innerValues,
            });
            expect(testFlags.isEqual(e)).toBe(false);
        });

        test('should return false for not an Flags', () => {
            //@ts-ignore
            expect(testFlags.isEqual()).toBe(false);
            expect(testFlags.isEqual(null)).toBe(false);
            expect(testFlags.isEqual(false)).toBe(false);
            expect(testFlags.isEqual(true)).toBe(false);
            expect(testFlags.isEqual(0)).toBe(false);
            expect(testFlags.isEqual(1)).toBe(false);
            expect(testFlags.isEqual({})).toBe(false);
            expect(testFlags.isEqual([])).toBe(false);
        });
    });

    describe('.toString()', () => {
        test('should return the default signature', () => {
            expect(testFlags.toString()).toEqual('[true,false,null]');
        });
        test('should return the default signature if Flags used as string', () => {
            expect(testFlags + '').toEqual('[true,false,null]');
        });
    });

    describe('.toJson()', () => {
        test('should serialize to json', () => {
            expect(() => {
                JSON.stringify(
                    new Flags({
                        dictionary: getDict(),
                        values: getValues(),
                    })
                );
            }).not.toThrow();
        });
    });

    describe('.clone()', () => {
        test('should clone value', () => {
            const clone = testFlags.clone();
            expect(clone).not.toEqual(testFlags);
            //@ts-ignore
            expect(clone.isEqual(testFlags)).toBe(true);
        });
    });

    describe('.acceptChanges', () => {
        test('should change state to "Changed" on value set', () => {
            const inst = new Flags({
                dictionary: getDict(),
                values: getValues(),
            });
            expect(inst.isChanged()).toBe(false);

            inst.set('one', false);

            expect(inst.isChanged()).toBe(true);
        });

        test('should reset "Changed" state to "Unchanged"', () => {
            const inst = new Flags({
                dictionary: getDict(),
                values: getValues(),
            });
            inst.set('one', false);
            inst.acceptChanges();
            expect(inst.isChanged()).toBe(false);
        });

        test('should keep values after acceptChanges', () => {
            const inst = new Flags({
                dictionary: getDict(),
                values: getValues(),
            });
            inst.set('one', false);
            inst.set('two', true);
            inst.set('three', false);

            inst.acceptChanges();

            expect(inst.get('one')).toBe(false);
            expect(inst.get('two')).toBe(true);
            expect(inst.get('three')).toBe(false);
        });
    });

    describe('.rejectChanges', () => {
        test('should reset "Changed" state to "Unchanged"', () => {
            const inst = new Flags({
                dictionary: getDict(),
                values: getValues(),
            });
            inst.set('one', false);
            inst.rejectChanges();
            expect(inst.isChanged()).toBe(false);
        });

        test('should should reset "Changed" state to "Unchanged after old value set', () => {
            const inst = new Flags({
                dictionary: getDict(),
                values: getValues(),
            });

            const oldValue = inst.get('one');
            inst.set('one', false);
            //@ts-ignore
            inst.set('one', oldValue);
            expect(inst.isChanged()).toBe(false);
        });

        test('should revert value after rejectChanges', () => {
            const inst = new Flags({
                dictionary: getDict(),
                values: getValues(),
            });
            inst.set('one', false);
            inst.set('two', true);
            inst.set('three', false);

            inst.rejectChanges();

            expect(inst.get('one')).toBe(true);
            expect(inst.get('two')).toBe(false);
            expect(inst.get('three')).toBeNull();
        });
    });
});
