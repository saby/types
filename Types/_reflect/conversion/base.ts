import {
    ArrayType,
    WidgetType,
    isBaseWidget,
    Meta,
    isMeta,
    ObjectMeta,
    ObjectMetaAttributes,
} from 'Types/meta';

async function asyncSome<T>(arr: T[], cb: (el: T) => Promise<boolean>): Promise<boolean> {
    for (const el of arr) {
        if (await cb(el)) {
            return true;
        }
    }

    return false;
}

async function asyncFilter<T>(arr: T[], cb: (el: T) => Promise<boolean>): Promise<T[]> {
    const results: T[] = [];

    for (const elem of arr) {
        if (await cb(elem)) {
            results.push(elem);
        }
    }

    return results;
}

/**
 * Сравнивает два метатипа.
 * Возвращает true, если мета-типы относятся к одному типу
 * и имеют одинаковый набор атрибутов (если объектный мета-тип)
 * @param meta1
 * @param meta2
 * @public
 */
export function isEqual<RuntimeInterface1, RuntimeInterface2>(
    meta1?: Meta<RuntimeInterface1>,
    meta2?: Meta<RuntimeInterface2>
) {
    if (!meta1 || !isMeta(meta1) || !meta2 || !isMeta(meta2)) {
        return false;
    }

    const baseType1 = meta1.getBaseType();
    const baseType2 = meta2.getBaseType();

    if (baseType1 !== baseType2) {
        return false;
    }

    if (meta1.is(ArrayType) && meta2.is(ArrayType)) {
        return isEqual(meta1.getItemMeta(), meta2.getItemMeta());
    }

    if (meta1 instanceof ObjectMeta && meta2 instanceof ObjectMeta) {
        const attrs1 = meta1.getAttributes();
        const attrs2 = meta2.getAttributes();

        const attrs1Keys = Object.keys(attrs1);
        const attrs2Keys = Object.keys(attrs2);

        return (
            attrs1Keys.length === attrs2Keys.length &&
            attrs1Keys.every((key) => isEqual(attrs1[key], attrs2[key]))
        );
    }

    return true;
}

/**
 * Полученный тип атрибута является либо
 * @param type
 */
export function isContentMetaType(type: Meta<unknown>) {
    return type.is(WidgetType) || (type.is(ArrayType) && type.getItemMeta().is(WidgetType));
}

export function findContentAttributes(attrs: ObjectMetaAttributes<object>) {
    return Object.keys(attrs)
        .filter((key) => isContentMetaType(attrs[key]))
        .reduce(
            (accum, key) => ({
                ...accum,
                [key]: attrs[key],
            }),
            {}
        );
}

/**
 * Проверяет имплементирует ли widget интерфейс, описанный в атрибутах interfaceWidget
 * @param widget
 * @param interfaceWidget
 */
export function implementsInterface(widget: ObjectMeta, interfaceWidget: ObjectMeta) {
    const interfaceAttrs = interfaceWidget.getAttributes();
    const widgetAttrs = widget.getAttributes();

    return Object.keys(interfaceAttrs).every(
        (iKey) =>
            widgetAttrs.hasOwnProperty(iKey) && isEqual(widgetAttrs[iKey], interfaceAttrs[iKey])
    );
}

/**
 * Возвращает true/(false), если targetMeta "тривиально" (не)конвертируем с targetMeta
 * (sourceMeta содержит все атрибуты, которые у targetMeta помечены обязательными)
 * @param sourceMeta
 * @param targetMeta
 * @public
 */
export function isTrivialConvertable(sourceMeta: ObjectMeta, targetMeta: ObjectMeta) {
    const sourceAttrs = sourceMeta.getAttributes();
    const requiredTargetAttrs = getRequiredAttrs(targetMeta);

    return Object.keys(requiredTargetAttrs).every(
        (rKey) =>
            sourceAttrs.hasOwnProperty(rKey) &&
            isEqual(sourceAttrs[rKey], requiredTargetAttrs[rKey])
    );
}

/**
 * Возвращает true/(false), если можно sourceMeta вставить в targetMeta в качестве контентной опции
 * без глубокой проверки
 * @param sourceMeta
 * @param targetMeta
 * @param contentAttrKey если не передан, метод сам ее найдет
 */
export function isInjectable(
    sourceMeta: ObjectMeta,
    targetMeta: ObjectMeta,
    contentAttrKey?: string
): boolean {
    let requiredTargetContentAttr;

    if (!contentAttrKey) {
        const requiredTargetAttrs = getRequiredAttrs(targetMeta);

        const requiredTargetContentAttrs = findContentAttributes(requiredTargetAttrs);
        const requiredTargetContentAttrsKeys = Object.keys(requiredTargetContentAttrs);

        if (requiredTargetContentAttrsKeys.length !== 1) {
            // Если контентных атрибутов нет и, при этом, тривиально неконвертируемы, то false
            // Пока непонятно, что делать, если обязательных контентых атрибутов несколько (автоматически не сконвертируем)
            return false;
        }

        const requiredTargetContentAttrsKey = requiredTargetContentAttrsKeys[0];

        requiredTargetContentAttr = requiredTargetAttrs[requiredTargetContentAttrsKey];
    } else {
        requiredTargetContentAttr = targetMeta.getAttributes()[contentAttrKey];
    }

    // WidgetType и ArrayType.of(WidgetType) пока обрабатываем одинаково
    if (requiredTargetContentAttr.is(ArrayType)) {
        requiredTargetContentAttr = requiredTargetContentAttr.getItemMeta();
    }

    if (requiredTargetContentAttr.is(WidgetType)) {
        if (isEqual(sourceMeta, requiredTargetContentAttr)) {
            return true;
        }

        // Проверяем, что это не наследник виджета, а сам базовый тип виджета
        const isWidget = isBaseWidget(requiredTargetContentAttr);

        // Если тип атрибута указан, как виджет, а исходный мета-тип -- наследник виджета, то подлежит конвертации
        if (
            isWidget &&
            sourceMeta.is(WidgetType) &&
            implementsInterface(WidgetType, requiredTargetContentAttr)
        ) {
            return true;
        }

        return false;
    }

    // Неизвестный тип контентной опции (не является наследником от WidgetType)
    return false;
}

/**
 * Возвращает true/(false), если sourceMeta "глубоко" (не)конвертируем с targetMeta
 * (может стать его дачерним компонентом или передать свои дочерние компоненты)
 * @param sourceMeta
 * @param targetMeta
 * @public
 */
export function isDeepConvertable(sourceMeta: ObjectMeta, targetMeta: ObjectMeta) {
    const requiredTargetAttrs = getRequiredAttrs(targetMeta);

    const requiredTargetContentAttrs = findContentAttributes(requiredTargetAttrs);
    const requiredTargetContentAttrsKeys = Object.keys(requiredTargetContentAttrs);

    // TODO: Переписать на поиск опции вместо ограничения на наличие одной
    if (requiredTargetContentAttrsKeys.length !== 1) {
        // Если контентных атрибутов нет и, при этом, тривиально неконвертируемы, то false
        // Пока непонятно, что делать, если обязательных контентых атрибутов несколько (автоматически не сконвертируем)
        return false;
    }

    const requiredTargetContentAttrsKey = requiredTargetContentAttrsKeys[0];
    let requiredTargetContentAttr = requiredTargetAttrs[requiredTargetContentAttrsKey];

    // WidgetType и ArrayType.of(WidgetType) пока обрабатываем одинаково
    if (requiredTargetContentAttr.is(ArrayType)) {
        requiredTargetContentAttr = requiredTargetContentAttr.getItemMeta();
    }

    if (requiredTargetContentAttr.is(WidgetType)) {
        if (isInjectable(sourceMeta, targetMeta, requiredTargetContentAttrsKey)) {
            return true;
        }

        return checkMetaConvertibility(sourceMeta, requiredTargetContentAttr);
    } else if (requiredTargetContentAttr.is(ArrayType)) {
        const arrayItemMeta = requiredTargetContentAttr.getItemMeta();

        return arrayItemMeta.is(WidgetType) && checkMetaConvertibility(sourceMeta, arrayItemMeta);
    }

    // Сюда мы попасть не должны (появился неизвестный контентный тип)
    return false;
}

/**
 * Функция проверки конвертируемости из первого мета-типа во второй.
 * Проверка конвертируемости проходит по следующим шагам:
 * 1. Проверка на эквивалентность (если два мета-типа одинаковы)
 * 2. Проверка тривиальной конвертируемости
 * 3. Проверка глубокой конвертируемости (если у целевого мета-типа есть 1 и только 1 обязательный контентный атрибут, то рекурсивно проверяем конвертируемость с ним)
 * @param sourceMeta
 * @param targetMeta
 */
function checkMetaConvertibility(sourceMeta: ObjectMeta, targetMeta: ObjectMeta) {
    if (isEqual(sourceMeta, targetMeta)) {
        return true;
    }

    if (isTrivialConvertable(sourceMeta, targetMeta)) {
        return true;
    }

    return isDeepConvertable(sourceMeta, targetMeta);
}

export function getRequiredAttrs(meta: ObjectMeta) {
    const attrs = meta.getAttributes();
    const requiredAttrs: { [key in string]: Meta<any> } = {};

    Object.keys(attrs).forEach((k) => {
        const field = attrs[k] as Meta<any>;
        if (field.isRequired()) {
            requiredAttrs[k] = field;
        }
    });

    return requiredAttrs;
}

export async function isMetaConvertable(
    sourceMeta: ObjectMeta,
    targetMeta: ObjectMeta,
    isConvertable?: (sourceMeta: ObjectMeta, targetMeta: ObjectMeta) => boolean
) {
    const finalIsMetasConvertable = isConvertable ? isConvertable : checkMetaConvertibility;

    if (targetMeta.is(WidgetType) && sourceMeta.is(WidgetType)) {
        const targetConvertableFunc = targetMeta.getIsValueConvertable();

        if (targetConvertableFunc) {
            await targetConvertableFunc.load();

            return targetConvertableFunc.func(sourceMeta);
        }
    }

    return finalIsMetasConvertable(sourceMeta, targetMeta);
}

/**
 * Возвращает список мета-типов из allMetas, в который могут быть сконвертированы мета-тип(ы) из sourceMeta
 * @param sourceMeta - список конвертируемых мета-типов
 * @param allMetas - список всех метатипов
 * @param isConvertable - callback, который определяет, можно ли конвертировать один мета-тип в другой. callback передаётся, если нужно задать свои логику определения конвертируемости мета-типов
 * @public
 */
export async function findConvertableTypes(
    sourceMeta: ObjectMeta | ObjectMeta[],
    allMetas: ObjectMeta[],
    isConvertable?: (sourceMeta: ObjectMeta, targetMeta: ObjectMeta) => boolean
) {
    const checkConvertibilityFunc = isConvertable || isMetaConvertable;

    if (Array.isArray(sourceMeta)) {
        return asyncFilter(allMetas, async (meta) => {
            return asyncSome(sourceMeta, async (sourceMetaElem) => {
                return checkConvertibilityFunc(sourceMetaElem, meta);
            });
        });
    }

    return asyncFilter(allMetas, async (meta) => {
        return checkConvertibilityFunc(sourceMeta, meta);
    });
}

/**
 * Конвертирует sourceVal, относящийся к sourceType в объект значений относящийся к targetType
 * @param sourceVal - Конвертируемый объект значений
 * @param sourceType - Мета-тип относящийся к конвертируемому объекту значений
 * @param targetType - Мета-тип к которому хотим сконвертировать
 * @example
 * const ObjectMeta1 = ObjectMeta.attributes({ name: StringType, length: NumberType.optional() });
 * const ObjectMeta2 = ObjectMeta.attributes({ name: StringType, color: StringType.optional() });
 * convertValueOfMeta({ name: 'foo', length: 10 }, ObjectMeta1, ObjectMeta2); // return { name: 'foo' }
 * @public
 */
export function convertValueOfMeta(
    sourceVal: object,
    sourceType: ObjectMeta,
    targetType: ObjectMeta
) {
    const sourceAttrs = sourceType.getAttributes();
    const targetAttrs = targetType.getAttributes();

    return Object.keys(targetAttrs).reduce((accum, tKey) => {
        if (
            isEqual(sourceAttrs[tKey], targetAttrs[tKey]) &&
            sourceVal[tKey] !== targetAttrs[tKey].getDefaultValue()
        ) {
            return {
                ...accum,
                [tKey]: sourceVal[tKey],
            };
        }

        return accum;
    }, {});
}
