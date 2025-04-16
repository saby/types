import { ArrayMeta, FunctionMeta, ObjectMeta, PromiseMeta, Meta, MetaClass } from 'Meta/types';
import { TmpMetaEditor } from 'Meta/_types/components';

describe('Meta/_types/meta', () => {
    describe('ObjectMeta', () => {
        test('наследует класс `Meta`', () => {
            const result = new ObjectMeta({
                is: MetaClass.object,
                attributes: {},
            });
            expect(result).toBeInstanceOf(Meta);
        });

        describe('constructor()', () => {
            test('свойство `properties` всегда есть, даже если в описании оно не задано', () => {
                const result = new ObjectMeta({} as any);
                expect(result.properties()).toEqual({});
            });

            test('преобразует описание типов в `properties` в экземпляры класса `Meta`', () => {
                const type = new Meta({});
                const result = new ObjectMeta<{
                    type: any;
                    object: any;
                    promise: any;
                    array: any;
                    function: any;
                }>({
                    is: MetaClass.object,
                    attributes: {
                        type,
                        base: {},
                        object: { is: MetaClass.object, attributes: {} },
                        array: { is: MetaClass.array, arrayOf: {} },
                        promise: { is: MetaClass.promise, result: {} },
                        function: { is: MetaClass.function, function: {} },
                    } as any,
                });
                expect(result.properties().type).toEqual(type);
                expect((result.properties() as any).base).toBeInstanceOf(Meta);
                expect(result.properties().object).toBeInstanceOf(ObjectMeta);
                expect(result.properties().array).toBeInstanceOf(ArrayMeta);
                expect(result.properties().promise).toBeInstanceOf(PromiseMeta);
                expect(result.properties().function).toBeInstanceOf(FunctionMeta);
            });

            test('меняет `origin`, если у мета-описания объекта есть редактор', () => {
                const result = new ObjectMeta({
                    is: MetaClass.object,
                    editor: {
                        loader: async () => {
                            return () => {
                                return null;
                            };
                        },
                    },
                    attributes: {
                        a: {},
                    },
                });
                expect(result.properties().a.getOrigin()?.meta).toEqual(result);
                expect(result.properties().a.getOrigin()?.key).toEqual('a');
            });

            test('не меняет `origin`, если у мета-описания объекта нет редактора', () => {
                const result = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: { a: {} },
                });
                expect(result.properties().a.getOrigin()).toBeUndefined();
            });

            test('не меняет `origin` при множественном заимствовании, если используется свойство из мета-описание без редактора', () => {
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    editor: {
                        loader: async () => {
                            return () => {
                                return null;
                            };
                        },
                    },
                    attributes: {
                        a: {},
                    },
                });
                const middle = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: {
                        b: original.properties().a,
                    },
                });
                const result = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: {
                        c: middle.properties().b,
                    },
                });
                expect(result.properties().c.getOrigin()?.meta).toEqual(original);
                expect(result.properties().c.getOrigin()?.key).toEqual('a');
            });
        });

        describe('toDescriptor()', () => {
            test('преобразует тип в мета-описание', () => {
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    id: 'toDescriptor2',
                    attributes: {
                        a: {},
                    },
                });
                const result = original.toDescriptor();
                expect(result.is).toEqual(MetaClass.object);
                expect(result.id).toEqual('toDescriptor2');
                expect(result.properties?.a).toBeInstanceOf(Meta);
            });
        });

        describe('getEditor()', () => {
            test('возвращает редактор - экземпляр класса `ObjectComponentLoaderWithProps`', () => {
                const loader = async () => {
                    return () => {
                        return null;
                    };
                };
                const props = {};
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: {},
                    editor: { loader, props },
                });
                const result = original.getEditor();
                expect((result as TmpMetaEditor).loader).toEqual(loader);
                expect((result as TmpMetaEditor).props).toEqual(props);
            });
        });

        describe('getDefaultValue()', () => {
            test('возвращает {}, если его значение не задано', () => {
                const result = new ObjectMeta({
                    is: MetaClass.object,
                });

                expect(result.getDefaultValue()).toEqual({});
            });

            test('возвращает `defaultValue`, если его значение задано', () => {
                const defaultValue = { one: 'defaultValue' };

                const result = new ObjectMeta({
                    is: MetaClass.object,
                    defaultValue,
                    attributes: {
                        one: new Meta({ defaultValue: 'one' }),
                    },
                });

                expect(result.getDefaultValue()).toEqual(defaultValue);
            });

            test('возвращает значение, собранное на основании `properties`', () => {
                const result = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: {
                        one: new Meta({ defaultValue: 'one' }),
                        two: new ObjectMeta({
                            is: MetaClass.object,
                            attributes: {
                                three: new ObjectMeta({
                                    is: MetaClass.object,
                                    attributes: {
                                        four: { defaultValue: 4 },
                                    },
                                }),
                            },
                        }),
                        five: new Meta({}),
                    },
                });

                expect(result.getDefaultValue()).toEqual({
                    one: 'one',
                    two: {
                        three: {
                            four: 4,
                        },
                    },
                });
            });
        });

        describe('properties()', () => {
            test('возвращает текущие атрибуты, если аргумент не задан', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: { a, b },
                });
                expect(original.properties()).toEqual({ a, b });
            });

            test('создаёт новый экземпляр с обновлёнными атрибутами', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: { a },
                });
                const result = original.properties({ b });
                expect(original.properties()).toEqual({ a });
                expect(result).not.toEqual(original);
                expect(result.properties()).toEqual({ b });
            });
        });
    });
});
