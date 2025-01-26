import { ArrayType, StringType, NumberType, DateType, ObjectType, WidgetType } from 'Meta/types';
import {
    convertValueOfMeta,
    findConvertableTypes,
    isEqual as metaIsEqual,
} from 'Meta/conversion/reflect';
import { ObjectMeta } from 'Meta/types';
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
    //@ts-ignore
    options: ArrayType.of(widget1),
});

// Additional widgets
const layoutWidget = WidgetType.id('Types/layoutWidget').properties({
    //@ts-ignore
    children: WidgetType, // Может получить любой виджет в качестве дочернего
});

const richWidget1 = WidgetType.id('Types/richWidget1').properties({
    //@ts-ignore
    children: WidgetType.properties({
        ...commonRequiredAttrs,
        size: NumberType.optional(),
    }), // Widget interface
});

const richWidget2 = WidgetType.id('Types/richWidget2').properties({
    //@ts-ignore
    children: WidgetType.properties({
        ...commonRequiredAttrs,
        length: NumberType.optional(),
    }), // Widget interface
});

const itemWrappedRichWidget = WidgetType.id('Type/itemWrappedRichWidget').properties({
    //@ts-ignore
    children: WidgetType.id('Type/itemWrappedRichWidget/item').properties({
        //@ts-ignore
        children: WidgetType.properties({
            ...commonRequiredAttrs,
            size: NumberType.optional(),
        }), // Widget interface,
    }),
});

const richListWidget = WidgetType.id('Type/richListWidget').properties({
    items: ArrayType.of(
        //@ts-ignore
        WidgetType.properties({
            ...commonRequiredAttrs,
            size: NumberType.optional(),
        })
    ), // Widget interface
});

const itemsWrappedListWidget = WidgetType.id('Type/itemsWrappedListWidget').properties({
    items: ArrayType.of(
        //@ts-ignore
        WidgetType.id('Type/itemsWrappedListWidget/item').properties({
            //@ts-ignore
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
            test('Сравнение примитивов', () => {
                //@ts-ignore
                expect(metaIsEqual(StringType, StringType)).toEqual(true);
                //@ts-ignore
                expect(metaIsEqual(StringType, NumberType)).toEqual(false);
                //@ts-ignore
                expect(metaIsEqual(StringType, DateType)).toEqual(false);
                //@ts-ignore
                expect(metaIsEqual(StringType, ObjectType)).toEqual(false);
                //@ts-ignore
                expect(metaIsEqual(ObjectType, StringType)).toEqual(false);
            });
            test('Сравнение сложных типов', () => {
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
                    //@ts-ignore
                    richAttr: ObjectType.properties({
                        attr1: StringType,
                    }),
                });
                const meta6 = ObjectType.id('Test/objectType6').properties({
                    //@ts-ignore
                    richAttr: ObjectType.properties({
                        attr1: StringType,
                    }),
                });
                const meta7 = ObjectType.id('Test/objectType7').properties({
                    //@ts-ignore
                    richAttr: ObjectType.properties({
                        attr1: NumberType,
                    }),
                });

                //@ts-ignore
                expect(metaIsEqual(meta1, meta2)).toEqual(true);
                //@ts-ignore
                expect(metaIsEqual(meta1, meta1)).toEqual(true);
                //@ts-ignore
                expect(metaIsEqual(meta1, meta3)).toEqual(false);
                //@ts-ignore
                expect(metaIsEqual(meta1, meta4)).toEqual(false);
                //@ts-ignore
                expect(metaIsEqual(meta3, meta4)).toEqual(false);
                //@ts-ignore
                expect(metaIsEqual(meta5, meta6)).toEqual(true);
                //@ts-ignore
                expect(metaIsEqual(meta6, meta7)).toEqual(false);
                //@ts-ignore
                expect(metaIsEqual(WidgetType, meta1)).toEqual(false);
                expect(WidgetType.getBaseType()).toEqual('widget');
                expect(widget1.getBaseType()).toEqual('widget');
            });
        });
        describe('findConvertableTypes()', () => {
            describe('Поиск доступных для конвертации мета-типов (тривиальная конвертируемость)', () => {
                let widget1ConvertableTypes: ObjectMeta<object, object>[];
                let widget2ConvertableTypes: ObjectMeta<object, object>[];
                let widget3ConvertableTypes: ObjectMeta<object, object>[];
                let widget4ConvertableTypes: ObjectMeta<object, object>[];
                let widget1convertableConvertableTypes: ObjectMeta<object, object>[];
                let widget2convertableConvertableTypes: ObjectMeta<object, object>[];
                let widget3convertableConvertableTypes: ObjectMeta<object, object>[];
                let widget4convertableConvertableTypes: ObjectMeta<object, object>[];
                let widgetArrayConvertableTypes: ObjectMeta<object, object>[];
                let widget3CustomConvertableTypes: ObjectMeta<object, object>[];

                beforeAll(async () => {
                    //@ts-ignore
                    widget1ConvertableTypes = await findConvertableTypes(widget1, MetaStore);
                    //@ts-ignore
                    widget2ConvertableTypes = await findConvertableTypes(widget2, MetaStore);
                    //@ts-ignore
                    widget3ConvertableTypes = await findConvertableTypes(widget3, MetaStore);
                    //@ts-ignore
                    widget4ConvertableTypes = await findConvertableTypes(widget4, MetaStore);
                    widget1convertableConvertableTypes = await findConvertableTypes(
                        //@ts-ignore
                        widget1convertable,
                        MetaStore
                    );
                    widget2convertableConvertableTypes = await findConvertableTypes(
                        //@ts-ignore
                        widget2convertable,
                        MetaStore
                    );
                    widget3convertableConvertableTypes = await findConvertableTypes(
                        //@ts-ignore
                        widget3convertable,
                        MetaStore
                    );
                    widget4convertableConvertableTypes = await findConvertableTypes(
                        //@ts-ignore
                        widget4convertable,
                        MetaStore
                    );
                    widgetArrayConvertableTypes = await findConvertableTypes(
                        //@ts-ignore
                        [widget4, widget4, widget4],
                        MetaStore
                    );
                    widget3CustomConvertableTypes = await findConvertableTypes(
                        //@ts-ignore
                        widget3,
                        MetaStore,
                        //@ts-ignore
                        (ms, mt) => mt.getId() === 'Test/widgetType1'
                    );
                });

                test('Конвертация widget1 в widget1', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).toEqual(true);
                });

                test('Конвертация widget1 в widget2', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).toEqual(true);
                });

                test('Конвертация widget1 в widget3', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).toEqual(true);
                });

                test('Конвертация widget1 в widget4', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).toEqual(true);
                });

                test('Конвертация widget1 в widgetArray', async () => {
                    expect(
                        !!widget1ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).toEqual(true);
                });

                test('Конвертация widget2 в widget1', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).toEqual(true);
                });

                test('Конвертация widget2 в widget2', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).toEqual(true);
                });

                test('Конвертация widget2 в widget3', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).toEqual(true);
                });

                test('Конвертация widget2 в widget4', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).toEqual(true);
                });

                test('Конвертация widget2 в widgetArray', async () => {
                    expect(
                        !!widget2ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).toEqual(true);
                });

                test('Конвертация widget3 в widget1', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).toEqual(false);
                });

                test('Конвертация widget3 в widget2', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).toEqual(false);
                });

                test('Конвертация widget3 в widget3', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).toEqual(true);
                });

                test('Конвертация widget3 в widget4', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).toEqual(true);
                });

                test('Конвертация widget3 в widgetArray', async () => {
                    expect(
                        !!widget3ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).toEqual(false);
                });

                test('Конвертация widget4 в widget1', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).toEqual(true);
                });

                test('Конвертация widget4 в widget2', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).toEqual(true);
                });

                test('Конвертация widget4 в widget3', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).toEqual(true);
                });

                test('Конвертация widget4 в widget4', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).toEqual(true);
                });

                test('Конвертация widget4 в widgetArray', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).toEqual(true);
                });

                test('Конвертация widget3custom в widget1', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType1'
                        )
                    ).toEqual(true);
                });

                test('Конвертация widget3custom в widget1', async () => {
                    expect(
                        !!widget4ConvertableTypes.find((w) => w.getId() === 'Types/widgetWithArray')
                    ).toEqual(true);
                });

                test('Конвертация widget3custom в widget2', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType2'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget3custom в widget3', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType3'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget3custom в widget4', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Test/widgetType4'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget3custom в widgetArray', async () => {
                    expect(
                        !!widget3CustomConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetWithArray'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widgetArray в widget1', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType1')
                    ).toEqual(true);
                });

                test('Конвертация widgetArray в widget2', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType2')
                    ).toEqual(true);
                });

                test('Конвертация widgetArray в widget3', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType3')
                    ).toEqual(true);
                });

                test('Конвертация widgetArray в widget4', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find((w) => w.getId() === 'Test/widgetType4')
                    ).toEqual(true);
                });

                test('Конвертация widgetArray в widgetArray', async () => {
                    expect(
                        !!widgetArrayConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetWithArray'
                        )
                    ).toEqual(true);
                });

                test('Конвертация widget1convertableConvertableTypes в widget3', () => {
                    expect(
                        !!widget1convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType3'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget1convertableConvertableTypes в widget4', async () => {
                    expect(
                        !!widget1convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType4'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget2convertableConvertableTypes в widget3', async () => {
                    expect(
                        !!widget2convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType3'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget3convertableConvertableTypes в widget1', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType1'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget3convertableConvertableTypes в widget2', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType2'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget3convertableConvertableTypes в widget4', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType4'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget3convertableConvertableTypes в widgetArray', async () => {
                    expect(
                        !!widget3convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetWithArray'
                        )
                    ).toEqual(false);
                });

                test('Конвертация widget4convertableConvertableTypes в widget3', async () => {
                    expect(
                        !!widget4convertableConvertableTypes.find(
                            (w) => w.getId() === 'Types/widgetType3'
                        )
                    ).toEqual(false);
                });
            });
            test('Поиск доступных для конвертации мета-типов (глубокая конвертируемость)', async () => {
                const widget1RichConvertableTypes = await findConvertableTypes(
                    //@ts-ignore
                    widget1,
                    richMetaStore
                );
                const widget3RichConvertableTypes = await findConvertableTypes(
                    //@ts-ignore
                    widget3,
                    richMetaStore
                );

                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Types/layoutWidget')
                ).toEqual(true);
                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget1')
                ).toEqual(true);
                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget2')
                ).toEqual(true);
                expect(
                    !!widget1RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemWrappedRichWidget'
                    )
                ).toEqual(true);
                expect(
                    !!widget1RichConvertableTypes.find((w) => w.getId() === 'Type/richListWidget')
                ).toEqual(true);
                expect(
                    !!widget1RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemsWrappedListWidget'
                    )
                ).toEqual(true);

                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Types/layoutWidget')
                ).toEqual(true);
                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget1')
                ).toEqual(false);
                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Types/richWidget2')
                ).toEqual(false);
                expect(
                    !!widget3RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemWrappedRichWidget'
                    )
                ).toEqual(false);
                expect(
                    !!widget3RichConvertableTypes.find((w) => w.getId() === 'Type/richListWidget')
                ).toEqual(false);
                expect(
                    !!widget3RichConvertableTypes.find(
                        (w) => w.getId() === 'Type/itemsWrappedListWidget'
                    )
                ).toEqual(false);
            });
        });
        describe('convertValueOfMeta()', () => {
            test('Конвертация мета-типов', () => {
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
                    //@ts-ignore
                    isEqual(convertValueOfMeta(widget1Val, widget1, widget2), {
                        name: 'Vlad',
                        age: 30,
                    })
                ).toEqual(true);

                expect(
                    //@ts-ignore
                    isEqual(convertValueOfMeta(widget1Val, widget1, widget1), widget1Val)
                ).toEqual(true);

                expect(
                    //@ts-ignore
                    isEqual(convertValueOfMeta(widget1Val, widget1, widget4), {
                        name: 'Vlad',
                        age: 30,
                    })
                ).toEqual(true);

                expect(
                    //@ts-ignore
                    isEqual(convertValueOfMeta(widget2Val, widget2, widget1), {
                        name: 'Ivan',
                        age: 20,
                    })
                ).toEqual(true);

                //@ts-ignore
                expect(isEqual(convertValueOfMeta(widget3Val, widget3, widget4), {})).toEqual(true);

                expect(
                    //@ts-ignore
                    isEqual(convertValueOfMeta(widget4Val, widget4, widget1), {
                        name: 'Max',
                        age: 25,
                    })
                ).toEqual(true);
            });
        });
    });
});
