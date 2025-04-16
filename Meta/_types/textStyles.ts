import * as rk from 'i18n!Meta';
import { EnumType, StringType, StyleType, ObjectType } from './types';
import { group } from './meta';

/**
 * Метатип "Шрифт"
 * @public
 */
export const FontFamilyType = StringType.id('FontFamily').title(rk('Шрифт'));

/**
 * Метатип "Размер текста"
 * @public
 */
export const FontSizeType = StringType.id('FontSize').title(rk('Размер текста'));

/**
 * Метатип "Цвет текста"
 * @public
 */
export const FontColorType = StringType.id('Color').title(rk('Цвет'));

/**
 * Метатип "Цвет текста"
 * @public
 */
export const FontBackgroundColorType = StringType.id('BackgroundColor').title(rk('Цвет выделения'));

/**
 * Метатип "Жирность текста - bold"
 * @public
 */
export const FontWeightBoldType = StringType.id('bold');

/**
 * Метатип "Жирность текста - normal"
 * @public
 */
export const FontWeightNormalType = StringType.id('normal');

/**
 * Метатип "Жирность текста"
 * @public
 */
export const FontWeightType = EnumType.id('FontWeight')
    .title(rk('Жирность'))
    .elements([FontWeightBoldType, FontWeightNormalType]);

/**
 * Метатип "Декорация текста - underline"
 * @public
 */
export const DecorationUnderlineType = StringType.id('underline').title(rk('Подчеркнутый'));

/**
 * Метатип "Декорация текста - line-through"
 * @public
 */
export const DecorationLineThroughType = StringType.id('line-through').title(rk('Зачеркнутый'));

/**
 * Метатип "Декорация текста - none"
 * @public
 */
export const DecorationNoneType = StringType.id('none').title(rk('Без декорации'));

/**
 * Метатип "Декорация текста"
 * @public
 */
export const TextDecorationType = EnumType.id('TextDecoration')
    .title(rk('Декорация'))
    .elements([DecorationUnderlineType, DecorationLineThroughType, DecorationNoneType]);

/**
 * Метатип "Выравнивание текста - left"
 * @public
 */
export const TextAlignLeftType = StringType.id('left').title(rk('По левому краю'));

/**
 * Метатип "Выравнивание текста - right"
 * @public
 */
export const TextAlignRightType = StringType.id('right').title(rk('По правому краю'));

/**
 * Метатип "Декорация текста - center"
 * @public
 */
export const TextAlignCenterType = StringType.id('center').title(rk('По центру'));

/**
 * Метатип "Декорация текста - justify"
 * @public
 */
export const TextAlignJustifyType = StringType.id('justify').title(rk('Растянуть'));

/**
 * Метатип "Выравнивание по вертикали - top"
 * @public
 */
export const VerticalAlignTopType = StringType.id('top').title(rk('По верхнему краю'));

/**
 * Метатип "Выравнивание по вертикали - middle"
 * @public
 */
export const VerticalAlignMiddleType = StringType.id('middle').title(rk('Посередине'));

/**
 * Метатип "Выравнивание по вертикали - bottom"
 * @public
 */
export const VerticalAlignBottomType = StringType.id('bottom').title(rk('По нижнему краю'));

/**
 * Метатип "Выравнивание текста"
 */
export const TextAlignType = EnumType.id('TextAlign')
    .title(rk('Выравнивание'))
    .elements([TextAlignLeftType, TextAlignRightType, TextAlignCenterType, TextAlignJustifyType]);

/**
 * Метатип "Выравнивание по вертикали"
 */
export const VerticalAlignType = EnumType.id('VerticalAlign')
    .title(rk('Выравнивание по вертикали'))
    .elements([VerticalAlignTopType, VerticalAlignMiddleType, VerticalAlignBottomType]);

/**
 * Метатип "Стиль шрифта - italic"
 * @public
 */
export const FontStyleItalicType = StringType.id('italic').title(rk('Курсив'));

/**
 * Метатип "Стиль шрифта - normal"
 * @public
 */
export const FontStyleNormalType = StringType.id('normal').title(rk('Обычный'));

/**
 * Метатип "Стиль шрифта"
 * @public
 */
export const FontStyleType = EnumType.id('FontStyle')
    .title(rk('Начертание'))
    .elements([FontStyleItalicType, FontStyleNormalType]);

/**
 * Ссылка на стиль шрифта из палитры
 * @public
 */
export const FontPaletteStyleReferenceType = StringType.id('FontPaletteReference')
    .title(rk('Стиль'))
    .description('Стиль шрифта из палитры');

/**
 * Метатип "Внутренние отступы"
 * @public
 */
export const PaddingType = StringType.title(rk('Отступ')).optional();

/**
 * Метатип "Толщина границы"
 * @public
 */
export const BorderWidthType = StringType.title(rk('Толщина границы')).optional();

/**
 * Метатип "Стиль границы"
 * @public
 */
export const BorderStyleType = StringType.title(rk('Стиль границы')).optional();

/**
 * Метатип "Цвет границы"
 * @public
 */
export const BorderColorType = StringType.title(rk('Цвет границы')).optional();

/**
 * Метатип "Граница"
 * @public
 */
export const BorderType = ObjectType.id('Border')
    .title(rk('Граница'))
    .optional()
    .properties({
        borderWidth: BorderWidthType.optional(),
        borderStyle: BorderStyleType.optional(),
        borderColor: BorderColorType.optional(),
    })
    .editor('ThemePaletteEditor/styleEditors:BorderEditor');

/**
 * Метатип "Стиль контейнера"
 * @public
 */
export const ContainerStyleType = ObjectType.id('ContainerStyle').properties({
    ...group('container-group', '', {
        padding: PaddingType.editor('Controls-editors/style:PaddingEditor'),
        ...BorderType.getProperties(),
    }),
});

export const TextStyleTypeProperties = ObjectType.id('TextStyleTypeProperties').properties({
    backgroundColor: FontBackgroundColorType.optional(),
    color: FontColorType.optional(),
    fontFamily: FontFamilyType.optional(),
    fontSize: FontSizeType.optional(),
    fontStyle: FontStyleType.optional(),
    fontWeight: FontWeightType.optional(),
    textAlign: TextAlignType.optional(),
    textDecoration: TextDecorationType.optional(),
});

export const TextStyleWithVAlignTypeProperties = ObjectType.id(
    'TextStyleWithVAlignTypeProperties'
).properties({
    ...TextStyleTypeProperties.getProperties(),
    verticalAlign: VerticalAlignType.optional(),
});

const ReferenceTextStyleTypeProperties = ObjectType.id(
    'ReferenceTextStyleTypeProperties'
).properties({
    ...TextStyleTypeProperties.getProperties(),
    reference: FontPaletteStyleReferenceType.optional(),
});

/**
 * Метатип "Стиль текста из палитры"
 * @public
 */
export const ReferenceTextStyleType = StyleType.id('ReferenceTextStyle')
    .properties(
        ReferenceTextStyleTypeProperties.editor(
            'ThemeConstructor/styleEditors:FontStyleReferenceEditor'
        ).getProperties()
    )
    .designtimeEditor('ThemeConstructor/controls:FontStyleDesignTimeEditor');

/**
 * Метатип "Стиль текста"
 * @public
 */
export const TextStyleType = StyleType.id('TextStyle')
    .properties(
        TextStyleTypeProperties.editor(
            'ThemePaletteEditor/styleEditors:FontStyleEditor'
        ).getProperties()
    )
    .designtimeEditor('ThemeConstructor/controls:FontStyleDesignTimeEditor');

/**
 * Метатип "Стиль текста с выравниванием по вертикали"
 * @public
 */
export const TextStyleWithVAlignType = StyleType.id('TextStyleWithVAlignType')
    .properties(
        TextStyleWithVAlignTypeProperties.editor(
            'ThemePaletteEditor/styleEditors:FontStyleEditor'
        ).getProperties()
    )
    .designtimeEditor('ThemeConstructor/controls:FontStyleDesignTimeEditor');

const ReferenceTextContainerStyleTypeProperties = ObjectType.id(
    'ReferenceTextContainerStyleTypeProperties'
)
    .properties({
        ...group('style-group', '', ReferenceTextStyleTypeProperties.getProperties()),
        ...ContainerStyleType.getProperties(),
    })
    .editor('ThemeConstructor/styleEditors:FontStyleReferenceEditor');

/**
 * Метатип "Стиль контейнера для текста из палитры"
 * @public
 */
export const ReferenceTextContainerStyleType = StyleType.id('ReferenceTextContainerStyle')
    .properties(ReferenceTextContainerStyleTypeProperties.getProperties())
    .designtimeEditor('ThemeConstructor/controls:FontStyleDesignTimeEditor');

export const TEXT_TYPE_MAX_SIZE = 60;
export const HEADER_TYPE_MAX_SIZE = 36;

/**
 * Метатип "Стиль контейнера текста"
 * @public
 */
export const TextContainerStyleType = StyleType.id('TextContainerStyle')
    .properties({
        ...group(
            'style-group',
            '',
            TextStyleTypeProperties.editor('ThemePaletteEditor/styleEditors:FontStyleEditor')
                .editorProps({ maxFontSize: HEADER_TYPE_MAX_SIZE })
                .getProperties()
        ),
        ...ContainerStyleType.getProperties(),
    })
    .designtimeEditor('ThemeConstructor/controls:FontStyleDesignTimeEditor');

/**
 * Метатип "Стиль контейнера заголовка"
 * @public
 */
export const HeaderContainerStyleType = StyleType.id('HeaderContainerStyle')
    .properties({
        ...group(
            'style-group',
            '',
            TextStyleTypeProperties.editor('ThemePaletteEditor/styleEditors:FontStyleEditor')
                .editorProps({ maxFontSize: TEXT_TYPE_MAX_SIZE })
                .getProperties()
        ),
        ...ContainerStyleType.getProperties(),
    })
    .designtimeEditor('ThemeConstructor/controls:FontStyleDesignTimeEditor');
