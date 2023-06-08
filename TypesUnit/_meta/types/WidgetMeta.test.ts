import { expect } from 'chai';
import { Meta, MetaClass, WidgetMeta } from 'Types/meta';
import { RightMode } from 'Types/_meta/widget';
import { ObjectType } from 'Types/_meta/types';

describe('Types/_meta/meta', () => {
    describe('WidgetMeta', () => {
        describe('constructor()', () => {
            it('использует параметры из аргумента', () => {
                const id = 'id1';
                const title = 'test';
                const description = 'test-description';
                const icon = 'test-icon';
                const category = 'test-category';
                const group = { name: 'test-group', uid: 'test-group-uid' };
                const order = 42;
                const rights = ['one', 'two'];
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
                    editor: { loader: editorLoader },
                    attributes: { attr },
                });
                expect(result.getId()).equal(id);
                expect(result.getTitle()).equal(title);
                expect(result.getDescription()).equal(description);
                expect(result.getGroup()).equal(group);
                expect(result.getIcon()).equal(icon);
                expect(result.getCategory()).equal(category);
                expect(result.getOrder()).equal(order);
                expect(result.isHidden()).equal(true);
                expect(result.getAccess().rights).equal(rights);
                expect(result.getAccess().mode).equal(mode);
                expect(result.getEditor().loader).equal(editorLoader);
                expect(result.attributes().attr.getId()).equal('attr');
            });

            it('устанавливает `rightmode` в значение по-умолчанию', () => {
                const result = new WidgetMeta({ is: MetaClass.widget });
                expect(result.getAccess().mode).equal(RightMode.any);
            });

            it('преобразует описание атрибутов в типы', () => {
                const result = new WidgetMeta({
                    is: MetaClass.widget,
                    id: '',
                    attributes: { a: {} },
                });
                expect(result.attributes().a).instanceOf(Meta);
            });
        });

        describe('getId()', () => {
            it('возвращает идентификатор виджета', () => {
                const result = new WidgetMeta({
                    is: MetaClass.widget,
                    id: 'widget id',
                });
                expect(result.getId()).equal('widget id');
            });
        });

        describe('attributes()', () => {
            it('возвращает текущие свойства виджета, если аргумент не задан', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new WidgetMeta({
                    is: MetaClass.widget,
                    attributes: { a, b },
                });
                expect(original.attributes()).deep.equal({ a, b });
            });

            it('создаёт новый экземпляр с обновлёнными свойствами', () => {
                const a = new Meta();
                const b = new Meta();
                const original = new WidgetMeta({
                    is: MetaClass.widget,
                    attributes: { a },
                });
                const result = original.attributes({ b });
                expect(original.attributes()).deep.equal({ a });
                expect(result).not.equal(original);
                expect(result.attributes()).deep.equal({ b });
            });
        });

        describe('access()', () => {
            it('создаёт новый экземпляр с обновлённым описанием прав доступа к виджету', () => {
                const rights = ['Account Manager'];
                const original = new WidgetMeta();
                const result = original.access(rights, RightMode.anyNested);
                expect(original.getAccess()).deep.equal({
                    rights: undefined,
                    mode: RightMode.any,
                });
                expect(result).not.equal(original);
                expect(result.getAccess()).deep.equal({
                    rights,
                    mode: RightMode.anyNested,
                });
            });
        });

        describe('getAccess()', () => {
            it('возвращает описание прав доступа к виджету', () => {
                const rights = ['Account Manager'];
                const original = new WidgetMeta({
                    is: MetaClass.widget,
                    access: { rights, mode: RightMode.allNested },
                });
                const result = original.getAccess();
                expect(result.rights).equal(rights);
                expect(result.mode).equal(RightMode.allNested);
            });
        });
    });
});
