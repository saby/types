import { ComponentLoaderWithProps, ObjectComponentLoaderWithProps } from 'Meta/_types/components';
import { ObjectType, AnyType } from 'Meta/_types/types';

describe('Meta/_types/components', () => {
    const Editor = () => {
        return null;
    };
    const loader = async () => {
        return Editor;
    };
    const props = { a: 1 };

    describe('ComponentLoaderWithProps', () => {
        describe('constructor()', () => {
            test('использует параметры из аргумента', () => {
                const result = new ComponentLoaderWithProps<any, any>({
                    loader,
                    props,
                });
                expect(result.loader).toEqual(loader);
                expect(result.props).toEqual(props);
            });
        });

        describe('ready', () => {
            test('возвращает `true`, если `loader` не указан', () => {
                const result = new ComponentLoaderWithProps();
                expect(result.ready).toEqual(true);
            });

            test('возвращает `true`, если `loader` указан и загружен', async () => {
                const result = new ComponentLoaderWithProps<any, any>({
                    loader,
                    props,
                });
                await result.load();
                expect(result.ready).toEqual(true);
            });

            test('возвращает `false`, если `loader` указан, но не загружен', () => {
                const result = new ComponentLoaderWithProps<any, any>({
                    loader,
                    props,
                });
                expect(result.ready).toEqual(false);
            });
        });

        describe('load()', () => {
            test('вызывает загрузчик', async () => {
                const result = new ComponentLoaderWithProps({ loader });
                expect(result.component).toEqual(undefined);
                await result.load();
                expect(result.component).toEqual(Editor);
            });

            test('использует `default` из результата загрузки', async () => {
                const result = new ComponentLoaderWithProps({
                    loader: async () => {
                        return { default: Editor };
                    },
                });
                expect(result.component).toEqual(undefined);
                await result.load();
                expect(result.component).toEqual(Editor);
            });

            test('возникает ошибка, если загруженные данные не являются компонентом', async () => {
                const result = new ComponentLoaderWithProps({
                    loader: (() => {
                        return 1;
                    }) as any,
                });
                try {
                    await result.load();
                    expect(false).toEqual(true);
                } catch (error: any) {
                    expect(error.message).toEqual('Неверный компонент');
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
            test('наследует `ComponentLoaderWithProps`', () => {
                //@ts-ignore
                const result = new ObjectComponentLoaderWithProps({}, {}, () => {
                    return void 0;
                });
                expect(result).toBeInstanceOf(ComponentLoaderWithProps);
            });

            test('использует параметры из аргумента', () => {
                const result = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    {},
                    //@ts-ignore
                    () => {
                        return void 0;
                    }
                );
                expect(result.loader).toEqual(loader);
                expect(result.props).toEqual(props);
            });

            test('не сериализует сохранённые `properties`', () => {
                const original = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    attributes,
                    //@ts-ignore
                    () => {
                        return void 0;
                    }
                );
                const result = JSON.parse(JSON.stringify(original));
                expect(result).toEqual({ props });
            });
        });

        describe('ready', () => {
            test('возвращает `true`, если `loader` не указан', () => {
                //@ts-ignore
                const result = new ObjectComponentLoaderWithProps({}, {}, () => {
                    return void 0;
                });
                expect(result.ready).toEqual(true);
            });

            test('возвращает `true`, если `loader` указан и загружен', async () => {
                const result = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    {},
                    //@ts-ignore
                    () => {
                        return void 0;
                    }
                );
                await result.load();
                expect(result.ready).toEqual(true);
            });

            test('возвращает `false`, если `loader` указан, но не загружен', () => {
                const result = new ObjectComponentLoaderWithProps<any, any>(
                    { loader, props },
                    {},
                    //@ts-ignore
                    () => {
                        return void 0;
                    }
                );
                expect(result.ready).toEqual(false);
            });

            test('возвращает `false`, если редактор какого-то атрибута не готов', () => {
                const result = new ObjectComponentLoaderWithProps(
                    {},
                    {
                        a: AnyType.editor(async () => {
                            return () => {
                                return null;
                            };
                        }),
                        b: ObjectType.properties({
                            c: AnyType.editor(async () => {
                                return () => {
                                    return null;
                                };
                            }),
                        }),
                    },
                    //@ts-ignore
                    (meta) => {
                        return meta?.getEditor?.();
                    }
                );
                expect(result.ready).toEqual(false);
            });

            test('возвращает `true`, если редакторы всех атрибутов готовы', async () => {
                const result = new ObjectComponentLoaderWithProps(
                    {},
                    {
                        a: AnyType.editor(async () => {
                            return () => {
                                return null;
                            };
                        }),
                        //@ts-ignore
                        b: ObjectType.properties({ c: null }),
                    },
                    //@ts-ignore
                    (meta) => {
                        return meta?.getEditor?.();
                    }
                );
                await result.load();
                expect(result.ready).toEqual(true);
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

            test('загружает только собственный редактор, если он задан', async () => {
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
                        b: ObjectType.properties({
                            c: AnyType.designtimeEditor(async () => {
                                return { default: Editor2 };
                            }),
                        }),
                    },
                    //@ts-ignore
                    (meta) => {
                        return meta?.getDesigntimeEditor?.();
                    }
                );
                await result.load();
                expect(result.ready).toEqual(true);
                expect(result.component).toEqual(Editor0);
                expect((result as any).getProperties().a?.getDesigntimeEditor()?.component).toEqual(
                    undefined
                );
                expect(
                    (result as any).getProperties().b?.getProperties()?.c.getDesigntimeEditor()
                        .component
                ).toEqual(undefined);
            });

            test('загружает редакторы всех атрибутов, если собственный редактор не задан', async () => {
                const result = new ObjectComponentLoaderWithProps(
                    {},
                    {
                        a: AnyType.editor(async () => {
                            return Editor1;
                        }),
                        b: ObjectType.properties({
                            c: AnyType.editor(async () => {
                                return { default: Editor2 };
                            }),
                        }),
                    },
                    //@ts-ignore
                    (meta) => {
                        return meta?.getEditor?.();
                    }
                );
                await result.load();
                expect(result.ready).toEqual(true);
                expect(result.component).toEqual(undefined);
                expect((result as any).getProperties().a?.getEditor()?.component).toEqual(Editor1);
                // expect(
                //     (result as any).getProperties().b?.getProperties()?.c.getEditor().component
                // ).toEqual(Editor2);
            });
        });
    });
});
