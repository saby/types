import { Meta, MetaClass, WidgetMeta } from 'Meta/types';
import { RightMode } from 'Meta/_types/marshalling/rightmode';
import { ObjectType } from 'Meta/_types/types';
import { TmpMetaEditor } from 'Meta/_types/components';

describe('Meta/_types/meta', () => {
    describe('WidgetMeta', () => {
        describe('constructor()', () => {
            test('использует параметры из аргумента', () => {
                const id = 'id1';
                const title = 'test';
                const description = 'test-description';
                const icon = 'test-icon';
                const category = 'test-category';
                const group = { name: 'test-group', uid: 'test-group-uid' };
                const order = 42;
                const rights = ['one', 'two'];
                const keywords = ['header', 'heading', 'h1'];

                const parent = 'path/to:parent';
                const preview = 'preview';
                const mode = RightMode.allNested;
                const editorLoader = async () => {
                    return () => {
                        return null;
                    };
                };
                const attr = ObjectType.id('attr');
                const result = new WidgetMeta({
                    is: MetaClass.widget,
                    id,
                    info: {
                        title,
                        description,
                        icon,
                        category,
                        group,
                        order,
                        hidden: true,
                    },
                    access: {
                        rights,
                        mode,
                    },
                    keywords,
                    parent,
                    preview,
                    editor: { loader: editorLoader },
                    //@ts-ignore
                    attributes: { attr },
                });
                expect(result.getId()).toEqual(id);
                expect(result.getTitle()).toEqual(title);
                expect(result.getDescription()).toEqual(description);
                expect(result.getGroup()).toEqual(group);
                expect(result.getIcon()).toEqual(icon);
                expect(result.getCategory()).toEqual(category);
                expect(result.getOrder()).toEqual(order);
                expect(result.getKeywords()).toEqual(keywords);
                expect(result.getParent()).toEqual(parent);
                expect(result.getPreview()).toEqual(preview);
                expect(result.isHidden()).toEqual(true);
                expect(result.getAccess().rights).toEqual(rights);
                expect(result.getAccess().mode).toEqual(mode);
                expect((result.getEditor() as TmpMetaEditor).loader).toEqual(editorLoader);
                expect(result.properties().attr.getId()).toEqual('attr');
            });

            test('устанавливает `rightmode` в значение по-умолчанию', () => {
                const result = new WidgetMeta({ is: MetaClass.widget });
                expect(result.getAccess().mode).toEqual(RightMode.any);
            });

            test('преобразует описание атрибутов в типы', () => {
                const result = new WidgetMeta({
                    is: MetaClass.widget,
                    id: '',
                    attributes: { a: {} },
                });
                expect(result.properties().a).toBeInstanceOf(Meta);
            });
        });

        describe('getId()', () => {
            test('возвращает идентификатор виджета', () => {
                const result = new WidgetMeta({
                    is: MetaClass.widget,
                    id: 'widget id',
                });
                expect(result.getId()).toEqual('widget id');
            });
        });

        describe('properties()', () => {
            test('возвращает текущие свойства виджета, если аргумент не задан', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new WidgetMeta({
                    is: MetaClass.widget,
                    attributes: { a, b },
                });
                expect(original.properties()).toEqual({ a, b });
            });

            test('создаёт новый экземпляр с обновлёнными свойствами', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new WidgetMeta({
                    is: MetaClass.widget,
                    attributes: { a },
                });
                const result = original.properties({ b });
                expect(original.properties()).toEqual({ a });
                expect(result).not.toEqual(original);
                expect(result.properties()).toEqual({ b });
            });
        });

        describe('access()', () => {
            test('создаёт новый экземпляр с обновлённым описанием прав доступа к виджету', () => {
                const rights = ['Account Manager'];
                const original = new WidgetMeta();
                const result = original.access(rights, RightMode.anyNested);
                expect(original.getAccess()).toEqual({
                    rights: undefined,
                    mode: RightMode.any,
                });
                expect(result).not.toEqual(original);
                expect(result.getAccess()).toEqual({
                    rights,
                    mode: RightMode.anyNested,
                });
            });
        });

        describe('getAccess()', () => {
            test('возвращает описание прав доступа к виджету', () => {
                const rights = ['Account Manager'];
                const original = new WidgetMeta({
                    is: MetaClass.widget,
                    access: { rights, mode: RightMode.allNested },
                });
                const result = original.getAccess();
                expect(result.rights).toEqual(rights);
                expect(result.mode).toEqual(RightMode.allNested);
            });
        });

        describe('relatedObjects', () => {
            describe('.getRelatedObjects()', () => {
                it('возвращаются связанные объекты в формате строки, переданные в конструктор', () => {
                    const relatedObjects = ['Employee'];
                    const original = new WidgetMeta({
                        is: MetaClass.widget,
                        relatedObjects,
                    });
                    const result = original.getRelatedObjects();
                    expect(result).toEqual(relatedObjects);
                });

                it('возвращаются связанные объекты в формате IRelatedObject, переданные в конструктор', () => {
                    const relatedObjects = [
                        {
                            type: 'Employee',
                            fields: ['FirstName'],
                        },
                    ];
                    const original = new WidgetMeta({
                        is: MetaClass.widget,
                        relatedObjects,
                    });
                    const result = original.getRelatedObjects();
                    expect(result).toEqual(relatedObjects);
                });
            });

            describe('.relatedObjects()', () => {
                it('устанавливаются связанные объекты в формате строки', () => {
                    const relatedObjects = ['Employee'];
                    const original = new WidgetMeta({
                        is: MetaClass.widget,
                    });
                    const result = original.relatedObjects(relatedObjects).getRelatedObjects();
                    expect(result).toEqual(relatedObjects);
                });

                it('устанавливаются связанные объекты в формате IRelatedObject', () => {
                    const relatedObjects = [
                        {
                            type: 'Employee',
                            fields: ['FirstName'],
                        },
                    ];
                    const original = new WidgetMeta({
                        is: MetaClass.widget,
                    });
                    const result = original.relatedObjects(relatedObjects).getRelatedObjects();
                    expect(result).toEqual(relatedObjects);
                });
            });
        });
    });
});
