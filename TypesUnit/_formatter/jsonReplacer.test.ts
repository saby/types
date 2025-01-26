import jsonReplacer, {
    getReplacerWithStorage,
    ISignature,
    ISpecialSignature,
} from 'Types/_formatter/jsonReplacer';

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
}

class ComplexObject {}

describe('Types/_formatter/jsonReplacer', () => {
    describe('jsonReplacer()', () => {
        test('should serialize Infinity', () => {
            const result = jsonReplacer('i', Infinity) as ISignature;
            expect(result.$serialized$).toBe('+inf');
        });

        test('should serialize -Infinity', () => {
            const result = jsonReplacer('i', -Infinity) as ISignature;
            expect(result.$serialized$).toBe('-inf');
        });

        test('should serialize undefined', () => {
            const result = jsonReplacer('u', undefined) as ISignature;
            expect(result.$serialized$).toBe('undef');
        });

        test('should serialize NaN', () => {
            const result = jsonReplacer('n', NaN) as ISignature;
            expect(result.$serialized$).toBe('NaN');
        });

        test("should serialize undefined if it's an array element", () => {
            const result = jsonReplacer('n', undefined) as ISpecialSignature;
            expect(result.$serialized$).toBe('undef');
        });

        test('should serialize complex object as undefined', () => {
            const obj = new ComplexObject();
            const result = jsonReplacer('n', obj) as ISpecialSignature;
            expect(result).not.toBeDefined();
        });

        test('should return unchanged', () => {
            expect(jsonReplacer('a', null)).toBe(null);
            expect(jsonReplacer('a', 1)).toBe(1);
            expect(jsonReplacer('a', 'b')).toBe('b');

            const arr: string[] = [];
            expect(jsonReplacer('a', arr)).toBe(arr);

            const obj = {};
            expect(jsonReplacer('a', obj)).toBe(obj);
        });

        describe('when used with JSON.stringify() as jsonReplacer', () => {
            test('should work properly with deep structures', () => {
                const obj = {
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
                const result = JSON.parse(JSON.stringify(obj, jsonReplacer));

                expect(result).toEqual({
                    a: { $serialized$: 'undef' },
                    b: null,
                    c: false,
                    d: 0,
                    e: 1,
                    f: [],
                    g: [{ $serialized$: 'undef' }, 1, 2],
                    h: {
                        ha: { $serialized$: 'undef' },
                        hb: { $serialized$: '+inf' },
                        hc: { $serialized$: '-inf' },
                    },
                    j: { $serialized$: 'NaN' },
                });
            });

            test('should create link to the origin', () => {
                const foo = new Serializeable();
                const obj = {
                    foo,
                    deep: {
                        foo,
                    },
                };
                const result = JSON.parse(JSON.stringify(obj, jsonReplacer));

                expect(result).toEqual({
                    foo: {
                        $serialized$: 'inst',
                        id: 0,
                        module: 'Serializeable',
                    },
                    deep: {
                        foo: { $serialized$: 'link', id: 0 },
                    },
                });
            });
        });
    });

    describe('getReplacerWithStorage()', () => {
        test('should serialize function if storage is passed', () => {
            const foo = () => {
                return null;
            };
            const replacer = getReplacerWithStorage(new Map());
            const result = replacer('', foo) as ISpecialSignature;
            expect(result.$serialized$).toBe('function');
            expect(result.id).toBe(0);
        });

        test('should fill in functions storage', () => {
            const foo = () => {
                return null;
            };
            const storage: Map<number, Function> = new Map();
            const replacer = getReplacerWithStorage(storage);
            replacer('', foo);
            expect(storage.get(0)).toBe(foo);
        });
    });
});
