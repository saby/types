import { expect } from 'chai';
import { ComponentLoaderWithProps, ObjectComponentLoaderWithProps } from 'Types/_meta/components';
import { ObjectType, AnyType } from 'Types/_meta/types';

describe('Types/_meta/components', () => {
    const Editor = () => {
        return null;
    };
    const loader = async () => {
        return Editor;
    };
    const props = { a: 1 };

    describe('ComponentLoaderWithProps', () => {
        describe('constructor()', () => {
            it('использует параметры из аргумента', () => {
                const result = new ComponentLoaderWithProps<any, any>({
                    loader,
                    props,
                });
                expect(result.loader).equal(loader);
                expect(result.props).equal(props);
            });
        });

        describe('ready', () => {
            it('возвращает `true`, если `loader` не указан', () => {
                const result = new ComponentLoaderWithProps();
                expect(result.ready).equal(true);
            });

            it('возвращает `true`, если `loader` указан и загружен', async () => {
                const result = new ComponentLoaderWithProps<any, any>({
                    loader,
                    props,
                });
                await result.load();
                expect(result.ready).equal(true);
            });

            it('возвращает `false`, если `loader` указан, но не загружен', () => {
                const result = new ComponentLoaderWithProps<any, any>({
                    loader,
                    props,
                });
                expect(result.ready).equal(false);
            });
        });

        describe('load()', () => {
            it('вызывает загрузчик', async () => {
                const result = new ComponentLoaderWithProps({ loader });
                expect(result.component).equal(undefined);
                await result.load();
                expect(result.component).equal(Editor);
            });

            it('использует `default` из результата загрузки', async () => {
                const result = new ComponentLoaderWithProps({
                    loader: async () => {
                        return { default: Editor };
                    },
                });
                expect(result.component).equal(undefined);
                await result.load();
                expect(result.component).equal(Editor);
            });

            it('возникает ошибка, если загруженные данные не являются компонентом', async () => {
                const result = new ComponentLoaderWithProps({
                    loader: (() => {
                        return 1;
                    }) as any,
                });
                try {
                    await result.load();
                    expect(false).equal(true);
                } catch (error: any) {
                    expect(error.message).equal('Неверный компонент');
                }
            });
        });
    });

    describe('ObjectComponentLoaderWithProps', () => {
        const attributes = {
            a: AnyType.editor(async () => {
                return () => {
                    return null;
                };
            }),
        };
        describe('constructor()', () => {
            it('наследует `ComponentLoaderWithProps`', () => {
                const result = new ObjectComponentLoaderWithProps({}, {}, () => {
                    return void 0;
                });
                expect(result).instanceOf(ComponentLoaderWithProps);
            });

            it('использует параметры из аргумента', () => {
                const result = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    {},
                    () => {
                        return void 0;
                    }
                );
                expect(result.loader).equal(loader);
                expect(result.props).equal(props);
            });

            it('не сериализует сохранённые `attributes`', () => {
                const original = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    attributes,
                    () => {
                        return void 0;
                    }
                );
                const result = JSON.parse(JSON.stringify(original));
                expect(result).deep.equal({ props });
            });
        });

        describe('ready', () => {
            it('возвращает `true`, если `loader` не указан', () => {
                const result = new ObjectComponentLoaderWithProps({}, {}, () => {
                    return void 0;
                });
                expect(result.ready).equal(true);
            });

            it('возвращает `true`, если `loader` указан и загружен', async () => {
                const result = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    {},
                    () => {
                        return void 0;
                    }
                );
                await result.load();
                expect(result.ready).equal(true);
            });

            it('возвращает `false`, если `loader` указан, но не загружен', () => {
                const result = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    {},
                    () => {
                        return void 0;
                    }
                );
                expect(result.ready).equal(false);
            });

            it('возвращает `false`, если редактор какого-то атрибута не готов', () => {
                const result = new ObjectComponentLoaderWithProps(
                    {},
                    {
                        a: AnyType.editor(async () => {
                            return () => {
                                return null;
                            };
                        }),
                        b: ObjectType.attributes({
                            c: AnyType.editor(async () => {
                                return () => {
                                    return null;
                                };
                            }),
                        }),
                    },
                    (meta) => {
                        return meta?.getEditor?.();
                    }
                );
                expect(result.ready).equal(false);
            });

            it('возвращает `true`, если редакторы всех атрибутов готовы', async () => {
                const result = new ObjectComponentLoaderWithProps(
                    {},
                    {
                        a: AnyType.editor(async () => {
                            return () => {
                                return null;
                            };
                        }),
                        b: ObjectType.attributes({ c: null }),
                    },
                    (meta) => {
                        return meta?.getEditor?.();
                    }
                );
                await result.load();
                expect(result.ready).equal(true);
            });
        });

        describe('load()', () => {
            const Editor0 = () => {
                return null;
            };
            const Editor1 = () => {
                return null;
            };
            const Editor2 = () => {
                return null;
            };

            it('загружает только собственный редактор, если он задан', async () => {
                const result = new ObjectComponentLoaderWithProps(
                    {
                        loader: async () => {
                            return Editor0;
                        },
                    },
                    {
                        a: AnyType.designtimeEditor(async () => {
                            return Editor1;
                        }),
                        b: ObjectType.attributes({
                            c: AnyType.designtimeEditor(async () => {
                                return { default: Editor2 };
                            }),
                        }),
                    },
                    (meta) => {
                        return meta?.getDesigntimeEditor?.();
                    }
                );
                await result.load();
                expect(result.ready).equal(true);
                expect(result.component).equal(Editor0);
                expect((result as any).getAttributes().a?.getDesigntimeEditor()?.component).equal(
                    undefined
                );
                expect(
                    (result as any).getAttributes().b?.getAttributes()?.c.getDesigntimeEditor()
                        .component
                ).equal(undefined);
            });

            it('загружает редакторы всех атрибутов, если собственный редактор не задан', async () => {
                const result = new ObjectComponentLoaderWithProps(
                    {},
                    {
                        a: AnyType.editor(async () => {
                            return Editor1;
                        }),
                        b: ObjectType.attributes({
                            c: AnyType.editor(async () => {
                                return { default: Editor2 };
                            }),
                        }),
                    },
                    (meta) => {
                        return meta?.getEditor?.();
                    }
                );
                await result.load();
                expect(result.ready).equal(true);
                expect(result.component).equal(undefined);
                expect((result as any).getAttributes().a?.getEditor()?.component).equal(Editor1);
                // expect(
                //     (result as any).getAttributes().b?.getAttributes()?.c.getEditor().component
                // ).equal(Editor2);
            });
        });
    });
});
