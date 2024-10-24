import { expect } from 'chai';
import { ArrayMeta, FunctionMeta, ObjectMeta, PromiseMeta, Meta, MetaClass } from 'Meta/types';
import { TmpMetaEditor } from 'Meta/_types/components';

describe('Meta/_types/meta', () => {
    describe('ObjectMeta', () => {
        it('наследует класс `Meta`', () => {
            const result = new ObjectMeta({
                is: MetaClass.object,
                attributes: {},
            });
            expect(result).instanceOf(Meta);
        });

        describe('constructor()', () => {
            it('свойство `properties` всегда есть, даже если в описании оно не задано', () => {
                const result = new ObjectMeta({} as any);
                expect(result.properties()).to.deep.equal({});
            });

            it('преобразует описание типов в `properties` в экземпляры класса `Meta`', () => {
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
                expect(result.properties().type).to.equal(type);
                expect((result.properties() as any).base).instanceOf(Meta);
                expect(result.properties().object).instanceOf(ObjectMeta);
                expect(result.properties().array).instanceOf(ArrayMeta);
                expect(result.properties().promise).instanceOf(PromiseMeta);
                expect(result.properties().function).instanceOf(FunctionMeta);
            });

            it('меняет `origin`, если у мета-описания объекта есть редактор', () => {
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
                expect(result.properties().a.getOrigin().meta).equal(result);
                expect(result.properties().a.getOrigin().key).equal('a');
            });

            it('не меняет `origin`, если у мета-описания объекта нет редактора', () => {
                const result = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: { a: {} },
                });
                expect(result.properties().a.getOrigin()).equal(undefined);
            });

            it('не меняет `origin` при множественном заимствовании, если используется свойство из мета-описание без редактора', () => {
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
                expect(result.properties().c.getOrigin().meta).equal(original);
                expect(result.properties().c.getOrigin().key).equal('a');
            });
        });

        describe('toDescriptor()', () => {
            it('преобразует тип в мета-описание', () => {
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    id: 'toDescriptor2',
                    attributes: {
                        a: {},
                    },
                });
                const result = original.toDescriptor();
                expect(result.is).equal(MetaClass.object);
                expect(result.id).equal('toDescriptor2');
                expect(result.properties.a).instanceOf(Meta);
            });
        });

        describe('getEditor()', () => {
            it('возвращает редактор - экземпляр класса `ObjectComponentLoaderWithProps`', () => {
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
                expect((result as TmpMetaEditor).loader).equal(loader);
                expect((result as TmpMetaEditor).props).equal(props);
            });
        });

        describe('getDefaultValue()', () => {
            it('возвращает {}, если его значение не задано', () => {
                const result = new ObjectMeta({
                    is: MetaClass.object,
                });

                expect(result.getDefaultValue()).deep.equal({});
            });

            it('возвращает `defaultValue`, если его значение задано', () => {
                const defaultValue = { one: 'defaultValue' };

                const result = new ObjectMeta({
                    is: MetaClass.object,
                    defaultValue,
                    attributes: {
                        one: new Meta({ defaultValue: 'one' }),
                    },
                });

                expect(result.getDefaultValue()).equal(defaultValue);
            });

            it('возвращает значение, собранное на основании `properties`', () => {
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

                expect(result.getDefaultValue()).to.deep.equal({
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
            it('возвращает текущие атрибуты, если аргумент не задан', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: { a, b },
                });
                expect(original.properties()).deep.equal({ a, b });
            });

            it('создаёт новый экземпляр с обновлёнными атрибутами', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new ObjectMeta({
                    is: MetaClass.object,
                    attributes: { a },
                });
                const result = original.properties({ b });
                expect(original.properties()).deep.equal({ a });
                expect(result).not.equal(original);
                expect(result.properties()).deep.equal({ b });
            });
        });
    });
});
