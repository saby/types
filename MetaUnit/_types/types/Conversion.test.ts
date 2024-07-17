import { expect } from 'chai';
import { ArrayType, StringType, NumberType, DateType, ObjectType, WidgetType } from 'Meta/types';
import {
    convertValueOfMeta,
    findConvertableTypes,
    isEqual as metaIsEqual,
} from 'Meta/conversion/reflect';
import { isEqual } from 'Types/object';

const commonRequiredAttrs = {
    name: StringType.required(),
    age: NumberType.required(),
};

const widget1 = WidgetType.id('Test/widgetType1').properties({
    ...commonRequiredAttrs,
    size: NumberType.optional(),
});
const widget2 = WidgetType.id('Test/widgetType2').properties({
    ...commonRequiredAttrs,
    length: NumberType.optional(),
});
const widget3 = WidgetType.id('Test/widgetType3').properties({
    color: StringType.optional(),
});
const widget4 = WidgetType.id('Test/widgetType4').properties({
    name: StringType.optional(),
    age: NumberType.optional(),
    length: NumberType.optional(),
});
const widget1convertable = WidgetType.id('Test/widgetConvertableType1')
    .properties({
        ...commonRequiredAttrs,
        size: NumberType.optional(),
    })
    .isValueConvertable('MetaUnit/_types/types/converterMock');
const widget2convertable = WidgetType.id('Test/widgetConvertableType2')
    .properties({
        ...commonRequiredAttrs,
        length: NumberType.optional(),
    })
    .isValueConvertable('MetaUnit/_types/types/converterMock');
const widget3convertable = WidgetType.id('Test/widgetConvertableType3')
    .properties({
        color: StringType.optional(),
    })
    .isValueConvertable('MetaUnit/_types/types/converterMock');
const widget4convertable = WidgetType.id('Test/widgetConvertableType4')
    .properties({
        name: StringType.optional(),
        age: NumberType.optional(),
        length: NumberType.optional(),
    })
    .isValueConvertable('MetaUnit/_types/types/converterMock');
const widgetWithArray1 = WidgetType.id('Types/widgetWithArray').properties({
    name: StringType,
    options: ArrayType.of(widget1),
});

// Additional widgets
const layoutWidget = WidgetType.id('Types/layoutWidget').properties({
    children: WidgetType, // Может получить любой виджет в качестве дочернего
});

const richWidget1 = WidgetType.id('Types/richWidget1').properties({
    children: WidgetType.properties({
        ...commonRequiredAttrs,
        size: NumberType.optional(),
    }), // Widget interface
});

const richWidget2 = WidgetType.id('Types/richWidget2').properties({
    children: WidgetType.properties({
        ...commonRequiredAttrs,
        length: NumberType.optional(),
    }), // Widget interface
});

const itemWrappedRichWidget = WidgetType.id('Type/itemWrappedRichWidget').properties({
    children: WidgetType.id('Type/itemWrappedRichWidget/item').properties({
        children: WidgetType.properties({
            ...commonRequiredAttrs,
            size: NumberType.optional(),
        }), // Widget interface,
    }),
});

const richListWidget = WidgetType.id('Type/richListWidget').properties({
    items: ArrayType.of(
        WidgetType.properties({
            ...commonRequiredAttrs,
            size: NumberType.optional(),
        })
    ), // Widget interface
});

const itemsWrappedListWidget = WidgetType.id('Type/itemsWrappedListWidget').properties({
    items: ArrayType.of(
        WidgetType.id('Type/itemsWrappedListWidget/item').properties({
            children: WidgetType.properties({
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

const MetaStore = [
    widget1,
    widget2,
    widget3,
    widget4,
    widget1convertable,
    widget2convertable,
    widget3convertable,
    widget4convertable,
    widgetWithArray1,
];

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
                const meta1 = ObjectType.id('Test/objectType1').properties({
                    attr1: StringType,
                    attr2: NumberType,
                });
                const meta2 = ObjectType.id('Test/objectType2').properties({
                    attr1: StringType,
                    attr2: NumberType,
                });
                const meta3 = ObjectType.id('Test/objectType3').properties({
                    attr1: StringType,
                    attr2: StringType,
                });
                const meta4 = ObjectType.id('Test/objectType4').properties({
                    attr1: StringType,
                    attr3: NumberType,
                });
                const meta5 = ObjectType.id('Test/objectType5').properties({
                    richAttr: ObjectType.properties({
                        attr1: StringType,
                    }),
                });
                const meta6 = ObjectType.id('Test/objectType6').properties({
                    richAttr: ObjectType.properties({
                        attr1: StringType,
                    }),
                });
                const meta7 = ObjectType.id('Test/objectType7').properties({
                    richAttr: ObjectType.properties({
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
            describe('Поиск доступных для конвертации мета-типов (тривиальная конвертируемость)', async () => {
                const widget1ConvertableTypes = await findConvertableTypes(widget1, MetaStore);
                const widget2ConvertableTypes = await findConvertableTypes(widget2, MetaStore);
                const widget3ConvertableTypes = await findConvertableTypes(widget3, MetaStore);
                const widget4ConvertableTypes = await findConvertableTypes(widget4, MetaStore);
                const widget1convertableConvertableTypes = await findConvertableTypes(
                    widget1convertable,
                    MetaStore
                );
                const widget2convertableConvertableTypes = await findConvertableTypes(
                    widget2convertable,
                    MetaStore
                );
                const widget3convertableConvertableTypes = await findConvertableTypes(
                    widget3convertable,
                    MetaStore
                );
                const widget4convertableConvertableTypes = await findConvertableTypes(
                    widget4convertable,
                    MetaStore
                );
                const widgetArrayConvertableTypes = await findConvertableTypes(
                    [widget4, widget4, widget4],
                    MetaStore
                );
                const widget3CustomConvertableTypes = await findConvertableTypes(
                    widget3,
                    MetaStore,
                    (ms, mt) => mt.getId() === 'Test/widgetType1'
                );

                it('Конвертация widget1 в widget1', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).equal(true);
                });

                it('Конвертация widget1 в widget2', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).equal(true);
                });

                it('Конвертация widget1 в widget3', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).equal(false);
                });

                it('Конвертация widget1 в widget4', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).equal(false);
                });

                it('Конвертация widget1 в widgetArray', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).equal(true);
                });

                it('Конвертация widget2 в widget1', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).equal(true);
                });

                it('Конвертация widget2 в widget2', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).equal(true);
                });

                it('Конвертация widget2 в widget3', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).equal(false);
                });

                it('Конвертация widget2 в widget4', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).equal(true);
                });

                it('Конвертация widget2 в widgetArray', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).equal(true);
                });

                it('Конвертация widget3 в widget1', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).equal(false);
                });

                it('Конвертация widget3 в widget2', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).equal(false);
                });

                it('Конвертация widget3 в widget3', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).equal(true);
                });

                it('Конвертация widget3 в widget4', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).equal(false);
                });

                it('Конвертация widget3 в widgetArray', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).equal(false);
                });

                it('Конвертация widget4 в widget1', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).equal(true);
                });

                it('Конвертация widget4 в widget2', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).equal(true);
                });

                it('Конвертация widget4 в widget3', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).equal(false);
                });

                it('Конвертация widget4 в widget4', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).equal(true);
                });

                it('Конвертация widget4 в widgetArray', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).equal(true);
                });

                it('Конвертация widget3custom в widget1', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType1'
                        )
                    ).equal(true);
                });

                it('Конвертация widget3custom в widget1', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).equal(true);
                });

                it('Конвертация widget3custom в widget2', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType2'
                        )
                    ).equal(false);
                });

                it('Конвертация widget3custom в widget3', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType3'
                        )
                    ).equal(false);
                });

                it('Конвертация widget3custom в widget4', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType4'
                        )
                    ).equal(false);
                });

                it('Конвертация widget3custom в widgetArray', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetWithArray'
                        )
                    ).equal(false);
                });

                it('Конвертация widgetArray в widget1', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).equal(true);
                });

                it('Конвертация widgetArray в widget2', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).equal(true);
                });

                it('Конвертация widgetArray в widget3', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).equal(false);
                });

                it('Конвертация widgetArray в widget4', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).equal(true);
                });

                it('Конвертация widgetArray в widgetArray', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetWithArray'
                        )
                    ).equal(true);
                });

                it('Конвертация widget1convertableConvertableTypes в widget3', () => {
                    expect(
                        !!widget1convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType3'
                        )
                    ).equal(true);
                });

                it('Конвертация widget1convertableConvertableTypes в widget4', async () => {
                    expect(
                        !!widget1convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType4'
                        )
                    ).equal(true);
                });

                it('Конвертация widget2convertableConvertableTypes в widget3', async () => {
                    expect(
                        !!widget2convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType3'
                        )
                    ).equal(true);
                });

                it('Конвертация widget3convertableConvertableTypes в widget1', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType1'
                        )
                    ).equal(true);
                });

                it('Конвертация widget3convertableConvertableTypes в widget2', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType2'
                        )
                    ).equal(false);
                });

                it('Конвертация widget3convertableConvertableTypes в widget4', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType4'
                        )
                    ).equal(true);
                });

                it('Конвертация widget3convertableConvertableTypes в widgetArray', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetWithArray'
                        )
                    ).equal(false);
                });

                it('Конвертация widget4convertableConvertableTypes в widget3', async () => {
                    expect(
                        !!widget4convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType3'
                        )
                    ).equal(true);
                });
            });
            it('Поиск доступных для конвертации мета-типов (глубокая конвертируемость)', async () => {
                const widget1RichConvertableTypes = await findConvertableTypes(
                    widget1,
                    richMetaStore
                );
                const widget3RichConvertableTypes = await findConvertableTypes(
                    widget3,
                    richMetaStore
                );

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
