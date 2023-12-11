import { expect } from 'chai';
import {
    ArrayType,
    StringType,
    NumberType,
    DateType,
    ObjectType,
    WidgetType,
} from 'Types/meta';
import {
    convertValueOfMeta,
    findConvertableTypes,
    isEqual as metaIsEqual,
} from 'Types/reflect';
import { isEqual } from 'Types/object';

const commonRequiredAttrs = {
    name: StringType.required(),
    age: NumberType.required(),
};

const widget1 = WidgetType.id('Test/widgetType1').attributes({
    ...commonRequiredAttrs,
    size: NumberType.optional(),
});
const widget2 = WidgetType.id('Test/widgetType2').attributes({
    ...commonRequiredAttrs,
    length: NumberType.optional(),
});
const widget3 = WidgetType.id('Test/widgetType3').attributes({
    color: StringType.optional(),
});
const widget4 = WidgetType.id('Test/widgetType4').attributes({
    name: StringType.optional(),
    age: NumberType.optional(),
    length: NumberType.optional(),
});
const widgetWithArray1 = WidgetType.id('Types/widgetWithArray').attributes({
    name: StringType,
    options: ArrayType.of(widget1),
});

// Additional widgets
const layoutWidget = WidgetType.id('Types/layoutWidget').attributes({
    children: WidgetType, // Может получить любой виджет в качестве дочернего
});

const richWidget1 = WidgetType.id('Types/richWidget1').attributes({
    children: WidgetType.attributes({
        ...commonRequiredAttrs,
        size: NumberType.optional(),
    }), // Widget interface
});

const richWidget2 = WidgetType.id('Types/richWidget2').attributes({
    children: WidgetType.attributes({
        ...commonRequiredAttrs,
        length: NumberType.optional(),
    }), // Widget interface
});

const itemWrappedRichWidget = WidgetType.id('Type/itemWrappedRichWidget').attributes({
    children: WidgetType.id('Type/itemWrappedRichWidget/item').attributes({
        children: WidgetType.attributes({
            ...commonRequiredAttrs,
            size: NumberType.optional(),
        }), // Widget interface,
    }),
});

const richListWidget = WidgetType.id('Type/richListWidget').attributes({
    items: ArrayType.of(
        WidgetType.attributes({
            ...commonRequiredAttrs,
            size: NumberType.optional(),
        })
    ), // Widget interface
});

const itemsWrappedListWidget = WidgetType.id('Type/itemsWrappedListWidget').attributes({
    items: ArrayType.of(
        WidgetType.id('Type/itemsWrappedListWidget/item').attributes({
            children: WidgetType.attributes({
                ...commonRequiredAttrs,
                size: NumberType.optional(),
            }),
        })
    ),
});

const richMetaStore = [
    layoutWidget,
    richWidget1,
    richWidget2,
    itemWrappedRichWidget,
    richListWidget,
    itemsWrappedListWidget,
];

const MetaStore = [widget1, widget2, widget3, widget4, widgetWithArray1];

describe('Types/_meta/conversion', () => {
    describe('Conversion', () => {
        describe('isEqual()', () => {
            it('Сравнение примитивов', () => {
                expect(metaIsEqual(StringType, StringType)).equal(true);
                expect(metaIsEqual(StringType, NumberType)).equal(false);
                expect(metaIsEqual(StringType, DateType)).equal(false);
                expect(metaIsEqual(StringType, ObjectType)).equal(false);
                expect(metaIsEqual(ObjectType, StringType)).equal(false);
            });
            it('Сравнение сложных типов', () => {
                const meta1 = ObjectType.id('Test/objectType1').attributes({
                    attr1: StringType,
                    attr2: NumberType,
                });
                const meta2 = ObjectType.id('Test/objectType2').attributes({
                    attr1: StringType,
                    attr2: NumberType,
                });
                const meta3 = ObjectType.id('Test/objectType3').attributes({
                    attr1: StringType,
                    attr2: StringType,
                });
                const meta4 = ObjectType.id('Test/objectType4').attributes({
                    attr1: StringType,
                    attr3: NumberType,
                });
                const meta5 = ObjectType.id('Test/objectType5').attributes({
                    richAttr: ObjectType.attributes({
                        attr1: StringType,
                    }),
                });
                const meta6 = ObjectType.id('Test/objectType6').attributes({
                    richAttr: ObjectType.attributes({
                        attr1: StringType,
                    }),
                });
                const meta7 = ObjectType.id('Test/objectType7').attributes({
                    richAttr: ObjectType.attributes({
                        attr1: NumberType,
                    }),
                });

                expect(metaIsEqual(meta1, meta2)).equal(true);
                expect(metaIsEqual(meta1, meta1)).equal(true);
                expect(metaIsEqual(meta1, meta3)).equal(false);
                expect(metaIsEqual(meta1, meta4)).equal(false);
                expect(metaIsEqual(meta3, meta4)).equal(false);
                expect(metaIsEqual(meta5, meta6)).equal(true);
                expect(metaIsEqual(meta6, meta7)).equal(false);
                expect(metaIsEqual(WidgetType, meta1)).equal(false);
                expect(WidgetType.getBaseType()).equal('widget');
                expect(widget1.getBaseType()).equal('widget');
            });
        });
        describe('findConvertableTypes()', () => {
            it('Поиск доступных для конвертации мета-типов (тривиальная конвертируемость)', () => {
                const widget1ConvertableTypes = findConvertableTypes(widget1, MetaStore);
                const widget2ConvertableTypes = findConvertableTypes(widget2, MetaStore);
                const widget3ConvertableTypes = findConvertableTypes(widget3, MetaStore);
                const widget4ConvertableTypes = findConvertableTypes(widget4, MetaStore);
                const widgetArrayConvertableTypes = findConvertableTypes(
                    [widget4, widget4, widget4],
                    MetaStore
                );
                const widget3CustomConvertableTypes = findConvertableTypes(
                    widget3,
                    MetaStore,
                    (ms, mt) => mt.getId() === 'Test/widgetType1'
                );

                expect(
                    !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                ).equal(true);
                expect(
                    !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                ).equal(true);
                expect(
                    !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                ).equal(true);
                expect(
                    !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                ).equal(true);
                expect(
                    !!widget1ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                ).equal(true);

                expect(
                    !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                ).equal(true);
                expect(
                    !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                ).equal(true);
                expect(
                    !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                ).equal(true);
                expect(
                    !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                ).equal(true);
                expect(
                    !!widget2ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                ).equal(true);

                expect(
                    !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                ).equal(false);
                expect(
                    !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                ).equal(false);
                expect(
                    !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                ).equal(true);
                expect(
                    !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                ).equal(true);
                expect(
                    !!widget3ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                ).equal(false);

                expect(
                    !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                ).equal(true);
                expect(
                    !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                ).equal(true);
                expect(
                    !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                ).equal(true);
                expect(
                    !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                ).equal(true);
                expect(
                    !!widget4ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                ).equal(true);

                expect(
                    !!widget3CustomConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                ).equal(true);
                expect(
                    !!widget3CustomConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                ).equal(false);
                expect(
                    !!widget3CustomConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                ).equal(false);
                expect(
                    !!widget3CustomConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                ).equal(false);
                expect(
                    !!widget3CustomConvertableTypes.find(
                        (w) => w.getId() === 'Types/widgetWithArray'
                    )
                ).equal(false);

                expect(
                    !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                ).equal(true);
                expect(
                    !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                ).equal(true);
                expect(
                    !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                ).equal(true);
                expect(
                    !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                ).equal(true);
                expect(
                    !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                ).equal(true);
            });
            it('Поиск доступных для конвертации мета-типов (глубокая конвертируемость)', () => {
                const widget1RichConvertableTypes = findConvertableTypes(widget1, richMetaStore);
                const widget3RichConvertableTypes = findConvertableTypes(widget3, richMetaStore);

                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Types/layoutWidget')
                ).equal(true);
                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget1')
                ).equal(true);
                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget2')
                ).equal(true);
                expect(
                    !!widget1RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemWrappedRichWidget'
                    )
                ).equal(true);
                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Type/richListWidget')
                ).equal(true);
                expect(
                    !!widget1RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemsWrappedListWidget'
                    )
                ).equal(true);

                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Types/layoutWidget')
                ).equal(true);
                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget1')
                ).equal(false);
                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget2')
                ).equal(false);
                expect(
                    !!widget3RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemWrappedRichWidget'
                    )
                ).equal(false);
                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Type/richListWidget')
                ).equal(false);
                expect(
                    !!widget3RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemsWrappedListWidget'
                    )
                ).equal(false);
            });
        });
        describe('convertValueOfMeta()', () => {
            it('Конвертация мета-типов', () => {
                const widget1Val = {
                    name: 'Vlad',
                    age: 30,
                    size: 10,
                };
                const widget2Val = {
                    name: 'Ivan',
                    age: 20,
                    length: 15,
                };
                const widget3Val = {
                    color: 'red',
                };
                const widget4Val = {
                    name: 'Max',
                    age: 25,
                    length: 9,
                };

                expect(
                    isEqual(convertValueOfMeta(widget1Val, widget1, widget2), {
                        name: 'Vlad',
                        age: 30,
                    })
                ).equal(true);

                expect(isEqual(convertValueOfMeta(widget1Val, widget1, widget1), widget1Val)).equal(
                    true
                );

                expect(
                    isEqual(convertValueOfMeta(widget1Val, widget1, widget4), {
                        name: 'Vlad',
                        age: 30,
                    })
                ).equal(true);

                expect(
                    isEqual(convertValueOfMeta(widget2Val, widget2, widget1), {
                        name: 'Ivan',
                        age: 20,
                    })
                ).equal(true);

                expect(isEqual(convertValueOfMeta(widget3Val, widget3, widget4), {})).equal(true);

                expect(
                    isEqual(convertValueOfMeta(widget4Val, widget4, widget1), {
                        name: 'Max',
                        age: 25,
                    })
                ).equal(true);
            });
        });
    });
});
