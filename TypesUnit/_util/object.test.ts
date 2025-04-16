import {
    clone,
    clonePlain,
    getPropertyValue,
    setPropertyValue,
    extractValue,
    implantValue,
} from 'Types/_util/object';

describe('Types/_util/object', () => {
    describe('getPropertyValue()', () => {
        test('should return undefined for not an Object', () => {
            const foo = 'bar';
            expect(getPropertyValue(foo, 'foo')).not.toBeDefined();
        });

        test('should return native property value', () => {
            const obj = {
                foo: 'bar',
            };

            expect(getPropertyValue(obj, 'foo')).toEqual('bar');
        });

        test('should return property from IObject getter', () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                has(name: string): boolean {
                    return name === 'foo';
                },
                get(name: string): string {
                    //@ts-ignore
                    return name === 'foo' ? 'bar' : undefined;
                },
            };

            expect(getPropertyValue(obj, 'foo')).toEqual('bar');
        });

        test('should return property from name-like getter', () => {
            const obj = {
                getFoo(): string {
                    return 'bar';
                },
            };

            expect(getPropertyValue(obj, 'foo')).toEqual('bar');
        });
    });

    describe('setPropertyValue()', () => {
        test('should throw a TypeError for not an Object', () => {
            const foo = 'bar';

            expect(() => {
                setPropertyValue(foo, 'foo', undefined);
            }).toThrow();
        });

        test('should set native property value', () => {
            const obj = {
                foo: 'bar',
            };

            setPropertyValue(obj, 'foo', 'baz');
            expect(obj.foo).toEqual('baz');
        });

        test('should set property via IObject setter', () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                _foo: undefined,
                has(name: string): boolean {
                    return name === 'foo';
                },
                set(name: string, value: unknown): void {
                    //@ts-ignore
                    this['_' + name] = value;
                },
            };

            setPropertyValue(obj, 'foo', 'bar');
            expect(obj._foo).toEqual('bar');
        });

        test('should set property via name-like getter', () => {
            const obj = {
                _foo: undefined,
                setFoo(value: unknown): void {
                    //@ts-ignore
                    this._foo = value;
                },
            };

            setPropertyValue(obj, 'foo', 'bar');
            expect(obj._foo).toEqual('bar');
        });
    });

    describe('extractValue()', () => {
        test('should return initial object for empty path', () => {
            const obj = {};
            expect(extractValue(obj, [])).toBe(obj);
        });

        test('should return undefined for undefined', () => {
            expect(extractValue('', ['foo'])).not.toBeDefined();
        });

        test('should return property value if propery exists in Record-like object', () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                get(name: string): string {
                    return `[${name}]`;
                },
                has(): boolean {
                    return true;
                },
            };

            expect(extractValue(obj, ['foo'])).toEqual('[foo]');
        });

        test("should return undefined if propery doesn't exist in Record-like object", () => {
            const obj = {
                '[Types/_entity/IObject]': true,
                get(name: string): string {
                    return `[${name}]`;
                },
                has(): boolean {
                    return false;
                },
            };

            expect(extractValue(obj, ['foo'])).not.toBeDefined();
        });

        test('should return undefined for not exactly Record-like object', () => {
            const obj = {
                get(name: string): string {
                    return `[${name}]`;
                },
            };

            expect(extractValue(obj, ['foo'])).not.toBeDefined();
        });

        test('should return property value from object', () => {
            const obj = { foo: 'bar' };
            expect(extractValue(obj, ['foo'])).toEqual('bar');
        });

        test('should return property value deep from object', () => {
            const obj = { foo: { bar: 'baz' } };
            expect(extractValue(obj, ['foo', 'bar'])).toEqual('baz');
        });

        test('should deal with empty property values while going through', () => {
            expect(extractValue({ foo: undefined }, ['foo', 'bar'])).not.toBeDefined();
            expect(extractValue({ foo: null }, ['foo', 'bar'])).not.toBeDefined();
        });

        test('should return value of "_options" property if it is truthly', () => {
            const options = {};
            const obj = { _options: options };
            expect(extractValue(obj, ['_options'])).toBe(options);
        });

        test('should return owner of "_options" property if it is not truthly', () => {
            const options = null;
            const obj = { _options: options };
            expect(extractValue(obj, ['_options'])).toBe(obj);
        });

        test('should return undefiend for undefined object property', () => {
            const obj = {};
            expect(extractValue(obj, ['foo'])).not.toBeDefined();
        });

        test('should call onElementResolve for each found element in within path', () => {
            const story: Record<string, object | string>[] = [];
            const onElementHandler = (name: string, scope: object) => {
                return story.push({ name, scope });
            };

            const obj = { foo: { bar: 'baz' } };
            //@ts-ignore
            extractValue(obj, ['foo', 'bar'], onElementHandler);

            expect(story).toEqual([
                {
                    name: 'foo',
                    scope: obj,
                },
                {
                    name: 'bar',
                    scope: obj.foo,
                },
            ]);
        });
    });

    describe('implantValue()', () => {
        test('should return false for not an object', () => {
            expect(implantValue(null, [], 'foo')).toBe(false);
        });

        test('should set "undefined property" for empty path', () => {
            const obj = {};
            expect(implantValue(obj, [], 'foo')).toBe(true);
            expect(obj).toEqual({ undefined: 'foo' });
        });

        test('should keep initial object for not exists path', () => {
            const obj = {};
            expect(implantValue(obj, ['foo', 'bar'], 'baz')).toBe(false);
            expect(obj).toEqual({});
        });

        test('should add not exists property for exists path', () => {
            const obj = {};
            expect(implantValue(obj, ['foo'], 'bar')).toBe(true);
            expect(obj).toEqual({ foo: 'bar' });
        });

        test('should change exists property for exists path', () => {
            const obj = { foo: 1 };
            expect(implantValue(obj, ['foo'], 2)).toBe(true);
            expect(obj).toEqual({ foo: 2 });
        });

        test('should change exists property in deep', () => {
            const obj = { foo: { bar: { baz: null } } };
            expect(implantValue(obj, ['foo', 'bar', 'baz'], 'wow!')).toBe(true);
            expect(obj).toEqual({ foo: { bar: { baz: 'wow!' } } });
        });

        test('should change exists property in Record-like object', () => {
            let lastSet;
            const obj = {
                '[Types/_entity/IObject]': true,
                set(name: string, value: string): void {
                    lastSet = { name, value };
                },
            };
            expect(implantValue(obj, ['foo'], 'bar')).toBe(true);

            expect(lastSet).toEqual({ name: 'foo', value: 'bar' });
        });
    });

    describe('clone()', () => {
        test('should return passed value for not an Object', () => {
            expect(clone('foo')).toEqual('foo');
        });

        test('should clone plain Object', () => {
            const obj = {
                foo: 'bar',
                baz: 'vax',
            };

            //expect(clone(obj)).not.toStrictEqual(obj);
            expect(clone(obj)).toEqual(obj);
        });

        test('should clone using ICloneable method', () => {
            const obj = {
                '[Types/_entity/ICloneable]': true,
                clone(): unknown {
                    return [this];
                },
            };

            //@ts-ignore
            expect(clone(obj)[0]).toBe(obj);
        });
    });

    describe('clonePlain()', () => {
        test('should return passed value for not an Object', () => {
            expect(clonePlain('foo')).toEqual('foo');
        });

        test('should clone plain Object', () => {
            const obj = {
                foo: 'bar',
                baz: 'vax',
            };

            //expect(clonePlain(obj)).not.toStrictEqual(obj);
            expect(clonePlain(obj)).toEqual(obj);
        });

        test('should save the object key with undefined value by default', () => {
            const obj = { foo: undefined };
            const objClone = clonePlain(obj);

            expect(objClone.foo).not.toBeDefined();
            expect(objClone.hasOwnProperty('foo')).toBe(true);
        });

        test("shouldn't save the object key with undefined value if keepUndefined is false", () => {
            const obj = { foo: undefined };
            const objClone = clonePlain(obj, { keepUndefined: false });

            expect(objClone.hasOwnProperty('foo')).toBe(false);
        });

        test('should save the array entry with undefined value by default', () => {
            const obj = [0, undefined, 1];
            const objClone = clonePlain(obj);

            expect(objClone).toEqual([0, undefined, 1]);
        });

        test('should save the array entry with undefined value if keepUndefined is false', () => {
            const obj = [0, undefined, 1];
            const objClone = clonePlain(obj, { keepUndefined: false });

            expect(objClone).toEqual([0, undefined, 1]);
        });

        test('should call method clone() if object implements ICloneable by default', () => {
            let called = false;

            class Foo {
                ['[Types/_entity/ICloneable]']: boolean = true;
                clone(): void {
                    called = true;
                }
            }

            const obj = {
                foo: new Foo(),
            };

            clonePlain(obj);
            expect(called).toBe(true);
        });

        test("shouldn't call method clone() if object implements ICloneable if processCloneable is false", () => {
            let called = false;

            class Foo {
                ['[Types/_entity/ICloneable]']: boolean = true;
                clone(): void {
                    called = true;
                }
            }

            const obj = {
                foo: new Foo(),
            };

            clonePlain(obj, { processCloneable: false });
            expect(called).toBe(false);
        });

        test("shouldn't clone complicated Object", () => {
            class Foo {
                constructor() {}
            }

            const foo = new Foo();
            const obj = { foo };

            expect(clonePlain(obj).foo).toBe(foo);
        });

        test('should worl well with circular objects', () => {
            const objA = { foo: 'bar', b: undefined };
            const objB = { a: objA };

            //@ts-ignore
            objA.b = objB;

            const cloneA = clonePlain(objA);
            expect(cloneA.foo).toEqual('bar');
            expect(cloneA.b).toEqual(objB);
        });
    });
});
