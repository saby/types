import { ObjectMeta } from '../object';
import { Meta, IMeta, isMeta } from '../baseMeta';
import { ArrayMeta } from '../array';

/**
 * Сравнивает два метатипа.
 * Возвращает true, если мета-типы относятся к одному типу
 * и имеют одинаковый набор атрибутов (если объектный мета-тип)
 * @param meta1
 * @param meta2
 * @public
 */
export function isEqual<RuntimeInterface1, RuntimeInterface2>(
    meta1?: Meta<RuntimeInterface1> | IMeta<RuntimeInterface1>,
    meta2?: Meta<RuntimeInterface2> | IMeta<RuntimeInterface2>
) {
    if (!meta1 || !isMeta(meta1) || !meta2 || !isMeta(meta2)) {
        return false;
    }

    const baseType1 = meta1.getBaseType();
    const baseType2 = meta2.getBaseType();

    if (baseType1 !== baseType2) {
        return false;
    }

    if (meta1 instanceof ArrayMeta && meta2 instanceof ArrayMeta) {
        return isEqual(meta1.getItemMeta(), meta2.getItemMeta());
    }

    if (meta1 instanceof ObjectMeta && meta2 instanceof ObjectMeta) {
        const attrs1 = meta1.getAttributes();
        const attrs2 = meta2.getAttributes();

        return Object.keys(attrs1).every((key) => isEqual(attrs1[key], attrs2[key]));
    }

    return true;
}

function checkMetaConvertibility(sourceMeta: ObjectMeta, targetMeta: ObjectMeta) {
    const sourceAttrs = sourceMeta.getAttributes();
    const requiredAttrs = getRequiredAttrs(targetMeta);

    return Object.keys(requiredAttrs).every(
        (rKey) =>
            sourceAttrs.hasOwnProperty(rKey) && isEqual(sourceAttrs[rKey], requiredAttrs[rKey])
    );
}

function getRequiredAttrs(meta: ObjectMeta) {
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

function findCompatibleArrayAttributes(sourceMeta: Meta<unknown>, testedMeta: ObjectMeta) {
    const attrs = testedMeta.getAttributes();

    return Object.keys(attrs).filter((attrKey) => {
        const attr = attrs[attrKey];
        if (!(attr instanceof ArrayMeta)) {
            return false;
        }

        const arrayOfMeta = attr.getItemMeta();

        return (
            isEqual(arrayOfMeta, sourceMeta) ||
            (arrayOfMeta instanceof ObjectMeta &&
                sourceMeta instanceof ObjectMeta &&
                checkMetaConvertibility(arrayOfMeta, sourceMeta))
        );
    });
}

/**
 * Возвращает список мета-типов из allMetas, в который могут быть сконвертированы мета-тип(ы) из sourceMeta
 * @param sourceMeta - список конвертируемых мета-типов
 * @param allMetas - список всех метатипов
 * @param isConvertable - callback, который определяет, можно ли конвертировать один мета-тип в другой. callback передаётся, если нужно задать свои логику определения конвертируемости мета-типов
 * @public
 */
export function findConvertableTypes(
    sourceMeta: ObjectMeta | ObjectMeta[],
    allMetas: ObjectMeta[],
    isConvertable?: (sourceMeta: ObjectMeta, targetMeta: ObjectMeta) => boolean
) {
    const isArray = Array.isArray(sourceMeta);
    if (isArray && sourceMeta.length > 1) {
        return allMetas.filter((meta) => {
            const arrayAttrs = findCompatibleArrayAttributes(sourceMeta[0], meta);

            return Object.keys(arrayAttrs).length;
        });
    }

    const handlingMeta = isArray ? sourceMeta[0] : sourceMeta;

    const isMetasConvertable = isConvertable ? isConvertable : checkMetaConvertibility;

    return allMetas.filter((meta) => {
        return isMetasConvertable(handlingMeta, meta);
    });
}

/**
 * Конвертирует sourceVal, относящийся к sourceType в объект значений относящийся к targetType
 * @param sourceVal - Конвертируемый объект значений
 * @param sourceType - Мета-тип относящийся к конвертируемому объекту значений
 * @param targetType - Мета-тип к которому хотим сконвертировать
 * @example
 * const widget1 = WidgetType.attributes({ name: StringType, length: NumberType.optional() });
 * const widget2 = WidgetType.attributes({ name: StringType, color: StringType.optional() });
 * convertValueOfMeta({ name: 'foo', length: 10 }, widget1, widget2); // return { name: 'foo' }
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
