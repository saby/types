/* eslint-disable max-classes-per-file */
import Model, { IProperty } from 'Types/_entity/Model';
import Compute from 'Types/_entity/functor/Compute';
import Track from 'Types/_entity/functor/Track';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import { RecordSet } from 'Types/collection';
import { IHashMap } from 'Types/_declarations';

interface IData {
    max: number;
    calc: number;
    calcRead: number;
    calcWrite: number;
    title: string;
    id: number;
}

interface IProperties extends IHashMap<IProperty> {
    calc: IProperty;
    calcRead: IProperty;
    calcWrite: IProperty;
    title: IProperty;
    sqMax: IProperty;
    internal: IProperty;
    date: IProperty;
}

interface IFooModel extends Model {
    _foo: string;
}

interface IBarModel extends Model {
    _bar: string;
}

function getModelData(): IData {
    return {
        max: 10,
        calc: 5,
        calcRead: 5,
        calcWrite: 5,
        title: 'A',
        id: 1,
    };
}

function getModelProperties(sqMaxVal: number = 33): IProperties {
    interface ITesteeModel extends Model {
        _internal: string;
    }

    return {
        calc: {
            def: 1,
            //@ts-ignore
            get: (value) => {
                return 10 * value;
            },
            //@ts-ignore
            set: (value) => {
                return value / 10;
            },
        },
        calcRead: {
            def: 2,
            //@ts-ignore
            get: (value) => {
                return 10 * value;
            },
        },
        calcWrite: {
            def: 3,
            //@ts-ignore
            set: (value) => {
                return value / 10;
            },
        },
        title: {
            def: 4,
            //@ts-ignore
            get: (value) => {
                return value + ' B';
            },
        },
        sqMax: {
            def: () => {
                return sqMaxVal++;
            },
            //@ts-ignore
            get(): number {
                return this.get('max') * this.get('max');
            },
        },
        internal: {
            //@ts-ignore
            get(this: ITesteeModel): string {
                return this.hasOwnProperty('_internal') ? this._internal : 'internalDefault';
            },
            //@ts-ignore
            set(this: ITesteeModel, value: string): void {
                this._internal = value;
            },
        },
        date: {
            //@ts-ignore
            get: () => {
                return new Date();
            },
        },
    };
}

function getModel(modelData?: IData, modelProperties?: IProperties): Model {
    return new Model({
        keyProperty: 'id',
        rawData: modelData || getModelData(),
        properties: modelProperties || getModelProperties(),
    });
}

describe('Types/_entity/Model', () => {
    let model: Model;
    let modelData: IData;
    let modelProperties: IProperties;

    beforeEach(() => {
        modelData = getModelData();
        modelProperties = getModelProperties();
        model = getModel(modelData, modelProperties);
    });

    describe('.constructor', () => {
        test('should set instance state via constructor', () => {
            const model = new Model({
                instanceState: {
                    _foo: 'bar',
                },
                properties: {
                    foo: {
                        //@ts-ignore
                        get(this: IFooModel): string {
                            return this._foo;
                        },
                    },
                },
            });

            expect(model.get('foo')).toEqual('bar');
        });
    });

    describe('.get()', () => {
        test('should return a data value', () => {
            expect(model.get('max')).toBe(modelData.max);
            expect(model.get('id')).toBe(modelData.id);
        });

        test('should return a calculated value', () => {
            expect(model.get('calc')).toBe(modelData.calc * 10);
            expect(model.get('calcRead')).toBe(modelData.calc * 10);
            expect(model.get('calcWrite')).toBe(modelData.calc);
            expect(model.get('title')).toBe('A B');
            expect(model.get('sqMax')).toBe(modelData.max * modelData.max);
        });

        test('should return the property value', () => {
            expect(model.get('internal')).toBe('internalDefault');
        });

        test('should return cached property value', () => {
            const values = [1, 2, 3];
            const model = new Model({
                cacheMode: (Model as any).CACHE_MODE_ALL,
                properties: {
                    foo: {
                        //@ts-ignore
                        get: () => {
                            return values.pop();
                        },
                    },
                },
            });

            expect(model.get('foo')).toBe(3);
            expect(values.length).toBe(2);
            expect(model.get('foo')).toBe(3);
            expect(values.length).toBe(2);
        });

        test('should return a single instance for Object', () => {
            const value = model.get('date');
            expect(value).toBeInstanceOf(Date);
            expect(model.get('date')).toBe(value);
            expect(model.get('date')).toBe(value);
        });

        test('should prevent caching for overridden property', () => {
            const model = new Model({
                rawData: {
                    test: { a: 1 },
                },
                properties: {
                    test: {
                        //@ts-ignore
                        get: () => {
                            return 2;
                        },
                    },
                },
            });
            expect(model.get('test')).toBe(2);
            expect(model.get('test')).toBe(2);
        });

        test('should return cached value inside a getter and then able to reset it', () => {
            let cached;
            const model = new Model({
                rawData: {
                    foo: { bar: 'bar' },
                },
                properties: {
                    foo: {
                        //@ts-ignore
                        get(value: string): string {
                            cached = this.get('foo');
                            return value;
                        },
                        //@ts-ignore
                        set: (value) => {
                            return value;
                        },
                    },
                },
            });

            const foo = model.get('foo');
            expect(foo.bar).toBe('bar');
            //@ts-ignore
            expect(cached.bar).toBe('bar');

            model.set('foo', { baz: 'baz' });
            expect(model.get('foo').baz).toBe('baz');
        });

        test('should use recordset format for the property initial value', () => {
            class SubModel extends Model {
                //@ts-ignore
                protected _$properties = {
                    id: {
                        //@ts-ignore
                        get: (value) => {
                            return value.toDateString();
                        },
                    },
                };
            }
            const date = new Date();
            const rs = new RecordSet({
                model: SubModel,
                format: [{ name: 'id', type: 'datetime' }],
            });
            const model = new Model({
                rawData: {
                    id: date.getTime(),
                },
            });

            rs.add(model);
            expect(rs.at(0).get('id')).toBe(date.toDateString());
        });

        test('should use recordset format for not a property', () => {
            const rs = new RecordSet({
                format: [{ name: 'id', type: 'datetime' }],
            });
            const model = new Model({
                rawData: {
                    id: 1,
                },
            });
            rs.add(model);
            expect(rs.at(0).get('id')).toBeInstanceOf(Date);
        });

        test('should return raw value instead of property default value', () => {
            const model = new Model({
                properties: {
                    id: {
                        def: 0,
                    },
                },
                rawData: {
                    id: 1,
                },
            });
            expect(model.get('id')).toEqual(1);
        });
    });

    describe('.set()', () => {
        test('should set a writable property', () => {
            model.set('calc', 50);
            expect(model.get('calc')).toBe(50);
            expect(model.getRawData().calc).toBe(5);

            model.set('calc', 70);
            expect(model.get('calc')).toBe(70);
            expect(model.getRawData().calc).toBe(7);

            model.set('calcWrite', 50);
            expect(model.get('calcWrite')).toBe(5);
            expect(model.getRawData().calcWrite).toBe(5);

            model.set('calcWrite', 70);
            expect(model.get('calcWrite')).toBe(7);
            expect(model.getRawData().calcWrite).toBe(7);
        });

        test('should trigger "onPropertyChange" for tracking properties', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    foo: {
                        get(): string {
                            return this._foo;
                        },
                        //@ts-ignore
                        set: Track.create(function (value: string): void {
                            this._foo = value;
                        }),
                    },
                } as IHashMap<IProperty<IFooModel>>,
            });

            let changed;
            //@ts-ignore
            const handler = (event, props) => {
                changed = props;
            };

            model.subscribe('onPropertyChange', handler);
            model.set('foo', 'bar');
            model.unsubscribe('onPropertyChange', handler);

            expect(changed).toEqual({
                foo: 'bar',
            });
        });

        test('should trigger only one event "onPropertyChange" if some propperty calls set() inside itself', () => {
            const model = new Model({
                rawData: {
                    foo: 'one',
                    bar: 'two',
                },
                properties: {
                    moreFoo: {
                        //@ts-ignore
                        get: (value) => {
                            return value;
                        },
                        //@ts-ignore
                        set(value: string): string {
                            const realValue = '{' + value + '}';
                            this.set('bar', '[' + value + ']');
                            this.set('foo', value);
                            return realValue;
                        },
                    },
                },
            });

            let changed;
            //@ts-ignore
            const handler = (event, props) => {
                changed = props;
            };

            model.subscribe('onPropertyChange', handler);
            model.set('moreFoo', 'three');
            model.unsubscribe('onPropertyChange', handler);

            expect(changed).toEqual({
                foo: 'three',
                bar: '[three]',
                moreFoo: '{three}',
            });
        });

        test('should write and read updated cached value inside set', () => {
            let updatedValue;
            const model = new Model({
                rawData: {
                    foo: [1],
                },
                properties: {
                    bar: {
                        //@ts-ignore
                        set(value: string): void {
                            this.set('foo', [value]);
                            updatedValue = this.get('foo');
                        },
                    },
                },
            });

            model.set('bar', 2);

            expect(updatedValue).toEqual([2]);
            expect(model.get('foo')).toEqual([2]);
        });

        test("shouldn't change cached field value taken from format if model has any properties", () => {
            const model = new Model({
                format: {
                    foo: Model,
                } as any,
                rawData: {
                    foo: { bar: 1 },
                },
                properties: {},
            });
            const foo = model.get('foo');
            model.set('foo', foo);

            expect(model.isChanged('foo')).toBe(false);
        });

        test('should throw an Error for read only property', () => {
            expect(() => {
                model.set('calcRead', 100);
            }).toThrow();
            expect(model.get('calcRead')).toBe(50);
            expect(model.getRawData().calcRead).toBe(5);

            expect(() => {
                model.set('calcRead', 70);
            }).toThrow();
            expect(model.get('calcRead')).toBe(50);
            expect(model.getRawData().calcRead).toBe(5);

            expect(() => {
                model.set('title', 'test');
            }).toThrow();
            expect(model.get('title')).toBe('A B');
            expect(model.getRawData().title).toBe('A');
        });

        test('should attempt to set every property if someone throws an Error', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    foo: {
                        get: () => {
                            return 'ro';
                        },
                        set: () => {
                            throw new Error('oops!');
                        },
                    },
                    bar: {
                        get(): string {
                            return this._bar;
                        },
                        set(value: string): void {
                            this._bar = value;
                        },
                    },
                } as IHashMap<IProperty<IBarModel>>,
            });
            expect(() => {
                model.set({
                    foo: 'one',
                    bar: 'two',
                });
            }).toThrow();
            expect(model.get('foo')).toBe('ro');
            expect(model.get('bar')).toBe('two');
        });

        test('should attempt to set every property if several throw an Error', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    foo: {
                        get: () => {
                            return 'foo';
                        },
                        set: () => {
                            throw new Error('oops foo!');
                        },
                    },
                    bar: {
                        get(): string {
                            return this._bar;
                        },
                        set(value: string): void {
                            this._bar = value;
                        },
                    },
                    baz: {
                        get: () => {
                            return 'baz';
                        },
                        set: () => {
                            throw new Error('oops baz!');
                        },
                    },
                } as IHashMap<IProperty<IBarModel>>,
            });

            expect(() => {
                model.set({
                    foo: 'one',
                    bar: 'two',
                    baz: 'three',
                });
            }).toThrow();

            expect(model.get('foo')).toBe('foo');
            expect(model.get('bar')).toBe('two');
            expect(model.get('baz')).toBe('baz');
        });

        test('should don\'t throw an Error for property with only "def"', () => {
            const model = new Model({
                properties: {
                    test: {
                        //@ts-ignore
                        def: null,
                    },
                },
            });
            expect(model.get('test')).toBe(null);
            model.set('test', 'new');
            expect(model.get('test')).toBe('new');
        });

        test('should set the rawData value', () => {
            model.set('max', 13);
            expect(model.get('max')).toBe(13);
            expect(model.getRawData().max).toBe(13);

            model.set('internal', 'testInternal');
            expect(model.get('internal')).toBe('testInternal');
            expect(model.getRawData().internal).not.toBeDefined();
        });

        test('should set inverted rawData value', () => {
            const model = new Model({
                rawData: {
                    foo: false,
                },
                properties: {
                    foo: {
                        //@ts-ignore
                        get: (value) => {
                            return !value;
                        },
                        //@ts-ignore
                        set: (value) => {
                            return !value;
                        },
                    },
                },
            });

            expect(model.get('foo')).toBe(true);

            let fromEvent;
            //@ts-ignore
            model.subscribe('onPropertyChange', (event, map) => {
                fromEvent = map.foo;
            });

            model.set('foo', false);
            expect(model.get('foo')).toBe(false);
            expect(model.getRawData().foo).toBe(true);
            expect(fromEvent).toBe(false);

            fromEvent = undefined;
            model.set('foo', true);
            expect(model.get('foo')).toBe(true);
            expect(model.getRawData().foo).toBe(false);
            expect(fromEvent).toBe(true);
        });

        test('should work well in case of getter exception', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    p1: {
                        get: () => {
                            throw new Error('Something went wrong');
                        },
                        set(value: string): void {
                            this._p1 = value;
                        },
                    },
                } as IHashMap<
                    IProperty<
                        Model & {
                            _p1: string;
                        }
                    >
                >,
            });

            // Get twice checks valid state
            expect(() => {
                model.get('p1');
            }).toThrow();
            expect(() => {
                model.get('p1');
            }).toThrow();

            model.set('p1', 'v1');
        });

        test('should set values', () => {
            model.set({
                calc: 50,
                calcWrite: 50,
                id: 'test',
            });
            expect(model.get('calc')).toBe(50);
            expect(model.get('calcWrite')).toBe(5);
            expect(model.get('id')).toBe('test');
        });

        test('should set values with exception', () => {
            expect(() => {
                model.set({
                    calc: 50,
                    calcRead: 100,
                    calcWrite: 50,
                    id: 'test',
                });
            }).toThrow();
            expect(model.get('calc')).toBe(50);
            expect(model.get('calcRead')).toBe(50);
            expect(model.get('calcWrite')).toBe(5);
            expect(model.get('id')).toBe('test');
        });

        test('should set value when property define only default value ', () => {
            const model = new Model({
                properties: {
                    id: {
                        def: 0,
                    },
                },
                rawData: {
                    id: 1,
                },
            });
            model.set('id', 2);
            expect(model.get('id')).toEqual(2);
        });

        test('should work well on property value convert', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    id: {
                        get(): string {
                            return this._id;
                        },
                        set(value: string): void {
                            this._id = value.toString();
                        },
                    },
                } as IHashMap<
                    IProperty<
                        Model & {
                            _id: string;
                        }
                    >
                >,
            });

            model.set('id', [1, 2, 3]);
            expect(model.get('id')).toEqual('1,2,3');
        });

        test('should reset cached property value if related raw field has been changed', () => {
            const model = new Model({
                rawData: {
                    foo: 1,
                },
                properties: {
                    bar: {
                        //@ts-ignore
                        get(): string {
                            return this.get('foo');
                        },
                    },
                },
            });

            expect(model.get('bar')).toBe(1);

            model.set('foo', 2);
            expect(model.get('bar')).toBe(2);
        });

        test('should reset cached property value if related property has been changed', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    foo: {
                        get(): string | number {
                            return this._foo === undefined ? 1 : this._foo;
                        },
                        set(value: string): string {
                            return (this._foo = value);
                        },
                    },
                    bar: {
                        get(): string {
                            return this.get('foo');
                        },
                    },
                } as IHashMap<IProperty<IFooModel>>,
            });

            expect(model.get('bar')).toBe(1);

            model.set('foo', 2);
            expect(model.get('bar')).toBe(2);
        });

        test('should reset changed flag for modified by link property on related property change', () => {
            const model = new Model({
                rawData: {
                    foo: '1',
                },
                properties: {
                    bar: {
                        //@ts-ignore
                        get(): Model {
                            return new Model({
                                rawData: {
                                    foo: this.get('foo'),
                                },
                            });
                        },
                    },
                },
            });

            const bar = model.get('bar');
            bar.set('foo', 2);
            expect(model.isChanged('bar')).toBe(true);
            model.set('foo', 3);
            expect(model.isChanged('bar')).toBe(false);
        });

        describe('if has properties defined dependency', () => {
            test('should reset related property', () => {
                const model = new Model({
                    //@ts-ignore
                    properties: {
                        foo: {
                            get: Compute.create(
                                //@ts-ignore
                                function (): string[] {
                                    const bar = this.get('bar');
                                    return ['foo'].concat(bar);
                                },
                                ['bar']
                            ),
                        },
                        bar: {
                            get(): string[] {
                                return this._bar || ['bar'];
                            },
                            set(value: string): void {
                                this._bar = [value];
                            },
                        },
                    } as IHashMap<
                        IProperty<
                            Model & {
                                _bar: string[];
                            }
                        >
                    >,
                });

                const fooA = model.get('foo');
                expect(fooA).toEqual(['foo', 'bar']);

                model.set('bar', 'baz');
                const fooB = model.get('foo');
                expect(fooB).toEqual(['foo', 'baz']);

                const fooC = model.get('foo');
                model.set('moo', 'shmoo');
                expect(model.get('foo')).toBe(fooC);
            });

            test("should don't reset unrelated property", () => {
                const model = new Model({
                    //@ts-ignore
                    properties: {
                        foo: {
                            //@ts-ignore
                            get: Compute.create(function (): string[] {
                                const bar = this.get('bar');
                                return ['foo'].concat(bar);
                            }, []),
                        },
                        bar: {
                            get(): string[] {
                                return this._bar || ['bar'];
                            },
                            set(value: string): void {
                                this._bar = [value];
                            },
                        },
                    } as IHashMap<
                        IProperty<
                            Model & {
                                _bar: string[];
                            }
                        >
                    >,
                });

                const fooA = model.get('foo');
                expect(fooA).toEqual(['foo', 'bar']);

                const fooB = model.get('foo');
                model.set('bar', 'baz');
                expect(model.get('foo')).toBe(fooB);
                expect(model.get('foo')).toEqual(['foo', 'bar']);
            });

            test("should reset deep related property and dont't resut unrelated", () => {
                const model = new Model({
                    properties: {
                        foo: {
                            get: Compute.create(
                                //@ts-ignore
                                function (): string[] {
                                    const bar = this.get('bar');
                                    return ['foo'].concat([bar.get('a'), bar.get('b')]);
                                },
                                ['bar.a']
                            ),
                        },
                        bar: {
                            //@ts-ignore
                            get: () => {
                                return new Model({
                                    rawData: {
                                        a: 1,
                                        b: 2,
                                    },
                                });
                            },
                        },
                    },
                });

                const bar = model.get('bar');
                expect(model.get('foo')).toEqual(['foo', 1, 2]);

                const fooA = model.get('foo');
                bar.set('a', 10);
                expect(model.get('foo')).not.toEqual(fooA);
                expect(model.get('foo')).toEqual(['foo', 10, 2]);

                const fooB = model.get('foo');
                bar.set('b', 20);
                expect(model.get('foo')).toBe(fooB);
                expect(model.get('foo')).toEqual(['foo', 10, 2]);
            });
        });

        describe('if has properties calculated dependency', () => {
            class MyModel extends Model {
                //@ts-ignore
                protected _$properties = {
                    p1: {
                        get(): object {
                            return {
                                //@ts-ignore
                                p2: this.get('p2'),
                                //@ts-ignore
                                p3: this.get('p3'),
                            };
                        },
                    },
                    p3: {
                        get(): object {
                            return {
                                //@ts-ignore
                                p4: this.get('p4'),
                                //@ts-ignore
                                p5: this.get('p5'),
                            };
                        },
                    },
                };
            }

            const getMyModel = () => {
                return new MyModel({
                    rawData: {
                        p2: 'v2',
                        p4: 'v4',
                        p5: 'v5',
                    },
                });
            };

            test('should reset the value on direct dependency', () => {
                const model = getMyModel();
                const v3old = model.get('p3');
                model.set('p4', 'v4new');
                const v3new = model.get('p3');
                expect(v3old).not.toEqual(v3new);
                expect(v3old.p4).toEqual('v4');
                expect(v3new.p4).toEqual('v4new');
            });

            test('should reset the value on indirect dependency', () => {
                const model = getMyModel();
                const v1old = model.get('p1');
                model.set('p5', 'v5new');
                const v1new = model.get('p1');
                expect(v1old).not.toEqual(v1new);
                expect(v1old.p3.p5).toEqual('v5');
                expect(v1new.p3.p5).toEqual('v5new');
            });

            test('should leave the independent value', () => {
                const model = getMyModel();
                const v3old = model.get('p3');
                model.set('p2', 'v2new');
                const v3new = model.get('p3');
                expect(v3old).toBe(v3new);
            });

            test('should reset the value if dependency cached', () => {
                class MyModel extends Model {
                    //@ts-ignore
                    protected _$properties = {
                        a: {
                            get(): string[] {
                                //@ts-ignore
                                return ['a'].concat(this.get('b'));
                            },
                        },
                        b: {
                            get(): string[] {
                                return ['b'];
                            },
                            set(): void {
                                // Do nothing
                            },
                        },
                    };
                }

                const model = new MyModel();
                const oldB = model.get('b');
                const oldA = model.get('a');

                model.set('b', ['b1']);
                const newB = model.get('b');
                const newA = model.get('a');

                expect(oldB !== newB).toBeTruthy();
                expect(oldA !== newA).toBeTruthy();
            });

            test('should stay inner index length stable on several calls', () => {
                const model = getMyModel();
                model.get('p3');
                model.get('p3');
                //@ts-ignore
                expect(model._propertiesDependency.get('p4').size).toEqual(1);
                //@ts-ignore
                expect(model._propertiesDependency.get('p5').size).toEqual(1);
            });
        });

        describe("if adapter doesn't support dynamic properties define", () => {
            const getData = () => {
                return {
                    d: [1, '2'],
                    s: [{ n: 'a' }, { n: 'b' }],
                };
            };

            test('should throw an error', () => {
                const model = new Model({
                    rawData: getData(),
                    adapter: new SbisAdapter(),
                });
                expect(() => {
                    model.set('c', 50);
                }).toThrow();
            });

            test("should don't throw an error if user defined property has setter without a result", () => {
                const model = new Model({
                    rawData: getData(),
                    adapter: new SbisAdapter(),
                    properties: {
                        c: {
                            //@ts-ignore
                            set: () => {
                                /**/
                            },
                        },
                    },
                });
                model.set('c', 50);
            });

            test('should throw an error if user defined property has setter with a result', () => {
                const model = new Model({
                    rawData: getData(),
                    adapter: new SbisAdapter(),
                    properties: {
                        c: {
                            //@ts-ignore
                            set: (value) => {
                                return value;
                            },
                        },
                    },
                });
                expect(() => {
                    model.set('c', 50);
                }).toThrow();
            });
        });
    });

    describe('.has()', () => {
        test('should return true for defined field', () => {
            for (const key in modelData) {
                if (modelData.hasOwnProperty(key)) {
                    expect(model.has(key)).toBe(true);
                }
            }
        });

        test('should return true for defined property', () => {
            for (const key in modelProperties) {
                if (modelProperties.hasOwnProperty(key)) {
                    expect(model.has(key)).toBe(true);
                }
            }
        });

        test('should return false for undefined property', () => {
            expect(model.has('blah')).toBe(false);
        });
    });

    describe('.getDefault()', () => {
        test('should return undefined for undefined property', () => {
            expect(model.getDefault('max')).toBe(undefined);
        });

        test('should return defined value', () => {
            expect(model.getDefault('calc')).toBe(1);
            expect(model.getDefault('calcRead')).toBe(2);
            expect(model.getDefault('calcWrite')).toBe(3);
            expect(model.getDefault('title')).toBe(4);
        });

        test('should return function result and exec this function once', () => {
            expect(model.getDefault('sqMax')).toBe(33);
            expect(model.getDefault('sqMax')).toBe(33);
        });
    });

    describe('.each()', () => {
        test('should return equivalent values', () => {
            model.each((name, value) => {
                if (modelProperties[name] && modelProperties[name].get) {
                    expect(model.get(name)).toBe(value);
                } else {
                    //@ts-ignore
                    expect(modelData[name]).toBe(value);
                }
            });
        });

        test('should traverse all properties in given order', () => {
            const allProps = Object.keys(modelProperties);
            for (const key in modelData) {
                if (modelData.hasOwnProperty(key) && allProps.indexOf(key) === -1) {
                    allProps.push(key);
                }
            }
            let count = 0;
            model.each((name) => {
                expect(name).toBe(allProps[count]);
                count++;
            });
            expect(allProps.length).toBe(count);
        });
    });

    describe('.getProperties()', () => {
        test('should return a model properties', () => {
            expect(model.getProperties()).toEqual(modelProperties);
        });
    });

    describe('.getKey()', () => {
        test('should return key', () => {
            expect(model.getKey()).toBe(modelData.id);
        });

        test('should detect keyProperty automatically', () => {
            const data = {
                d: [1, 'a', 'test'],
                s: [{ n: 'Num' }, { n: '@Key' }, { n: 'Name' }],
            };
            const model = new Model({
                rawData: data,
                adapter: new SbisAdapter(),
            });
            expect(model.getKeyProperty()).toBe('@Key');
            expect(model.getKey()).toBe(data.d[1]);
        });

        test('should return undefined for empty key property', () => {
            const newModel = new Model({
                rawData: modelData,
            });
            expect(newModel.getKey()).not.toBeDefined();
        });
    });

    describe('.getKeyProperty()', () => {
        test('should return id property', () => {
            expect(model.getKeyProperty()).toBe('id');
        });
    });

    describe('.setKeyProperty()', () => {
        test('should set id property', () => {
            const newModel = new Model({
                rawData: modelData,
            });
            newModel.setKeyProperty('id');
            expect(newModel.getKey()).toBe(modelData.id);
        });
    });

    describe('.clone()', () => {
        test('should clone properties definition', () => {
            const clone = model.clone();
            expect(model.getProperties() !== clone.getProperties()).toBeTruthy();
            expect(model.getProperties()).toEqual(clone.getProperties());
        });

        test('should have another instance id', () => {
            const id = model.getInstanceId();
            const clone = model.clone();
            expect(clone.getInstanceId()).not.toEqual(id);
        });

        test('should clone id property', () => {
            const clone = model.clone();
            expect(model.getKey()).toBe(clone.getKey());
            expect(model.getKeyProperty()).toBe(clone.getKeyProperty());
        });

        test('should give equal fields for not an Object', () => {
            const clone = model.clone();
            model.each((name, value: any) => {
                if (!(value instanceof Object)) {
                    expect(value).toBe(clone.get(name));
                }
            });
            clone.each((name, value: any) => {
                if (!(value instanceof Object)) {
                    expect(value).toBe(model.get(name));
                }
            });
        });
    });

    describe('.merge()', () => {
        test('should merge models', () => {
            const newModel = new Model({
                keyProperty: 'id',
                rawData: {
                    title: 'new',
                    link: '123',
                },
            });
            newModel.merge(model);
            expect(newModel.getKey()).toBe(modelData.id);
        });

        test('should do nothing with itself', () => {
            const model = new Model({
                keyProperty: 'id',
                rawData: {
                    foo: 'bar',
                },
            });

            const setSpy = jest.spyOn(model, 'set').mockClear();
            model.merge(model);
            expect(setSpy).not.toHaveBeenCalled();
        });

        describe('with various adapter types', () => {
            const getSbisData = () => {
                return {
                    d: [1, 2, 3],
                    s: [{ n: 'a' }, { n: 'b' }, { n: 'c' }],
                };
            };
            const getSimpleData = () => {
                return {
                    c: 4,
                    d: 5,
                    e: 6,
                };
            };

            test("should append new fields if acceptor's adapter supports dynamic fields definition", () => {
                const acceptor = new Model({
                    rawData: getSimpleData(),
                });
                const donor = new Model({
                    rawData: getSbisData(),
                    adapter: new SbisAdapter(),
                });

                acceptor.merge(donor);
                donor.each((field, value) => {
                    expect(acceptor.get(field)).toBe(value);
                });
            });

            test("should update exists fields if acceptor's adapter doesn't support dynamic fields definition", () => {
                const acceptor = new Model({
                    rawData: getSbisData(),
                    adapter: new SbisAdapter(),
                });
                const donor = new Model({
                    rawData: getSimpleData(),
                });

                acceptor.merge(donor);
                acceptor.each((field, value) => {
                    if (donor.has(field)) {
                        expect(donor.get(field)).toBe(value);
                    }
                });
            });
        });

        test('should stay unchanged with empty donor', () => {
            expect(model.isChanged()).toBe(false);
            const anotherModel = new Model();
            model.merge(anotherModel);
            expect(model.isChanged()).toBe(false);
        });

        test('should stay unchanged with same donor', () => {
            expect(model.isChanged()).toBe(false);
            const anotherModel = new Model({
                rawData: {
                    max: modelData.max,
                },
            });
            model.merge(anotherModel);
            expect(model.isChanged()).toBe(false);
        });

        test('should stay changed', () => {
            model.set('max', 2);
            expect(model.isChanged()).toBe(true);
            const anotherModel = new Model({
                rawData: {
                    max: 157,
                },
            });
            model.merge(anotherModel);
            expect(model.isChanged()).toBe(true);
        });

        test('should become changed with different donor', () => {
            expect(model.isChanged()).toBe(false);
            const anotherModel = new Model({
                rawData: {
                    max: 157,
                },
            });
            model.merge(anotherModel);
            expect(model.isChanged()).toBe(true);
        });

        test('should become changed with different donor', () => {
            const model = new Model({
                rawData: {
                    d: ['qwe'],
                    s: [
                        {
                            n: 'name',
                            t: 'Строка',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const anotherModel = new Model({
                rawData: {
                    d: ['qwe2', 'qwe3'],
                    s: [
                        {
                            n: 'name2',
                            t: 'Строка',
                        },
                        {
                            n: 'name',
                            t: 'Строка',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });

            model.merge(anotherModel);
            expect(model.get('name')).toBe('qwe3');
        });
    });

    describe('.getInstanceId()', () => {
        test('should return different values for different instances', () => {
            const modelA = getModel();
            const modelB = getModel();
            expect(modelA.getInstanceId()).not.toEqual(modelB.getInstanceId());
        });
    });

    describe('.relationChanged', () => {
        test('should return affected "which"', () => {
            const rawData = { foo: ['bar'] };
            const model = new Model({
                rawData,
            });
            const target = model.get('foo');
            const which = {
                target,
                data: { baz: 'bad' },
            };
            const route = ['field.foo'];

            const result = model.relationChanged(which, route);
            expect(result.target).toBe(target);
            expect(result.data).toEqual({ foo: target });
        });

        test('should not clear own cache', () => {
            const model = new Model({
                properties: {
                    obj: {
                        //@ts-ignore
                        get: () => {
                            return {};
                        },
                    },
                },
            });
            const obj = model.get('obj');

            model.relationChanged({ target: obj }, ['field.obj']);
            expect(obj).toEqual(model.get('obj'));
        });

        test('should clear cache for a dependency field', () => {
            const model = new Model({
                properties: {
                    obj: {
                        //@ts-ignore
                        get: () => {
                            return {};
                        },
                    },
                    obj2: {
                        //@ts-ignore
                        get(): object {
                            return {
                                obj: this.get('obj'),
                            };
                        },
                    },
                },
            });
            const obj = model.get('obj');
            const obj2 = model.get('obj2');

            model.relationChanged({ target: obj2 }, ['field.obj']);
            expect(obj).toBe(model.get('obj'));
            expect(obj2 !== model.get('obj2')).toBeTruthy();
        });
    });

    describe('.getInstanceState', () => {
        test('should return null by default', () => {
            const model = new Model();
            expect(model.getInstanceState()).toBeNull();
        });

        test('should return object with tracking properties values', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    foo: {
                        //@ts-ignore
                        get: Track.create(function (): string {
                            return (this._foo = 'bar');
                        }, '_foo'),
                    },
                } as IHashMap<IProperty<IFooModel>>,
            });

            expect(model.get('foo')).toEqual('bar');
            expect(model.getInstanceState()).toEqual({ _foo: 'bar' });
        });
    });

    describe('.subscribe()', () => {
        test('should trigger "onPropertyChange" if property value type supports mediator', () => {
            const model = new Model({
                properties: {
                    record: {
                        //@ts-ignore
                        get: () => {
                            return new Model();
                        },
                    },
                },
            });
            const given = {
                properties: undefined,
            };
            //@ts-ignore
            const handler = (event, properties) => {
                given.properties = properties;
            };

            model.subscribe('onPropertyChange', handler);
            const property = model.get('record');
            property.set('a', 2);
            model.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(given.properties.record).toBe(property);
        });

        test('should trigger "onPropertyChange" for new property value', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    record: {
                        get(): object {
                            return this._record || (this._record = new Model());
                        },
                        set(value: object): void {
                            this._record = value;
                        },
                    },
                } as IHashMap<
                    IProperty<
                        Model & {
                            _record: object;
                        }
                    >
                >,
            });
            const given = {
                properties: undefined,
            };
            //@ts-ignore
            const handler = (event, properties) => {
                given.properties = properties;
            };

            model.get('record');
            const newProperty = new Model();
            model.set('record', newProperty);

            model.subscribe('onPropertyChange', handler);
            model.get('record').set('b', 2);
            model.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(given.properties.record).toBe(newProperty);
        });

        test('should don\'t trigger "onPropertyChange" for old property value', () => {
            const model = new Model({
                //@ts-ignore
                properties: {
                    record: {
                        get(): object {
                            return this._record || (this._record = new Model());
                        },
                        set(value: object): void {
                            this._record = value;
                        },
                    },
                } as IHashMap<
                    IProperty<
                        Model & {
                            _record: object;
                        }
                    >
                >,
            });
            const given = {
                properties: undefined,
            };
            //@ts-ignore
            const handler = (event, properties) => {
                given.properties = properties;
            };

            const oldProperty = model.get('record');
            const newProperty = new Model();
            model.set('record', newProperty);

            model.subscribe('onPropertyChange', handler);
            oldProperty.set('a', 2);
            model.unsubscribe('onPropertyChange', handler);

            expect(given.properties).not.toBeDefined();
        });

        test('should trigger "onPropertyChange" for instance with IObjectNotify created in def', () => {
            const model = new Model({
                properties: {
                    foo: {
                        def: () => {
                            return new Model();
                        },
                        //@ts-ignore
                        get: (value) => {
                            return value;
                        },
                    },
                },
            });
            const foo = model.get('foo');
            let given = {};
            //@ts-ignore
            const handler = (event, properties) => {
                given = properties;
            };

            expect(foo).toBeInstanceOf(Model);

            model.subscribe('onPropertyChange', handler);
            foo.set('bar', 'baz');
            model.unsubscribe('onPropertyChange', handler);

            expect('foo' in given).toBe(true);
        });
    });

    describe('.toJSON()', () => {
        test('should serialize a model', () => {
            const options = (model as any)._getOptions();
            const json = model.toJSON();

            expect(json.module).toBe('Types/entity:Model');
            expect(typeof json.id).toBe('number');
            expect(json.id > 0).toBe(true);
            expect(json.state.$options).toEqual(options);
            expect((json.state as any)._changedFields).toEqual((model as any)._changedFields);
        });

        test('should serialize an instance id', () => {
            const json = model.toJSON();
            expect((json.state as any)._instanceId).toBe(model.getInstanceId());
        });
    });

    describe('.fromJSON()', () => {
        test('should restore an instance id', () => {
            const json = model.toJSON();
            const clone = (Model as any).fromJSON(json);

            expect((json.state as any)._instanceId).toBe(clone.getInstanceId());
        });
    });

    describe('.toString()', () => {
        test('should serialize a model', () => {
            const model = new Model({
                rawData: { to: 'String' },
            });
            expect(model.toString()).toEqual('{"to":"String"}');
        });
    });

    describe('when old style extend used', () => {
        describe('.$constructor()', () => {
            test('should be called', () => {
                let testOk = false;
                class Sub extends Model {
                    constructor() {
                        super();
                        testOk = true;
                    }
                }
                const instance = new Sub();
                expect(testOk).toBe(true);
                instance.destroy();
            });

            test('should be called on each child', () => {
                let testOk = 0;
                class Sub extends Model {
                    constructor() {
                        super();
                        testOk++;
                    }
                }
                class MoreSub extends Sub {
                    constructor() {
                        super();
                        testOk += 2;
                    }
                }

                const instance = new MoreSub();
                expect(testOk).toEqual(3);

                instance.destroy();
            });
        });

        describe('.getKeyProperty()', () => {
            test('should return value passed to the constructor as keyProperty even if superclass has old-fashioned idProperty', () => {
                class Sub extends Model {
                    idProperty: 'foo';
                }

                const instance = new Sub({
                    keyProperty: 'bar',
                });

                expect(instance.getKeyProperty()).toEqual('bar');
                instance.destroy();
            });
        });

        describe('.toJSON()', () => {
            test('should dont save _$properties', () => {
                class Sub extends Model {
                    protected _moduleName = 'Sub';
                    //@ts-ignore
                    protected _$properties = {
                        some: {
                            foo: () => {
                                return 'bar';
                            },
                        },
                    };
                }
                const instance = new Sub();
                const serialized = instance.toJSON();

                //@ts-ignore
                expect(serialized.state.$options.properties).not.toBeDefined();
            });
        });

        describe('::fromObject', () => {
            test('should return a model', () => {
                const data = {
                    id: 1,
                    title: 'title',
                    selected: true,
                    pid: null,
                };
                const model = Model.fromObject(data);

                expect(model).toBeInstanceOf(Model);
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        //@ts-ignore
                        expect(model.get(key as never)).toBe(data[key]);
                    }
                }
            });
        });
    });
});
