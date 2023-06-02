import { expect } from 'chai';
import { ComponentLoaderWithProps } from 'Types/_meta/components';
import { Meta, MetaClass } from 'Types/_meta/baseMeta';

describe('Types/_meta/baseMeta', () => {
    describe('Meta', () => {
        describe('constructor()', () => {
            it('использует параметры из аргумента', () => {
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
                expect(result.getId()).equal('constructor1');
                expect(result.getCategory()).equal('cat');
                expect(result.getGroup().name).equal('test-group');
                expect(result.getGroup().uid).equal('test-group-uid');
                expect(result.getOrder()).equal(42);
                expect(result.getIcon()).equal('i');
                expect(result.getTitle()).equal('Aaa');
                expect(result.getDescription()).equal('Done');
                expect(result.isOptional()).equal(true);
                expect(result.isHidden()).equal(true);
                expect(result.isDisabled()).equal(true);
                expect((result as any)._inherits).equal(inherits);
                expect(result.getDefaultValue()).equal('Tensor');
                expect(result.getEditor()?.loader).equal(editorLoader);
            });

            it('преобразует отсутствующий `id` пустую строку', () => {
                const result = new Meta();
                expect(result.getId()).equal('');
            });

            it('по-умолчанию устанавливает `required=true`', () => {
                const result = new Meta();
                expect(result.isRequired()).equal(true);
            });
        });

        describe('toDescriptor()', () => {
            it('преобразует тип в мета-описание', () => {
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
                expect(result.is).equal(MetaClass.primitive);
                expect(result.id).equal('toDescriptor1');
                expect(result.info.category).equal('cat');
                expect(result.info.group).deep.equal(group);
                expect(result.info.order).equal(42);
                expect(result.info.icon).equal('i');
                expect(result.info.title).equal('Aaa');
                expect(result.info.description).equal('Done');
                expect(result.info.hidden).equal(true);
                expect(result.info.disabled).equal(true);
                expect(result.required).equal(false);
                expect(result.inherits).equal(inherits);
                expect(result.defaultValue).equal('Tensor');
                expect(result.editor.loader).equal(editorLoader);
            });
        });

        describe('clone()', () => {
            it('копирует все данные', () => {
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
                    id: 'clone1',
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
                const result = original.clone();
                expect(result).instanceOf(Meta);
                expect(result).not.equal(original);
                expect(result.isRequired()).equal(false);
                expect(result.isHidden()).equal(true);
                expect(result.isDisabled()).equal(true);
                expect(result.getGroup()).equal(group);
                expect(result.getCategory()).equal('cat');
                expect(result.getIcon()).equal('i');
                expect(result.getOrder()).equal(42);
                expect(result.getTitle()).equal('Aaa');
                expect(result.getDescription()).equal('Done');
                // TODO это проблема логики мета. Эта штука нужна для выбора редактора
                expect((result as any)._inherits).equal(inherits);
                expect(result.getDefaultValue()).equal('Tensor');
                expect(result.getEditor()?.loader).equal(editorLoader);
            });

            it('при fixedId сохраняет id', () => {
                const original = new Meta({
                    id: 'clone1',
                    fixedId: true,
                });

                const result = original.clone();
                expect(result.getId()).equal('clone1');
            });

            it('базовый id сохраняется в inherits при клонировании', () => {
                const baseId = 'base-id-1';
                const original = new Meta({
                    id: baseId
                });

                const result = original.clone();
                expect(result.getId()).not.equal(baseId);
                // TODO это проблема логики мета. Эта штука нужна для выбора редактора
                expect((result as any)._inherits.length).equal(1);
                expect((result as any)._inherits[0]).equal(baseId);
            });

            it('обновляет переданные параметры', () => {
                const original = new Meta({ defaultValue: 'Google' });
                const result = original.clone({ defaultValue: 'Tensor' });
                expect(original.getDefaultValue()).equal('Google');
                expect(result).not.equal(original);
                expect(result.getDefaultValue()).equal('Tensor');
            });
        });

        describe('id()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если `id` не меняется', () => {
                const original = new Meta({ id: 'setId1' });
                const result = original.id('setId1');
                expect(result).equal(original);
            });

            it('отслеживает циклическое наследование', () => {
                const original = new Meta({
                    id: 'setId2',
                    inherits: ['setId3', 'setId4'],
                });
                expect(() => {
                    return original.id('setId4');
                }).to.throws('Циклическое наследование недопустимо');
            });

            it('возвращает новый экземпляр класса `Meta` с изменённым `id`', () => {
                const original = new Meta({ id: 'setId5' });
                const result = original.id('setId6');
                expect(original.getId()).equal('setId5');
                expect(result).not.equal(original);
                expect(result.getId()).equal('setId6');
            });

            it('обновляет значение `inherits` у нового экземпляра класса `Meta`', () => {
                const original = new Meta({ id: 'setId10' });
                const result = original.id('setId11').id('setId12');
                expect((original as any)._inherits).equal(undefined);
                expect(result).not.equal(original);
                expect(result.getId()).equal('setId12');
                expect((result as any)._inherits).deep.equal([
                    'setId10',
                    'setId11',
                ]);
            });
        });

        describe('getId()', () => {
            it('возвращает идентификатор', () => {
                const result = new Meta({ id: 'this is id' });
                expect(result.getId()).equal('this is id');
            });
        });

        describe('category()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если `category` не меняется', () => {
                const original = new Meta({ info: { category: 'ok' } });
                const result = original.category('ok');
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым значением `category`', () => {
                const original = new Meta({ info: { category: 'one' } });
                const result = original.category('two');
                expect(original.getCategory()).equal('one');
                expect(result).not.equal(original);
                expect(result.getCategory()).equal('two');
            });
        });

        describe('getCategory()', () => {
            it('возвращает название категории', () => {
                const result = new Meta({ info: { category: 'cat' } });
                expect(result.getCategory()).equal('cat');
            });
        });

        describe('group()', () => {
            it('можно задать `group`', () => {
                const groupUid = 'test-group-uid';
                const original = new Meta({ });
                expect(original.group(groupUid).getGroup().uid).equal(groupUid);
            });

            it('не создаёт новый экземпляр класса `Meta`, если `group` не меняется', () => {
                const group = { name: 'test-group-uid', uid: 'test-group-uid' };
                const original = new Meta({ info: { group } });
                const result = original.group('test-group-uid');
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым значением `group`', () => {
                const group = { name: 'test-group-uid', uid: 'test-group-uid' };
                const groupTwoUid = 'two';
                const original = new Meta({ info: { group } });
                const result = original.group(groupTwoUid);
                expect(original.getGroup()).deep.equal(group);
                expect(result).not.equal(original);
                expect(result.getGroup()).deep.equal({ name: groupTwoUid, uid: groupTwoUid });
            });
        });

        describe('getGroup()', () => {
            it('возвращает название группы', () => {
                const group = { name: 'test-group-uid', uid: 'test-group-uid' };
                const result = new Meta({ info: { group } });
                expect(result.getGroup().name).equal('test-group-uid');
            });
        });

        describe('title()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если `title` не меняется', () => {
                const original = new Meta({ info: { title: 'ok' } });
                const result = original.title('ok');
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым `title`', () => {
                const original = new Meta({ info: { title: 'one' } });
                const result = original.title('two');
                expect(original.getTitle()).equal('one');
                expect(result).not.equal(original);
                expect(result.getTitle()).equal('two');
            });
        });

        describe('getTitle()', () => {
            it('возвращает название свойства', () => {
                const result = new Meta({ info: { title: 'Ttl' } });
                expect(result.getTitle()).equal('Ttl');
            });
        });

        describe('description()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если `description` не меняется', () => {
                const original = new Meta({ info: { description: 'ok' } });
                const result = original.description('ok');
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым `description`', () => {
                const original = new Meta({ info: { description: 'one' } });
                const result = original.description('two');
                expect(original.getDescription()).equal('one');
                expect(result).not.equal(original);
                expect(result.getDescription()).equal('two');
            });
        });

        describe('icon()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если `icon` не меняется', () => {
                const original = new Meta({ info: { icon: 'user' } });
                const result = original.icon('user');
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым `icon`', () => {
                const original = new Meta({ info: { icon: 'user' } });
                const result = original.icon('shop');
                expect(original.getIcon()).equal('user');
                expect(result).not.equal(original);
                expect(result.getIcon()).equal('shop');
            });
        });

        describe('getIcon()', () => {
            it('возвращает иконку', () => {
                const result = new Meta({ info: { icon: 'icn' } });
                expect(result.getIcon()).equal('icn');
            });
        });

        describe('order()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если `order` не меняется', () => {
                const original = new Meta({ info: { order: 42 } });
                const result = original.order(42);
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым `order`', () => {
                const original = new Meta({ info: { order: 42 } });
                const result = original.order(69);
                expect(original.getOrder()).equal(42);
                expect(result).not.equal(original);
                expect(result.getOrder()).equal(69);
            });
        });

        describe('getOrder()', () => {
            it('возвращает порядковый номер', () => {
                const result = new Meta({ info: { order: 42 } });
                expect(result.getOrder()).equal(42);
            });
        });

        describe('hidden()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если тип скрыт', () => {
                const original = new Meta({ info: { hidden: true } });
                const result = original.hidden();
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с `hidden=true`', () => {
                const original = new Meta();
                const result = original.hidden();
                expect(original.isVisible()).equal(true);
                expect(result).not.equal(original);
                expect(result.isHidden()).equal(true);
            });
        });

        describe('visible()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если тип не скрыт', () => {
                const original = new Meta();
                const result = original.visible();
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с `hidden=undefined`', () => {
                const original = new Meta({ info: { hidden: true } });
                const result = original.visible();
                expect(original.isHidden()).equal(true);
                expect(result).not.equal(original);
                expect(result.isVisible()).equal(true);
            });
        });

        describe('is()', () => {
            it('возвращает `true`, если проверяется тот же тип', () => {
                const result = new Meta({ id: 'parent' });
                expect(result.is({ id: 'parent' })).equal(true);
            });
            it('возвращает `true`, если тип наследует родителя', () => {
                const parent = new Meta({ id: 'parent' });
                const result = new Meta({ inherits: ['some', 'parent'] });
                expect(result.is(parent)).equal(true);
            });
            it('возвращает `false`, если тип не наследует родителя', () => {
                const parent = new Meta({ id: 'parent' });
                const result = new Meta({ inherits: ['some'] });
                expect(result.is(parent)).equal(false);
            });
            it('возвращает `false`, если `inherits` не задан', () => {
                const parent = new Meta({ id: 'parent' });
                const result = new Meta({});
                expect(result.is(parent)).equal(false);
            });
        });

        describe('getEditor()', () => {
            it('возвращает экземпляр класса `ComponentLoaderWithProps`', () => {
                const result = new Meta({ editor: {} });
                expect(result.getEditor()).instanceOf(ComponentLoaderWithProps);
            });
        });

        describe('editor()', () => {
            it('не создаёт новый экземпляр класса, если `editor.loader` не меняется', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const original = new Meta({ editor: { loader: editorLoader } });
                const result = original.editor(editorLoader);
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым `editor.loader`', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const original = new Meta();
                const result = original.editor(editorLoader);
                expect(result).not.equal(original);
                expect(result.getEditor()?.loader).equal(editorLoader);
            });

            it('сбрасывает `designtimeEditor.props`, если он не был задан', () => {
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
                expect(original.getDesigntimeEditor()?.props).equal(props);
                expect(result).not.equal(original);
                expect(result.getDesigntimeEditor()?.props).equal(undefined);
            });

            it('перезаписывает `designtimeEditor.props`', () => {
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const props = {};
                const original = new Meta();
                const result = original.designtimeEditor(editorLoader, props);
                expect(original.getDesigntimeEditor()?.props).equal(undefined);
                expect(result).not.equal(original);
                expect(result.getDesigntimeEditor()?.props).equal(props);
            });
        });

        describe('editorProps()', () => {
            it('не создаёт новый экземпляр класса, если `designtimeEditor.props` не меняется', () => {
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
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с изменённым `designtimeEditor.props`', () => {
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
                expect(result).not.equal(original);
                expect(result.getDesigntimeEditor().props).deep.equal(props);
            });

            it('добавляет свойство к ранее указанным', () => {
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
                expect(result).not.equal(original);
                expect(result.getDesigntimeEditor().props).deep.equal({
                    a: 42,
                    b: 69,
                });
            });
        });

        describe('getEditor()', () => {
            it('возвращает редактор - экземпляр класса `ComponentLoaderWithProps`', () => {
                const loader = async () => {
                    return () => {
                        return null;
                    };
                };
                const props = {};
                const original = new Meta({ editor: { loader, props } });
                const result = original.getEditor();
                expect(result).instanceOf(ComponentLoaderWithProps);
                expect(result.loader).equal(loader);
                expect(result.props).equal(props);
            });
        });

        describe('required()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если тип обязателен', () => {
                const original = new Meta({ required: true });
                const result = original.required();
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с `required=true`', () => {
                const original = new Meta({ required: false });
                const result = original.required();
                expect(original.isRequired()).equal(false);
                expect(result).instanceOf(Meta);
                expect(result).not.equal(original);
                expect(result.isRequired()).equal(true);
            });
        });

        describe('optional()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если тип необязателен', () => {
                const original = new Meta({ required: false });
                const result = original.optional();
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta` с `required=false`', () => {
                const original = new Meta({ required: true });
                expect(original.isRequired()).equal(true);
                const result = original.optional();
                expect(result).instanceOf(Meta);
                expect(result).not.equal(original);
                expect(result.isRequired()).equal(false);
            });
        });

        describe('defaultValue()', () => {
            it('не создаёт новый экземпляр класса `Meta`, если значение по-умолчанию не меняется', () => {
                const original = new Meta({ defaultValue: 42 });
                const result = original.defaultValue(42);
                expect(result).equal(original);
            });

            it('создаёт новый экземпляр класса `Meta`, если меняется значение по-умолчанию', () => {
                const original = new Meta({ defaultValue: 42 });
                const result = original.defaultValue(69);
                expect(original.getDefaultValue()).equal(42);
                expect(result).not.equal(original);
                expect(result.getDefaultValue()).equal(69);
            });
        });

        describe('getDefaultValue()', () => {
            it('возвращает `defaultValue`', () => {
                const original = new Meta({ defaultValue: 42 });
                expect(original.getDefaultValue()).equal(42);
                (original as any)._defaultValue = 69;
                expect(original.getDefaultValue()).equal(69);
            });
        });

        describe('oneOf()', () => {
            it('не создаёт новый экземпляр', () => {
                const original = new Meta();
                const result = original.oneOf(['a', 'b']);
                expect(result).equal(original);
            });
        });
    });
});
