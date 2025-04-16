import { NumberType, RightMode, StringType, WidgetMeta, WidgetType } from 'Meta/types';
import { findTypeInSerialized } from 'MetaUnit/utils/findTypeInSerialized';
import { TMetaJsonNewSingle } from 'Meta/_types/marshalling/format';

const meta = WidgetType.id('TextInput')
    .title('Текстовое поле')
    .description('Поле ввода текста')
    .category('Базовые виджеты')
    .properties({
        value: NumberType.title('Значение').defaultValue(0),
        label: StringType.title('Метка').defaultValue('Введите число'),
    })
    .feature('some_test_feature')
    .access(['c4427c3a-4e92-4344-bb18-1a4e4ece0555'], RightMode.all)
    .keywords(['поле', 'ввод', 'число'])
    .parent('InputParent')
    .styles({
        fontSize: StringType,
        fontWeight: StringType.oneOf(['bold', 'italic', 'underline']),
    }) as WidgetMeta;

describe('Сериализация WidgetType', () => {
    const serialized = meta.saveMeta(true) as TMetaJsonNewSingle[];
    const inputType = findTypeInSerialized(serialized, 'TextInput');

    it('Сериализуется базовое описание виджета', () => {
        expect(inputType).toBeDefined();

        expect(inputType?.metatype).toEqual('widget');
        expect(inputType?.id).toEqual('TextInput');
        expect(inputType?.metaattributes?.title).toEqual('Текстовое поле');
        expect(inputType?.metaattributes?.description).toEqual('Поле ввода текста');
        expect(inputType?.metaattributes?.category).toEqual('Базовые виджеты');
    });

    it('Сериализуется фича виджета', () => {
        expect(inputType?.metaattributes?.feature).toEqual('some_test_feature');
    });

    it('Сериализуются права доступа виджета', () => {
        expect(inputType?.metaattributes?.rights).toEqual(
            JSON.stringify(['c4427c3a-4e92-4344-bb18-1a4e4ece0555'])
        );
        expect(inputType?.metaattributes?.rightmode).toEqual(RightMode.all);
    });

    it('Сериализуются ключевые слова виджета', () => {
        expect(inputType?.metaattributes?.keywords).toEqual(
            JSON.stringify(['поле', 'ввод', 'число'])
        );
    });

    it('Сериализуется родитель виджета', () => {
        expect(inputType?.metaattributes?.parent).toEqual('InputParent');
    });

    describe('Сериализация стилевых свойств виджета', () => {
        const styleType = findTypeInSerialized(serialized, '.style');
        it('Метатип стилей является базовым объект', () => {
            expect(styleType).toBeDefined();
            expect(styleType?.metatype).toEqual('object');
        });

        it('Метатип стилей НЕ наследуется ни от чего', () => {
            expect(styleType?.inherits).toEqual([]);
        });

        it('Метатип стилей содержит свойство fontSize', () => {
            const fontSizeType = styleType?.properties.find((x) => x.name === 'fontSize');
            expect(fontSizeType).toBeDefined();
            expect(fontSizeType?.type).toEqual('string');
        });

        it('Метатип стилей содержит свойство fontWeight', () => {
            const fontWeightType = styleType?.properties.find((x) => x.name === 'fontWeight');
            expect(fontWeightType).toBeDefined();
            expect(fontWeightType?.type).toEqual('string');
        });
    });
});
