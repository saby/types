/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrayMeta, IArrayMeta } from '../array';
import { createEditor, createDesignTimeEditor } from './attributes';
import { createRightMode } from './rightmode';
import { Meta, IMeta } from '../baseMeta';
import { MetaClass, TMetaJsonSingle, TMetaJson } from './format';
import { FunctionMeta, IFunctionMeta, IFunctionMetaInfo, IFunctionParameters } from '../function';
import { ObjectMeta, IObjectMeta } from '../object';
import { PromiseMeta, IPromiseMeta } from '../promise';
import { IVariantMeta, VariantMeta } from '../variant';
import { WidgetMeta, IWidgetMeta } from '../widget';
import { IPageMeta } from '../page';
import type { RecordSet } from 'Types/collection';
import type { Record as SbisRecord } from 'Types/entity';
import type { Serializer as TypesSerializer } from 'Types/serializer';

let jsonParseReviver: typeof TypesSerializer.prototype.deserialize;

export class DeserializeError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'DeserializeError';
    }
}

type TTmpJsonFormatFromRecord = IMeta<unknown> & {
    IsArray: boolean; // признак того что этот тип массив
    Type: string;
    metatype: string;
    metaattributes: TMetaJsonSingle;
    types: { [key: string]: Meta<any> };
    varianttypes: string[];
    complextypes: TMetaJson;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TMetaConstructor = new (descriptor: object & { is: any; invariant?: any }) => TExistsIMeta;
interface IMetaConstruct {
    constructor: TMetaConstructor;
    descriptorBase: object & { is: MetaClass | string; id: string };
}

const META_CLASSES = new Map<MetaClass | string, IMetaConstruct>([
    [
        MetaClass.primitive,
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive },
        },
    ],
    [
        'integer',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'number' },
        },
    ],
    [
        'float',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'number' },
        },
    ],
    // Реализация не корректна. Но аналогов в JS нет
    [
        'money',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'number' },
        },
    ],
    [
        'boolean',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'boolean' },
        },
    ],
    [
        'date',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'date' },
        },
    ],
    [
        'datetime',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'date' },
        },
    ],
    // Реализация не корректна. Но аналогов в JS нет
    [
        'time',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'date' },
        },
    ],
    [
        'string',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'string' },
        },
    ],
    [
        'uuid',
        {
            constructor: Meta,
            descriptorBase: { is: MetaClass.primitive, id: 'string' },
        },
    ],
    [
        'enum',
        {
            constructor: ArrayMeta,
            descriptorBase: { is: MetaClass.array, id: MetaClass.array },
        },
    ],
    [
        MetaClass.object,
        {
            constructor: ObjectMeta,
            descriptorBase: { is: MetaClass.object, id: MetaClass.object },
        },
    ],
    [
        MetaClass.widget,
        {
            constructor: WidgetMeta,
            descriptorBase: { is: MetaClass.widget, id: MetaClass.widget },
        },
    ],
    [
        MetaClass.promise,
        {
            constructor: PromiseMeta,
            descriptorBase: { is: MetaClass.promise, id: MetaClass.promise },
        },
    ],
    [
        MetaClass.function,
        {
            constructor: FunctionMeta,
            descriptorBase: { is: MetaClass.function, id: MetaClass.function },
        },
    ],
    [
        MetaClass.variant,
        {
            constructor: VariantMeta,
            descriptorBase: { is: MetaClass.variant, id: MetaClass.variant },
        },
    ],
]);

type Mutable<Type> = {
    -readonly [Key in keyof Type]: Type[Key];
};

type TReadedIMeta = { is: string; id: string } & (
    | IMeta<any>
    | IObjectMeta<any>
    | IArrayMeta<any>
    | IWidgetMeta<any>
    | IVariantMeta<Record<string, object>>
    | IFunctionMeta<() => any, any>
    | IPromiseMeta<Promise<any>>
    | IPageMeta<object>
);

type TExistsIMeta = Mutable<TReadedIMeta>;

type TK =
    | keyof IWidgetMeta<any>
    | keyof IObjectMeta<any>
    | keyof IVariantMeta<any>
    | keyof IArrayMeta<any>
    | keyof IFunctionMeta<any>;
type TFromRecord = { from: string[]; converter?: Function };
class Recipe {
    statement: Map<TK, TFromRecord> = new Map<TK, TFromRecord>();
    cachesFn: Map<string, Function> = new Map<string, Function>();

    cacheField<T = any, R = any>(fromKey: string, cacheFn: (value: T) => R) {
        this.cachesFn.set(fromKey, cacheFn);
    }

    /**
     * Добавление правила конвертации
     */
    // eslint-disable-next-line @typescript-eslint/no-shadow
    field<T = any, R = unknown>(
        key: TK,
        from: string | string[],
        converter?: (value: T, record: SbisRecord) => R
    ) {
        this.statement.set(key, {
            from: Array.isArray(from) ? from : [from],
            converter,
        });
    }

    static NotExistsSymbol: Symbol = Symbol('notExists');
}

class RecordConverter {
    private memos: Map<string, any> = new Map<string, any>();

    constructor(private rules: Recipe, private record: SbisRecord) {}

    /**
     * Запуск процесса конвертации
     */
    convert(): TExistsIMeta {
        const descriptor: Partial<Mutable<IMeta<any>> & Record<string, any>> = {
            fixedId: true,
        };
        this.rules.statement.forEach((rule, key) => {
            const recKey = rule.from.find((from) => this.record.has(from));
            if (!recKey) {
                return;
            }

            let value;
            if (this.rules.cachesFn.has(recKey)) {
                if (this.memos.has(recKey)) {
                    value = this.memos.get(recKey);
                } else {
                    // @ts-ignore чуть выше првоерили, что есть значение
                    value = this.rules.cachesFn.get(recKey)(this.record.get(recKey));
                    this.memos.set(recKey, value);
                }
            }

            if (!value) {
                value = this.record.get(recKey);
            }

            value = rule?.converter?.(value, this.record) ?? value;
            if (value === Recipe.NotExistsSymbol) {
                return;
            }
            descriptor[key] = value;
        });

        // хардкод, создание псевдосущности для массива
        if (this.record.has('IsArray') && this.record.get('IsArray')) {
            const info = descriptor.info;
            delete descriptor.info;
            return {
                id: 'ArrayOf_' + descriptor.is,
                is: MetaClass.array,
                fixedId: true,
                arrayOf: descriptor,
                inherits: ['array'],
                info,
            };
        }

        // @ts-ignore игнорируем мутабельное создание
        return descriptor;
    }
}

const createGroup = (data: [string, string] | void) => {
    if (!data) {
        return;
    }
    return {
        uid: data[0],
        name: data[1],
    };
};

const recipe = new Recipe();
recipe.field('is', ['MetaType'], checkMetaType);
recipe.field('id', ['TypeId', 'Name']);
recipe.cacheField('MetaAttributes', (field) => {
    const result = {};
    // @ts-ignore
    field.each((attr) => {
        // @ts-ignore
        result[attr.get('Type')] = attr.get('Value')
            ? attr.get('Value').get('value')
            : attr.get('Value');
    });
    return result;
});
recipe.field('inherits', ['Inherits'], (data, record) => {
    let result = [];

    const is = META_CLASSES.get(record.get('MetaType')?.toLowerCase());
    if (is) {
        const tsId = is?.descriptorBase?.id;
        if (tsId) {
            result.push(is?.descriptorBase?.id);
        }
    }

    if (data) {
        result = result.concat(data);
    }

    return result;
});
recipe.field('required', ['MetaAttributes'], (data) => data.required ?? Recipe.NotExistsSymbol);
recipe.field('info', ['MetaAttributes'], (data) => {
    let group;
    if (data.group === 'Main') {
        group = undefined;
    } else {
        group = data.group ? createGroup(JSON.parse(data.group, jsonParseReviver)) : void 0;
    }
    return {
        title: data.title,
        description: data.description,
        icon: data.icon,
        category: data.category,
        group,
        extended: data.extended,
        order: data.order,
        hidden: data.hidden,
        disabled: data.readonly,
    };
});
recipe.field('defaultValue', ['MetaAttributes'], (data) =>
    data.defaultValue ? JSON.parse(data.defaultValue, jsonParseReviver) : Recipe.NotExistsSymbol
);
recipe.field('sampleData', ['MetaAttributes'], (data) =>
    data.sampleData ? JSON.parse(data.sampleData, jsonParseReviver) : Recipe.NotExistsSymbol
);
recipe.field('editor', ['MetaAttributes'], (data) =>
    createEditor(data.editor, data.editorProps, jsonParseReviver)
);
recipe.field('designtimeEditor', ['MetaAttributes'], (data) =>
    createDesignTimeEditor(
        data.designtimeEditor,
        data.designtimeEditorProps,
        data.designEditorAS,
        jsonParseReviver
    )
);
recipe.field('arrayOf', ['ArrayOf'], (data) => ({
    id: data,
}));
recipe.field('types', ['Elements'], (data) => {
    if (!data) {
        return Recipe.NotExistsSymbol;
    }
    const typesMeta: { [key: string]: IMeta<any> } = {};
    for (const element of data) {
        if (element.type === null) {
            typesMeta[element.id] = {
                is: MetaClass.primitive,
                id: 'null',
            };
            continue;
        }

        typesMeta[element.id] = {
            is: element.metatype,
            id: element.type,
            info: {
                title: element.display_name,
                description: element.tooltip,
            },
            fixedId: true,
        };
    }
    return typesMeta;
});
// recipe.field('attachedStyles');
recipe.field('attachedProperties', ['AttachedProperties'], (data) => {
    if (!data) {
        return Recipe.NotExistsSymbol;
    }
    const attachedProperties: object = {};
    data.each((record: SbisRecord) => {
        const is = META_CLASSES.get(record.get('Type')?.toLowerCase());
        const propName = record.get('Name');
        if (!propName) {
            return;
        }
        const metaAttributes = record.get('MetaAttributes');
        if (!metaAttributes) {
            return;
        }

        const result = {};
        // @ts-ignore
        metaAttributes.each((attr) => {
            const key = attr.get('Type');
            // @ts-ignore
            result[key] = attr.get('Value') ? attr.get('Value').get('value') : attr.get('Value');
        });
        // @ts-ignore
        attachedProperties[propName] = {
            id: is?.descriptorBase?.id || record.get('Type'),
            is: is?.descriptorBase?.is || checkMetaType(record.get('MetaType')),
            info: result,
            fixedId: true,
        };
    });
    return attachedProperties;
});
recipe.field('attachedEditors', ['MetaAttributes'], (data) => {
    if (!data?.attachedEditors) {
        return Recipe.NotExistsSymbol;
    }
    const attachedEditors = JSON.parse(data.attachedEditors, jsonParseReviver);
    return attachedEditors;
});
recipe.field('invariant', ['MetaAttributes'], (data) => data.discriminator_name);
recipe.field('access', ['MetaAttributes'], (data) => {
    const access: { rights?: string[]; mode?: number } = {};
    if (!!data.rights) {
        access.rights = JSON.parse(data.rights);
    }
    access.mode = createRightMode(data.rightmode);
    return access;
});
recipe.field('feature', ['MetaAttributes'], (data) =>
    data.feature ? JSON.parse(data.feature) : Recipe.NotExistsSymbol
);
recipe.field('components', ['MetaAttributes'], (data) =>
    data.componentUUID ? JSON.parse(data.componentUUID) : Recipe.NotExistsSymbol
);
recipe.field('roles', ['MetaAttributes'], (data) =>
    data.roles ? JSON.parse(data.roles) : Recipe.NotExistsSymbol
);
recipe.field('keywords', ['MetaAttributes'], (data) =>
    data.keywords ? JSON.parse(data.keywords) : Recipe.NotExistsSymbol
);
recipe.field('parent', ['MetaAttributes'], (data) =>
    data.parent ? JSON.parse(data.parent) : Recipe.NotExistsSymbol
);
recipe.field('attributes', ['Properties'], (data) => {
    if (!data) {
        return Recipe.NotExistsSymbol;
    }
    const properties: object = {};
    data.each((record: SbisRecord) => {
        const is = META_CLASSES.get(record.get('Type')?.toLowerCase());
        const propName = record.get('Name');
        if (!propName) {
            return;
        }
        const metaAttributes = record.get('MetaAttributes');
        if (!metaAttributes) {
            return;
        }

        const result = {};
        // @ts-ignore
        metaAttributes.each((attr) => {
            const key = attr.get('Type');
            // @ts-ignore
            result[key] = attr.get('Value') ? attr.get('Value').get('value') : attr.get('Value');
            // @ts-ignore это проблема данных
            if (result[key] === 'false') {
                // @ts-ignore
                result[key] = false;
            }
            // @ts-ignore это проблема данных
            if (result[key] === 'true') {
                // @ts-ignore
                result[key] = true;
            }
        });
        // @ts-ignore
        properties[propName] = {
            id: is?.descriptorBase?.id || record.get('Type'),
            is: is?.descriptorBase?.is || checkMetaType(record.get('MetaType')),
            info: result,
            fixedId: true,
        };

        // возможна ситуация, когда редактор не указан (задается через контекст),
        // а свойства для редактора передают в MetaAttributes
        // @ts-ignore
        if (properties[propName].info.editorprops) {
            // @ts-ignore
            properties[propName].editor = createEditor(
                undefined,
                // @ts-ignore
                properties[propName].info.editorprops,
                jsonParseReviver
            );
            // @ts-ignore
            properties[propName].editor.component = null;
        }
    });
    return properties;
});

/**
 * Обогощение аргументов метатипа функции данными от базовых типов
 * @param descriptorLink
 * @param complexTypes
 */
function unzipFunctionParameters(
    params: IFunctionParameters[],
    complexTypes: Record<string, TExistsIMeta>
): any[] {
    const metaParams = [];
    for (const param of params) {
        if (param.fields) {
            param.fields = unzipFunctionParameters(param.fields, complexTypes);
        }
        const descriptor = {
            is:
                META_CLASSES.get(param.type?.toLowerCase())?.descriptorBase.is ||
                complexTypes[param.type]?.is,
            id:
                META_CLASSES.get(param.type?.toLowerCase())?.descriptorBase.id ||
                complexTypes[param.type]?.id,
            fixedId: true,
            info: {
                title: param.name,
                icon: '',
                description: param.description,
            },
            required: param.is_required,
        };
        if (descriptor.is) {
            const construct = META_CLASSES.get(descriptor.is);
            if (!construct) {
                throw new DeserializeError(`Не найден тип для конвертации ${descriptor.is}`);
            }
            metaParams.push(
                new construct.constructor({ ...construct.descriptorBase, ...descriptor })
            );
        }
    }
    return metaParams;
}

/**
 * Обогощение дескриптора данными от базовых типов
 * @param descriptorLink
 * @param complexTypes
 */
function unzipLinkedDescriptor(
    descriptorLink: TExistsIMeta,
    complexTypes: Record<string, TExistsIMeta>
): void {
    if (descriptorLink.id === MetaClass.function) {
        (descriptorLink.info as IFunctionMetaInfo).parameters = unzipFunctionParameters(
            (descriptorLink.info as IFunctionMetaInfo).parameters,
            complexTypes
        );
    }

    if (!descriptorLink.id || META_CLASSES.has(descriptorLink.id?.toLowerCase())) {
        return;
    }

    const foundedComplexType = complexTypes[descriptorLink.id];
    if (foundedComplexType) {
        // Полный тип имеет обработку над приведением типа с сервиса к типам в ts
        descriptorLink.is = foundedComplexType.is;

        if (!('inherits' in descriptorLink && Array.isArray(descriptorLink.inherits))) {
            // @ts-ignore мы точно знаем что есть inherits
            descriptorLink.inherits = foundedComplexType.inherits
                ? [...foundedComplexType.inherits, foundedComplexType.id]
                : [foundedComplexType.id];
        }

        if ('invariant' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть invariant
            descriptorLink.invariant = descriptorLink.invariant ?? foundedComplexType.invariant;
        }

        if ('disabled' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть disabled
            descriptorLink.disabled = descriptorLink.disabled ?? foundedComplexType.disabled;
        }

        if ('types' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть types
            descriptorLink.types = descriptorLink.types ?? foundedComplexType.types;
        }

        if ('arrayOf' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть arrayOf
            descriptorLink.arrayOf = descriptorLink.arrayOf ?? foundedComplexType.arrayOf;
        }

        if ('attributes' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть attributes
            descriptorLink.attributes = descriptorLink.attributes ?? foundedComplexType.attributes;
        }
    }

    // распаковываем complexScope props

    if ('types' in descriptorLink && typeof descriptorLink.types === 'object') {
        Object.entries(descriptorLink.types).forEach(([propertyName, desc]) => {
            // @ts-ignore мы точно знаем что есть id
            const complex = complexTypes[desc.id];
            if (!complex) {
                return;
            }
            // @ts-ignore мы точно знаем что есть types
            descriptorLink.types[propertyName] = {
                ...complex,
                ...desc,
                info: {
                    ...complex.info,
                    ...desc.info,
                },
            };
        });
    }

    if ('arrayOf' in descriptorLink) {
        // @ts-ignore мы точно знаем что есть arrayOf
        descriptorLink.arrayOf = complexTypes[descriptorLink.arrayOf.id];
    }

    if ('attributes' in descriptorLink) {
        // @ts-ignore мы точно знаем что есть attributes
        Object.entries(descriptorLink.attributes).forEach(
            ([propertyName, attr]: { attr: TExistsIMeta }) => {
                unzipLinkedDescriptor(attr, complexTypes);
                // костыль на то что нужно создавать временный тип для атрибута
                if (attr.inherits) {
                    attr.inherits.push(attr.id);
                } else {
                    attr.inherits = [attr.id];
                }
                attr.id = propertyName;
            }
        );
    }
}

function checkMetaType(type: string): string {
    if (type === 'enum') {
        return MetaClass.variant;
    }
    if (type === 'flags') {
        return MetaClass.variant;
    }
    if (type === 'applicationobject') {
        return MetaClass.object;
    }
    return type;
}

interface FirstScopeData {
    [key: string]: unknown;
    ComplexTypes?: RecordSet;
    MetaType?: string;
    Properties?: RecordSet;
    propertiesForRecalculate?: Record<string, TTmpJsonFormatFromRecord>;
}

function extractComplexType(record: SbisRecord): Record<string, TExistsIMeta> {
    // извлекаем данные из рекорда
    const parsedJson: FirstScopeData = {};
    record.each((prop: string) => {
        parsedJson[prop] = record.get(prop);
    });
    const complexScope: Record<string, TExistsIMeta> = {};
    if (parsedJson.ComplexTypes) {
        // первый этап, вычисляем весь массив ComplexTypes
        parsedJson.ComplexTypes?.each((complexRecord: SbisRecord) => {
            const converter = new RecordConverter(recipe, complexRecord);
            const descriptor = converter.convert();
            complexScope[descriptor.id] = descriptor;
        });
    }

    return complexScope;
}

/**
 * @private
 */
export function deserializeInnerNew(
    recordSet: RecordSet,
    parser: typeof TypesSerializer.prototype.deserialize
): TExistsIMeta[] {
    if (!recordSet) {
        throw new DeserializeError('Переданы пустота для десереализации');
    }

    jsonParseReviver = parser;

    const metas: TExistsIMeta[] = [];
    recordSet.each((record: SbisRecord) => {
        const complexScope: Record<string, TExistsIMeta> = extractComplexType(record);
        Object.entries(complexScope).forEach(([_, complexDesc]) => {
            unzipLinkedDescriptor(complexDesc, complexScope);
        });
        const converter = new RecordConverter(recipe, record);
        const descriptor = converter.convert();
        unzipLinkedDescriptor(descriptor, complexScope);

        const construct = META_CLASSES.get(descriptor.is?.toLowerCase());
        if (!construct) {
            throw new DeserializeError(`Не найден тип для конвертации ${descriptor.is}`);
        }
        metas.push(new construct.constructor({ ...construct.descriptorBase, ...descriptor }));
    });
    return metas;
}
