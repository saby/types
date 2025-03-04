import { Meta, MetaClass } from 'Meta/_types/baseMeta';
import { TmpMetaEditor } from 'Meta/_types/components';
import MockEditor from 'MetaUnit/_types/types/mock';

describe('Meta/_types/baseMeta', () => {
    describe('Meta', () => {
        describe('constructor()', () => {
            test('использует параметры из аргумента', () => {
                const inherits = ['one', 'two'];
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const result = new Meta({
                    inherits,
                    editor: { loader: editorLoader },
                    id: 'constructor1',
                    required: false,
                    defaultValue: 'Tensor',
                    info: {
                        category: 'cat',
                        group: { name: 'test-group', uid: 'test-group-uid' },
                        order: 42,
                        icon: 'i',
                        title: 'Aaa',
                        description: 'Done',
                        hidden: true,
                        disabled: true,
                    },
                });
                expect(result.getId()).toEqual('constructor1');
                expect(result.getCategory()).toEqual('cat');
                expect(result.getGroup()?.name).toEqual('test-group');
                expect(result.getGroup()?.uid).toEqual('test-group-uid');
                expect(result.getOrder()).toEqual(42);
                expect(result.getIcon()).toEqual('i');
                expect(result.getTitle()).toEqual('Aaa');
                expect(result.getDescription()).toEqual('Done');
                expect(result.isOptional()).toEqual(true);
                expect(result.isHidden()).toEqual(true);
                expect(result.isDisabled()).toEqual(true);
                expect((result as any)._inherits).toEqual(inherits);
                expect(result.getDefaultValue()).toEqual('Tensor');
                // @ts-ignore
                expect(result.getEditor()?.loader).toEqual(editorLoader);
            });

            test('преобразует отсутствующий `id` пустую строку', () => {
                const result = new Meta();
                expect(result.getId()).toEqual('');
            });

            test('по-умолчанию устанавливает `required=true`', () => {
                const result = new Meta();
                expect(result.isRequired()).toEqual(true);
            });
        });

        describe('toDescriptor()', () => {
            test('преобразует тип в мета-описание', () => {
                const inherits = ['one', 'two'];
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const group = { name: 'test-group', uid: 'test-group-uid' };
                const original = new Meta({
                    inherits,
                    editor: { loader: editorLoader },
                    id: 'toDescriptor1',
                    required: false,
                    defaultValue: 'Tensor',
                    info: {
                        category: 'cat',
                        group,
                        order: 42,
                        icon: 'i',
                        title: 'Aaa',
                        description: 'Done',
                        hidden: true,
                        disabled: true,
                    },
                });
                const result = original.toDescriptor();
                expect(result.is).toEqual(MetaClass.primitive);
                expect(result.id).toEqual('toDescriptor1');
                expect(result.info?.category).toEqual('cat');
                expect(result.info?.group).toEqual(group);
                expect(result.info?.order).toEqual(42);
                expect(result.info?.icon).toEqual('i');
                expect(result.info?.title).toEqual('Aaa');
                expect(result.info?.description).toEqual('Done');
                expect(result.info?.hidden).toEqual(true);
                expect(result.info?.disabled).toEqual(true);
                expect(result.required).toEqual(false);
                expect(result.inherits).toEqual(inherits);
                expect(result.defaultValue).toEqual('Tensor');
                expect(result.editor?.loader).toEqual(editorLoader);
            });
        });

        describe('clone()', () => {
            test('копирует все данные', () => {
                const inherits = ['one', 'two'];
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const group = { name: 'test-group', uid: 'test-group-uid' };
                const extended = 'test-group';
                const original = new Meta({
                    inherits,
                    editor: { loader: editorLoader },
                    id: 'clone1',
                    required: false,
                    defaultValue: 'Tensor',
                    info: {
                        category: 'cat',
                        group,
                        extended,
                        order: 42,
                        icon: 'i',
                        title: 'Aaa',
                        description: 'Done',
                        hidden: true,
                        disabled: true,
                    },
                });
                const result = original.clone();
                expect(result).toBeInstanceOf(Meta);
                expect(result).not.toEqual(original);
                expect(result.isRequired()).toEqual(false);
                expect(result.isHidden()).toEqual(true);
                expect(result.isDisabled()).toEqual(true);
                expect(result.getGroup()).toEqual(group);
                expect(result.getExtended()).toEqual(extended);
                expect(result.getCategory()).toEqual('cat');
                expect(result.getIcon()).toEqual('i');
                expect(result.getOrder()).toEqual(42);
                expect(result.getTitle()).toEqual('Aaa');
                expect(result.getDescription()).toEqual('Done');
                // TODO это проблема логики мета. Эта штука нужна для выбора редактора
                expect((result as any)._inherits).toEqual(inherits);
                expect(result.getDefaultValue()).toEqual('Tensor');
                expect((result.getEditor() as TmpMetaEditor)?.loader).toEqual(editorLoader);
            });

            test('при fixedId сохраняет id', () => {
                const original = new Meta({
                    id: 'clone1',
                    fixedId: true,
                });

                const result = original.clone();
                expect(result.getId()).toEqual('clone1');
            });

            test('базовый id сохраняется в inherits при клонировании', () => {
                const baseId = 'base-id-1';
                const original = new Meta({
                    id: baseId,
                });

                const result = original.clone();
                expect(result.getId()).not.toEqual(baseId);
                // TODO это проблема логики мета. Эта штука нужна для выбора редактора
                expect((result as any)._inherits.length).toEqual(1);
                expect((result as any)._inherits[0]).toEqual(baseId);
            });

            test('обновляет переданные параметры', () => {
                const original = new Meta({ defaultValue: 'Google' });
                const result = original.clone({ defaultValue: 'Tensor' });
                expect(original.getDefaultValue()).toEqual('Google');
                expect(result).not.toEqual(original);
                expect(result.getDefaultValue()).toEqual('Tensor');
            });
        });

        describe('id()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если `id` не меняется', () => {
                const original = new Meta({ id: 'setId1' });
                const result = original.id('setId1');
                expect(result).toEqual(original);
            });

            test('отслеживает циклическое наследование', () => {
                const original = new Meta({
                    id: 'setId2',
                    inherits: ['setId3', 'setId4'],
                });
                expect(() => {
                    return original.id('setId4');
                }).toThrow('Циклическое наследование недопустимо');
            });

            test('возвращает новый экземпляр класса `Meta` с изменённым `id`', () => {
                const original = new Meta({ id: 'setId5' });
                const result = original.id('setId6');
                expect(original.getId()).toEqual('setId5');
                expect(result).not.toEqual(original);
                expect(result.getId()).toEqual('setId6');
            });

            test('обновляет значение `inherits` у нового экземпляра класса `Meta`', () => {
                const original = new Meta({ id: 'setId10' });
                const result = original.id('setId11').id('setId12');
                expect((original as any)._inherits).toBeUndefined();
                expect(result).not.toEqual(original);
                expect(result.getId()).toEqual('setId12');
                expect((result as any)._inherits).toEqual(['setId10', 'setId11']);
            });
        });

        describe('getId()', () => {
            test('возвращает идентификатор', () => {
                const result = new Meta({ id: 'this is id' });
                expect(result.getId()).toEqual('this is id');
            });
        });

        describe('category()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если `category` не меняется', () => {
                const original = new Meta({ info: { category: 'ok' } });
                const result = original.category('ok');
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым значением `category`', () => {
                const original = new Meta({ info: { category: 'one' } });
                const result = original.category('two');
                expect(original.getCategory()).toEqual('one');
                expect(result).not.toEqual(original);
                expect(result.getCategory()).toEqual('two');
            });
        });

        describe('getCategory()', () => {
            test('возвращает название категории', () => {
                const result = new Meta({ info: { category: 'cat' } });
                expect(result.getCategory()).toEqual('cat');
            });
        });

        describe('group()', () => {
            test('можно задать `group`', () => {
                const groupUid = 'test-group-uid';
                const original = new Meta({});
                expect(original.group(groupUid).getGroup()?.uid).toEqual(groupUid);
            });

            test('не создаёт новый экземпляр класса `Meta`, если `group` не меняется', () => {
                const group = { name: 'test-group-uid', uid: 'test-group-uid' };
                const original = new Meta({ info: { group } });
                const result = original.group('test-group-uid');
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым значением `group`', () => {
                const group = { name: 'test-group-uid', uid: 'test-group-uid' };
                const groupTwoUid = 'two';
                const original = new Meta({ info: { group } });
                const result = original.group(groupTwoUid);
                expect(original.getGroup()).toEqual(group);
                expect(result).not.toEqual(original);
                expect(result.getGroup()).toEqual({ name: groupTwoUid, uid: groupTwoUid });
            });
        });

        describe('getGroup()', () => {
            test('возвращает название группы', () => {
                const group = { name: 'test-group-uid', uid: 'test-group-uid' };
                const result = new Meta({ info: { group } });
                expect(result.getGroup()?.name).toEqual('test-group-uid');
            });
        });

        describe('extended()', () => {
            test('можно задать `extended`', () => {
                const extended = 'test-group-uid';
                const original = new Meta({});
                expect(original.extended(extended).getExtended()).toEqual(extended);
            });

            test('не создаёт новый экземпляр класса `Meta`, если `extended` не меняется', () => {
                const extended = 'test-group-uid';
                const original = new Meta({ info: { extended } });
                const result = original.extended('test-group-uid');
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым значением `extended`', () => {
                const extended = 'test-group-uid';
                const extendedTwo = 'two';
                const original = new Meta({ info: { extended } });
                const result = original.extended(extendedTwo);
                expect(original.getExtended()).toEqual(extended);
                expect(result).not.toEqual(original);
                expect(result.getExtended()).toEqual(extendedTwo);
            });
        });

        describe('getExtended()', () => {
            test('возвращает название группы', () => {
                const extended = 'test-group-uid';
                const result = new Meta({ info: { extended } });
                expect(result.getExtended()).toEqual('test-group-uid');
            });
        });

        describe('title()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если `title` не меняется', () => {
                const original = new Meta({ info: { title: 'ok' } });
                const result = original.title('ok');
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым `title`', () => {
                const original = new Meta({ info: { title: 'one' } });
                const result = original.title('two');
                expect(original.getTitle()).toEqual('one');
                expect(result).not.toEqual(original);
                expect(result.getTitle()).toEqual('two');
            });
        });

        describe('getTitle()', () => {
            test('возвращает название свойства', () => {
                const result = new Meta({ info: { title: 'Ttl' } });
                expect(result.getTitle()).toEqual('Ttl');
            });
        });

        describe('description()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если `description` не меняется', () => {
                const original = new Meta({ info: { description: 'ok' } });
                const result = original.description('ok');
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым `description`', () => {
                const original = new Meta({ info: { description: 'one' } });
                const result = original.description('two');
                expect(original.getDescription()).toEqual('one');
                expect(result).not.toEqual(original);
                expect(result.getDescription()).toEqual('two');
            });
        });

        describe('devguide()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если `devguide` не меняется', () => {
                const original = new Meta({ info: { devguide: 'ok' } });
                const result = original.devguide('ok');
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым `devguide`', () => {
                const original = new Meta({ info: { devguide: 'one' } });
                const result = original.devguide('two');
                expect(original.getDevguide()).toEqual('one');
                expect(result).not.toEqual(original);
                expect(result.getDevguide()).toEqual('two');
            });
        });

        describe('icon()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если `icon` не меняется', () => {
                const original = new Meta({ info: { icon: 'user' } });
                const result = original.icon('user');
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым `icon`', () => {
                const original = new Meta({ info: { icon: 'user' } });
                const result = original.icon('shop');
                expect(original.getIcon()).toEqual('user');
                expect(result).not.toEqual(original);
                expect(result.getIcon()).toEqual('shop');
            });
        });

        describe('getIcon()', () => {
            test('возвращает иконку', () => {
                const result = new Meta({ info: { icon: 'icn' } });
                expect(result.getIcon()).toEqual('icn');
            });
        });

        describe('order()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если `order` не меняется', () => {
                const original = new Meta({ info: { order: 42 } });
                const result = original.order(42);
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым `order`', () => {
                const original = new Meta({ info: { order: 42 } });
                const result = original.order(69);
                expect(original.getOrder()).toEqual(42);
                expect(result).not.toEqual(original);
                expect(result.getOrder()).toEqual(69);
            });
        });

        describe('getOrder()', () => {
            test('возвращает порядковый номер', () => {
                const result = new Meta({ info: { order: 42 } });
                expect(result.getOrder()).toEqual(42);
            });
        });

        describe('hidden()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если тип скрыт', () => {
                const original = new Meta({ info: { hidden: true } });
                const result = original.hidden();
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с `hidden=true`', () => {
                const original = new Meta();
                const result = original.hidden();
                expect(original.isVisible()).toEqual(true);
                expect(result).not.toEqual(original);
                expect(result.isHidden()).toEqual(true);
            });
        });

        describe('visible()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если тип не скрыт', () => {
                const original = new Meta();
                const result = original.visible();
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с `hidden=undefined`', () => {
                const original = new Meta({ info: { hidden: true } });
                const result = original.visible();
                expect(original.isHidden()).toEqual(true);
                expect(result).not.toEqual(original);
                expect(result.isVisible()).toEqual(true);
            });
        });

        describe('is()', () => {
            test('возвращает `true`, если проверяется тот же тип', () => {
                const result = new Meta({ id: 'parent' });
                expect(result.is({ id: 'parent' })).toEqual(true);
            });
            test('возвращает `true`, если тип наследует родителя', () => {
                const parent = new Meta({ id: 'parent' });
                const result = new Meta({ inherits: ['some', 'parent'] });
                expect(result.is(parent)).toEqual(true);
            });
            test('возвращает `false`, если тип не наследует родителя', () => {
                const parent = new Meta({ id: 'parent' });
                const result = new Meta({ inherits: ['some'] });
                expect(result.is(parent)).toEqual(false);
            });
            test('возвращает `false`, если `inherits` не задан', () => {
                const parent = new Meta({ id: 'parent' });
                const result = new Meta({});
                expect(result.is(parent)).toEqual(false);
            });
        });

        describe('editor()', () => {
            test('не создаёт новый экземпляр класса, если `editor.loader` не меняется', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const original = new Meta({ editor: { loader: editorLoader } });
                const result = original.editor(editorLoader);
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым `editor.loader`', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const original = new Meta();
                const result = original.editor(editorLoader);
                expect(result).not.toEqual(original);
                expect((result.getEditor() as TmpMetaEditor)?.loader).toEqual(editorLoader);
            });

            test('`editor.loader` может принимать строку', async () => {
                const original = new Meta();
                const result = original.editor('MetaUnit/_types/types/mock');
                await result.getEditor().load();
                expect(result.getEditor().component).toEqual(MockEditor);
            });

            test('сбрасывает `designtimeEditor.props`, если он не был задан', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const props = {};
                const original = new Meta({
                    designtimeEditor: {
                        loader: async () => {
                            return () => {
                                return null;
                            };
                        },
                        props,
                    },
                });
                const result = original.designtimeEditor(editorLoader);
                expect(original.getDesigntimeEditor()?.props).toEqual(props);
                expect(result).not.toEqual(original);
                expect(result.getDesigntimeEditor()?.props).toBeUndefined();
            });

            test('перезаписывает `designtimeEditor.props`', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const props = {};
                const original = new Meta();
                const result = original.designtimeEditor(editorLoader, props);
                expect(original.getDesigntimeEditor()?.props).toBeUndefined();
                expect(result).not.toEqual(original);
                expect(result.getDesigntimeEditor()?.props).toEqual(props);
            });
        });

        describe('editorProps()', () => {
            test('не создаёт новый экземпляр класса, если `designtimeEditor.props` не меняется', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const props = {};
                const original = new Meta({
                    designtimeEditor: { loader: editorLoader, props },
                });
                const result = original.designtimeEditorProps(props);
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с изменённым `designtimeEditor.props`', () => {
                const props = { a: 42, b: 69 };
                const original = new Meta({
                    designtimeEditor: {
                        loader: async () => {
                            return () => {
                                return null;
                            };
                        },
                    },
                });
                const result = original.designtimeEditorProps(props);
                expect(result).not.toEqual(original);
                expect(result.getDesigntimeEditor().props).toEqual(props);
            });

            test('добавляет свойство к ранее указанным', () => {
                const original = new Meta({
                    designtimeEditor: {
                        loader: async () => {
                            return () => {
                                return null;
                            };
                        },
                        props: { a: 42 },
                    },
                });
                const result = original.designtimeEditorProps({ b: 69 });
                expect(result).not.toEqual(original);
                expect(result.getDesigntimeEditor().props).toEqual({
                    a: 42,
                    b: 69,
                });
            });
        });

        describe('getEditor()', () => {
            test('возвращает редактор - экземпляр класса `ComponentLoaderWithProps`', () => {
                const loader = async () => {
                    return () => {
                        return null;
                    };
                };
                const props = {};
                const original = new Meta({ editor: { loader, props } });
                const result = original.getEditor();
                expect((result as TmpMetaEditor).loader).toEqual(loader);
                expect((result as TmpMetaEditor).props).toEqual(props);
            });
        });

        describe('required()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если тип обязателен', () => {
                const original = new Meta({ required: true });
                const result = original.required();
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с `required=true`', () => {
                const original = new Meta({ required: false });
                const result = original.required();
                expect(original.isRequired()).toEqual(false);
                expect(result).toBeInstanceOf(Meta);
                expect(result).not.toEqual(original);
                expect(result.isRequired()).toEqual(true);
            });
        });

        describe('optional()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если тип необязателен', () => {
                const original = new Meta({ required: false });
                const result = original.optional();
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta` с `required=false`', () => {
                const original = new Meta({ required: true });
                expect(original.isRequired()).toEqual(true);
                const result = original.optional();
                expect(result).toBeInstanceOf(Meta);
                expect(result).not.toEqual(original);
                expect(result.isRequired()).toEqual(false);
            });
        });

        describe('defaultValue()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если значение по-умолчанию не меняется', () => {
                const original = new Meta({ defaultValue: 42 });
                const result = original.defaultValue(42);
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta`, если меняется значение по-умолчанию', () => {
                const original = new Meta({ defaultValue: 42 });
                const result = original.defaultValue(69);
                expect(original.getDefaultValue()).toEqual(42);
                expect(result).not.toEqual(original);
                expect(result.getDefaultValue()).toEqual(69);
            });
        });

        describe('getDefaultValue()', () => {
            test('возвращает `defaultValue`', () => {
                const original = new Meta({ defaultValue: 42 });
                expect(original.getDefaultValue()).toEqual(42);
                (original as any)._defaultValue = 69;
                expect(original.getDefaultValue()).toEqual(69);
            });
        });

        describe('sampleData()', () => {
            test('не создаёт новый экземпляр класса `Meta`, если значение по-умолчанию не меняется', () => {
                const original = new Meta({ sampleData: { data: 42 } });
                const result = original.sampleData(42);
                expect(result).toEqual(original);
            });

            test('создаёт новый экземпляр класса `Meta`, если меняется значение по-умолчанию', () => {
                const original = new Meta({ sampleData: { data: 42 } });
                const result = original.sampleData(69);
                expect(original.getSampleData().data).toEqual(42);
                expect(result).not.toEqual(original);
                expect(result.getSampleData().data).toEqual(69);
            });
        });

        describe('getSampleData()', () => {
            test('возвращает `sampleData`', () => {
                const sample = { data: 42, importPath: 'Foo/Bar' };
                const original = new Meta({ sampleData: sample });
                expect(original.getSampleData()).toEqual(sample);
            });
        });

        describe('oneOf()', () => {
            test('не создаёт новый экземпляр', () => {
                const original = new Meta();
                const result = original.oneOf(['a', 'b']);
                expect(result).toEqual(original);
            });
        });
    });
});
