import jsonReviver, { getReviverWithStorage, resolveInstances } from 'Types/_formatter/jsonReviver';
import { register, unregister } from 'Types/di';

class Serializeable {
    instanceId: number;
    constructor() {
        this.instanceId = Serializeable.instancesCount++;
    }
    toJSON(): object {
        return {
            $serialized$: 'inst',
            id: this.instanceId,
            module: 'Serializeable',
        };
    }
    static instancesCount: number = 0;
    static lastValue: unknown;
    static fromJSON<T>(value: T): Serializeable {
        Serializeable.lastValue = value;
        return new Serializeable();
    }
}

describe('Types/_formatter/jsonReviver', () => {
    describe('jsonReviver()', () => {
        test('should deserialize a date by default', () => {
            const date = new Date('1995-12-17T01:02:03');
            const dateStr = date.toJSON();
            const result = jsonReviver('', dateStr) as Date;
            expect(result).toBeInstanceOf(Date);
            expect(result.getTime()).toBe(date.getTime());
        });

        test('should deserialize Infinity', () => {
            const result = jsonReviver('i', jsonReviver('i', Infinity));
            expect(result).toBe(Infinity);
        });

        test('should deserialize -Infinity', () => {
            const result = jsonReviver('i', jsonReviver('i', -Infinity));
            expect(result).toBe(-Infinity);
        });

        test('should deserialize NaN', () => {
            const result = jsonReviver('n', jsonReviver('n', NaN));
            expect(result).toBeNaN();
        });

        test("should deserialize undefined if it's an array element", () => {
            const result = jsonReviver('n', jsonReviver('n', undefined));
            expect(result).toBe(undefined);
        });

        test('should deserialize foreign "func" signature', () => {
            const result = jsonReviver('', {
                $serialized$: 'func',
                module: 'Types/formatter',
                path: 'jsonReviver',
            });
            expect(result).toBe(jsonReviver);
        });

        test('should return unchanged', () => {
            expect(jsonReviver('a', undefined)).toBe(undefined);

            expect(jsonReviver('a', null)).toBe(null);

            expect(jsonReviver('a', 1)).toBe(1);

            expect(jsonReviver('a', 'b')).toBe('b');

            const arr: string[] = [];
            expect(jsonReviver('a', arr)).toBe(arr);

            const obj = {};
            expect(jsonReviver('a', obj)).toBe(obj);
        });

        describe('when used with JSON.parse() as jsonReviver', () => {
            test('should deserialize NaN using JSON.parse', () => {
                const serialized = '{"$serialized$": "NaN"}';
                const deserialized = JSON.parse(serialized, jsonReviver);
                expect(deserialized).toBeNaN();
            });

            test('should work properly with deep structures', () => {
                const given = JSON.parse(
                    `{
                        "a":{"$serialized$":"undef"},
                        "b":null,
                        "c":false,
                        "d":0,
                        "e":1,
                        "f":[],
                        "g":[
                            {"$serialized$":"undef"},
                            1,
                            2
                        ],
                        "h":{
                            "ha":{"$serialized$":"undef"},
                            "hb":{"$serialized$":"+inf"},
                            "hc":{"$serialized$":"-inf"}
                        },
                        "j":{"$serialized$":"NaN"}
                    }`,
                    jsonReviver
                );
                const expected = {
                    a: undefined,
                    b: null,
                    c: false,
                    d: 0,
                    e: 1,
                    f: [],
                    g: [undefined, 1, 2],
                    h: {
                        ha: undefined,
                        hb: Infinity,
                        hc: -Infinity,
                    },
                    j: NaN,
                };

                // 'undefined' is not serializable
                delete expected.a;
                delete expected.h.ha;

                // Chrome doesn't create 'undefined' items even though it has a reserved indices for them
                given.g[0] = undefined;

                //expect(expected).not.toEqual(given);
                expect(expected).toEqual(given);
            });

            test('should deserialize module registered with di', () => {
                register('Serializeable', Serializeable, {
                    instantiate: false,
                });

                const instance = new Serializeable();
                const serialized = JSON.stringify({ foo: instance });
                const deserialized = JSON.parse(serialized, jsonReviver);

                unregister('Serializeable');

                expect(deserialized.foo).toBeInstanceOf(Serializeable);
            });

            test('should throw an error if module is not registered with di', () => {
                const instance = new Serializeable();
                const serialized = JSON.stringify({ foo: instance });

                expect(() => {
                    JSON.parse(serialized, jsonReviver);
                }).toThrow();
            });

            test('should resolve links', () => {
                register('Serializeable', Serializeable, {
                    instantiate: false,
                });
                const result = JSON.parse(
                    `{
                        "foo": {"$serialized$": "inst", "id": 1, "module": "Serializeable"},
                        "deep": {
                            "bar": {"$serialized$": "link", "id": 1}
                        }
                    }`,
                    jsonReviver
                );
                unregister('Serializeable');

                expect(result.foo).toBeInstanceOf(Serializeable);
                expect(result.foo).toBe(result.deep.bar);
            });

            test('should pass serialized value to fromJSON method', () => {
                register('Serializeable', Serializeable, {
                    instantiate: false,
                });
                JSON.parse(
                    '{"foo": {"$serialized$": "inst", "id": 0, "module": "Serializeable", "bar": "baz"}}',
                    jsonReviver
                );
                unregister('Serializeable');

                expect(Serializeable.lastValue).toEqual({
                    $serialized$: 'inst',
                    id: 0,
                    module: 'Serializeable',
                    bar: 'baz',
                });
            });
        });
    });

    describe('getReviverWithStorage()', () => {
        test("shouldn't deserialize a date if resolveDates === false", () => {
            const date = new Date('1995-12-17T01:02:03');
            const dateStr = date.toJSON();
            const result = getReviverWithStorage<String>({
                resolveDates: false,
            })('', dateStr);
            expect(result).toBe(dateStr);
        });

        test('should restore function using storage', () => {
            const foo = () => {
                return null;
            };

            const storage: Map<number, Function> = new Map();
            storage.set(1, foo);

            const reviver = getReviverWithStorage<Function>(undefined, storage);
            const result = reviver('', {
                $serialized$: 'function',
                id: 1,
            });
            expect(result).toBe(foo);
        });
    });

    describe('resolveInstances()', () => {
        class Foo {
            static fromJSON(): Foo {
                return new Foo();
            }
        }

        class Bar {
            fromJSON(): Bar {
                return new Bar();
            }
        }

        beforeEach(() => {
            register('resolveInstances#Foo', Foo, { instantiate: false });
            register('resolveInstances#Bar', Bar, { instantiate: false });
        });

        afterEach(() => {
            unregister('resolveInstances#Foo');
            unregister('resolveInstances#Bar');
        });

        test('should create instance using static fromJSON method', () => {
            const instances = [
                {
                    scope: {},
                    name: 'foo',
                    value: {
                        $serialized$: 'inst',
                        id: 1,
                        module: 'resolveInstances#Foo',
                        state: {},
                    },
                },
            ];
            const storage = new Map<number, unknown>();

            resolveInstances(instances, storage);
            expect(storage.get(1)).toBeInstanceOf(Foo);
            expect(storage.get(1)).toBe(instances[0].value);
        });

        test('should create instance using dynamic fromJSON method', () => {
            const instances = [
                {
                    scope: {},
                    name: 'bar',
                    value: {
                        $serialized$: 'inst',
                        id: 2,
                        module: 'resolveInstances#Bar',
                        state: {},
                    },
                },
            ];
            const storage = new Map<number, unknown>();

            resolveInstances(instances, storage);
            expect(storage.get(2)).toBeInstanceOf(Bar);
            expect(storage.get(2)).toBe(instances[0].value);
        });
    });
});
