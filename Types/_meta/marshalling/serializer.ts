/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { TMetaJson, TMetaJsonSingle, TVariantMeta } from './format';
import { MetaClass, GENERATOR_ID_RANDOM_DELIMITER } from './format';
import type { Meta } from '../baseMeta';
import type { ArrayMeta } from '../array';
import type { VariantMeta } from '../variant';
import type { ObjectMeta } from '../object';
import type { WidgetMeta } from '../widget';

const baseIds = ['unknown', 'any', 'void', 'null', 'undefined',
    'boolean', 'number', 'string', 'object', 'promise', 'function', 'variant'];
/**
 * Сериализация meta
 * TODO Перевести везде работу на IMeta, а IMeta переименовать в IDescriptor
 */
export function serialize(meta: TVariantMeta): TMetaJson {
    if (baseIds.includes(meta.getId())) {
        return [];
    }

    const primitive = serializePrimitive(meta);
    if (MetaClass.primitive === primitive.is) {
        return [primitive];
    }

    if (primitive.is === MetaClass.array) {
        const itemMeta = (meta as ArrayMeta<unknown>).getItemMeta();
        const itemJson = serialize(itemMeta);
        primitive.arrayOf = itemMeta.getId();
        itemJson.push(primitive);
        return itemJson;
    }

    if (primitive.is === MetaClass.variant) {
        let variantResult: TMetaJson = [];
        primitive.invariant = (meta as VariantMeta<never>).getInvariant();
        const [variantsValue, variantsJson] = getAttributiesMetaJson(
            (meta as VariantMeta<never>).getTypes());
        if (variantsValue.length > 0) {
            primitive.of = JSON.stringify(variantsValue);
            variantResult = variantsJson;
        }
        variantResult.push(primitive);
        return variantResult;
    }

    let result: TMetaJson = [];
    if (primitive.is === MetaClass.widget) {
        const [attachedValue, attachedJson] = getAttachedMetaJson(
            (meta as WidgetMeta<unknown>).getAttachedAttributes());
        const [stylesValue, stylesJson] = getAttachedMetaJson(
            (meta as WidgetMeta<unknown>).getAttachedStyles());
        result.concat(attachedJson, stylesJson);
        if (attachedValue.length > 0) {
            primitive.attachedAttributes = JSON.stringify(attachedValue);
        }
        if (stylesValue.length > 0) {
            primitive.attachedStyles = JSON.stringify(stylesValue);
        }
        const access = (meta as WidgetMeta<unknown>).getAccess();
        if (access) {
            primitive.rights = JSON.stringify(access.rights);
            primitive.rightmode = JSON.stringify(access.mode);
        }
        const feature = (meta as WidgetMeta<unknown>).getFeature();
        if (feature) {
            primitive.feature = JSON.stringify(feature);
        }
    }

    if (MetaClass.object === primitive.is) {
        if (primitive.defaultValue === '{}') {
            delete primitive.defaultValue;
        }
    }

    if ([MetaClass.object, MetaClass.widget].includes(primitive.is)) {
        const [attrsValue, attrsJson] = getAttributiesMetaJson(
            (meta as ObjectMeta<unknown>).getAttributes());
        primitive.attributes = attrsValue;
        if (attrsValue.length > 0) {
            result = result.concat(attrsJson);
        }
    }

    result.push(primitive);
    return result;
}

function serializePrimitive(meta: Meta<unknown>): TMetaJsonSingle {
    const descritption = meta.toDescriptor();

    let sampleData: { i?: string, d?: unknown };
    if (meta.getSampleData()?.importPath) {
        sampleData = { i: meta.getSampleData().importPath };
    } else if (meta.getSampleData()?.data) {
        // eslint-disable-next-line
        sampleData = { d: meta.getSampleData().data };
    }

    const group: [string, string] = descritption.info.group ?
        [descritption.info.group.uid, descritption.info.group.name] : undefined;
    // @ts-ignore
    const editor = descritption.editor?.loader?._moduleName;
    const editorProps = descritption.editor?.props ? JSON.stringify(descritption.editor.props) : undefined;
    // @ts-ignore
    const designtimeEditor = descritption.designtimeEditor?.loader?._moduleName;
    const designtimeEditorProps = descritption.designtimeEditor?.props
        ? JSON.stringify(descritption.designtimeEditor.props)
        : undefined;

    const jsonMeta = {
        is: descritption.is,
        id: descritption.id,
        inherits: descritption.inherits ?? [],
        required: descritption.required,
        editor,
        editorProps,
        designtimeEditor,
        designtimeEditorProps,
        defaultValue: JSON.stringify(meta.getDefaultValue()),
        sampleData: JSON.stringify(sampleData),
        ...descritption.info,
        group: JSON.stringify(group),
    };
    Object.keys(jsonMeta).forEach((key) => {
        if (jsonMeta[key] !== undefined) {
            return;
        }
        delete jsonMeta[key];
    });
    jsonMeta.inherits = jsonMeta.inherits.filter((item) => {
        return !item.includes(GENERATOR_ID_RANDOM_DELIMITER);
    });

    return jsonMeta;
}

function getAttachedMetaJson(attrObject: Record<string, Record<string, TVariantMeta> | TVariantMeta>):
    [[string, [string, string][]][], TMetaJson] {
    const attributes = [];
    const attachedMetaJsons = [];
    Object.entries(attrObject).forEach(([prop, attrs]: [string, Record<string, TVariantMeta>]) => {
        const [attrsValue, metasJson] = getAttributiesMetaJson(attrs);
        attachedMetaJsons.push(metasJson);
        attributes.push([prop, attrsValue]);
    });
    return [attributes, Array.prototype.concat.apply([], attachedMetaJsons)];
}

function getAttributiesMetaJson(attrObject: Record<string, TVariantMeta>): [[string, string][], TMetaJson] {
    const attributes = [];
    const attrMetaJsons = [];
    if (attrObject) {
        Object.entries(attrObject).forEach(([key, value]: [string, Meta<never>]) => {
            attributes.push([value.getId(), key]);
            attrMetaJsons.push(value.toJSON());
        });
    }
    return [attributes, Array.prototype.concat.apply([], attrMetaJsons)];
}