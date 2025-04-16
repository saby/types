/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IArrayMeta } from '../array';
import { createEditor, createDesignTimeEditor } from './attributes';
import { createRightMode } from './rightmode';
import { Meta, IMeta, IGroup } from '../baseMeta';
import { MetaClass } from './format';
import { FunctionMeta, IFunctionMeta, IFunctionMetaInfo, IFunctionParameters } from '../function';
import { ObjectMeta, IObjectMeta } from '../object';
import { PromiseMeta, IPromiseMeta } from '../promise';
import { IVariantMeta, VariantMeta } from '../variant';
import { IEnumMeta, EnumMeta } from '../enum';
import { WidgetMeta, IWidgetMeta } from '../widget';
import { IPageMeta, PageMeta } from '../page';
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

type TInfoDescriptor = {
    editorprops?: string;
    editor?: string;
    hidden?: boolean;
    order?: number;
    required?: boolean;
    title?: string;
    tooltip?: string;
    nullable?: boolean;
};

type TServiceGroupDesc = IGroup | string;

type IElementsData = {
    display_group: TServiceGroupDesc;
    display_name: string;
    id: string;
    metatype: MetaClass;
    tooltip: string;
    type: string;
}[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TMetaConstructor = new (descriptor: object & { is: any; invariant?: any }) => TExistsIMeta;
interface IMetaConstruct {
    constructor: TMetaConstructor;
    descriptorBase: object & { is: MetaClass | string; id: string };
}

// @ts-ignore разобраться
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
            constructor: EnumMeta,
            descriptorBase: { is: MetaClass.enum, id: MetaClass.enum },
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
    [
        MetaClass.page,
        {
            constructor: PageMeta,
            descriptorBase: { is: MetaClass.page, id: MetaClass.page },
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
    | IEnumMeta<Record<string, object>>
    | IFunctionMeta<() => any, any>
    | IPromiseMeta<Promise<any>>
    | IPageMeta<object>
);

type TExistsIMeta = Mutable<TReadedIMeta>;

type TK =
    | keyof IWidgetMeta<any>
    | keyof IObjectMeta<any>
    | keyof IVariantMeta<any>
    | keyof IEnumMeta<any>
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

    constructor(
        private rules: Recipe,
        private record: SbisRecord
    ) {}

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
            // @ts-ignore почему то падает сборка юнитов на СП, ошибок сборки и ts нет
            descriptor[key] = value;
        });

        return transformToArray(this.record, descriptor) as TExistsIMeta;
    }
}

function getSafeGroup(group: string | IGroup | [string, string]): IGroup | undefined {
    if (!group) {
        return;
    }

    if (typeof group === 'string') {
        return {
            uid: group,
            name: group,
        };
    }

    if (Array.isArray(group)) {
        return {
            uid: group[0],
            name: group[1],
        };
    }

    return group;
}

const recipe = new Recipe();
recipe.field('is', ['MetaType'], checkMetaType);
recipe.field('id', ['TypeId', 'Name']);
recipe.cacheField('MetaAttributes', (field) => {
    const result = {};
    if (!field) {
        return result;
    }
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
recipe.field('nullable', ['MetaAttributes'], (data) => data.nullable ?? Recipe.NotExistsSymbol);
recipe.field('info', ['MetaAttributes'], (data) => {
    let group;

    if (!!data.group && data.group !== 'Main') {
        let rawGroup = data.group;
        if (typeof rawGroup === 'object') {
            // сервис типов пакует группу в лишний объект
            // https://dev.saby.ru/opendoc.html?guid=19f027fd-34a2-4f41-aaec-9cf6472dd47a&client=3
            rawGroup = rawGroup.value;
        }
        group = rawGroup ? getSafeGroup(JSON.parse(rawGroup, jsonParseReviver)) : void 0;
    } else {
        group = undefined;
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
recipe.field('complexEditors', ['MetaAttributes'], (data) =>
    data.complexeditors ? data.complexeditors : Recipe.NotExistsSymbol
);
recipe.field('arrayOf', ['ArrayOf'], (data) => ({
    id: data,
}));
recipe.field('types', ['Elements'], (data) => {
    return convertElementsToDescriptor(data);
});
recipe.field('elements', ['Elements'], (data) => {
    return convertElementsToDescriptor(data);
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

        const result: TInfoDescriptor = {};

        // @ts-ignore
        metaAttributes.each((attr) => {
            const key = attr.get('Type');
            // @ts-ignore
            result[key] = attr.get('Value') ? attr.get('Value').get('value') : attr.get('Value');
        });

        const editor = createEditor(result.editor, result.editorprops, jsonParseReviver);
        // @ts-ignore
        attachedProperties[propName] = {
            id: is?.descriptorBase?.id || record.get('Type'),
            is: is?.descriptorBase?.is || checkMetaType(record.get('MetaType')),
            info: result,
            required: result.required,
            nullable: result.nullable,
            editor,
            editorprops: result.editorprops,
            fixedId: true,
        };
        // возможна ситуация, когда редактор не указан (задается через контекст),
        // а свойства для редактора передают в MetaAttributes
        if (!result.editor && result.editorprops) {
            // @ts-ignore
            properties[propName].editor.component = null;
        }
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
    data.parent ? data.parent : Recipe.NotExistsSymbol
);
recipe.field('preview', ['MetaAttributes'], (data) =>
    data.preview ? JSON.parse(data.preview) : Recipe.NotExistsSymbol
);
recipe.field('attributes', ['Properties'], (data) => {
    if (!data) {
        return Recipe.NotExistsSymbol;
    }
    const properties: Partial<Mutable<IMeta<any>> & Record<string, any>> = {};
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

        const result: TInfoDescriptor = {};

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
        const editor = createEditor(result.editor, result.editorprops, jsonParseReviver);
        properties[propName] = {
            id: is?.descriptorBase?.id || record.get('Type'),
            is: is?.descriptorBase?.is || checkMetaType(record.get('MetaType')),
            info: result,
            required: result.required,
            nullable: result.nullable,
            editor,
            editorprops: result.editorprops,
            fixedId: true,
        };

        // возможна ситуация, когда редактор не указан (задается через контекст),
        // а свойства для редактора передают в MetaAttributes
        if (!result.editor && result.editorprops) {
            // @ts-ignore
            properties[propName].editor.component = null;
        }
        properties[propName] = transformToArray(record, properties[propName]);
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
            (descriptorLink.info as IFunctionMetaInfo).parameters as IFunctionParameters[],
            complexTypes
        );
    }

    if (!descriptorLink.id || META_CLASSES.has(descriptorLink.id?.toLowerCase())) {
        return;
    }

    const foundedComplexType = complexTypes[descriptorLink.id];

    if (foundedComplexType && descriptorLink !== foundedComplexType) {
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

        if ('defaultValue' in foundedComplexType) {
            descriptorLink.defaultValue =
                descriptorLink.defaultValue ?? foundedComplexType.defaultValue;
        }

        if ('sampleData' in foundedComplexType) {
            descriptorLink.sampleData = descriptorLink.sampleData ?? foundedComplexType.sampleData;
        }

        if ('required' in foundedComplexType) {
            descriptorLink.required = descriptorLink.required ?? foundedComplexType.required;
        }

        if ('editor' in foundedComplexType) {
            if (descriptorLink.editor?.loader === undefined) {
                descriptorLink.editor = foundedComplexType.editor;
            }
        }

        if ('designtimeEditor' in foundedComplexType) {
            if (descriptorLink.designtimeEditor?.loader === undefined) {
                descriptorLink.designtimeEditor = foundedComplexType.designtimeEditor;
            }
        }

        if ('types' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть types
            descriptorLink.types = descriptorLink.types ?? foundedComplexType.types;
        }

        if ('elements' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть elements
            descriptorLink.elements = descriptorLink.elements ?? foundedComplexType.elements;
        }

        if ('arrayOf' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть arrayOf
            descriptorLink.arrayOf = descriptorLink.arrayOf ?? foundedComplexType.arrayOf;
        }

        if ('attributes' in foundedComplexType) {
            // @ts-ignore мы точно знаем что есть attributes
            descriptorLink.attributes = descriptorLink.attributes ?? foundedComplexType.attributes;
        }

        if ('info' in foundedComplexType) {
            if (!descriptorLink.info) {
                descriptorLink.info = foundedComplexType.info;
            }
            descriptorLink.info = {
                ...foundedComplexType.info,
                ...descriptorLink.info,
            };
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
    if ('elements' in descriptorLink && typeof descriptorLink.elements === 'object') {
        Object.entries(descriptorLink.elements).forEach(([propertyName, desc]: [string, any]) => {
            // @ts-ignore мы точно знаем что есть id
            const complex = complexTypes[desc.id];
            if (!complex) {
                return;
            }
            // @ts-ignore мы точно знаем что есть elements
            descriptorLink.elements[propertyName] = {
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
        const currentArrayEditor = descriptorLink.arrayOf?.editor as Partial<{
            loader: string | Function;
            props: object;
        }>;
        // @ts-ignore мы точно знаем что есть arrayOf
        descriptorLink.arrayOf = complexTypes[descriptorLink.arrayOf.id];
        if (currentArrayEditor) {
            // применяем редактор свойства как редактор массива, т.к. на сервисе типом нет описания массива, то мы считаем массив и тип как составной ключ
            descriptorLink.editor = currentArrayEditor;
        }
    }

    if ('attributes' in descriptorLink) {
        // @ts-ignore мы точно знаем что есть attributes
        Object.entries(descriptorLink.attributes).forEach(
            // @ts-ignore
            ([_propertyName, attr]: [string, TExistsIMeta]) => {
                unzipLinkedDescriptor(attr, complexTypes);
                // костыль на то что нужно создавать временный тип для атрибута
                if (attr.inherits) {
                    attr.inherits.push(attr.id);
                } else {
                    attr.inherits = [attr.id];
                }
            }
        );
    }
}

function checkMetaType(type: string): string {
    // TODO: обратная совместимость с variantType удалить в 25.1100
    if (type === 'enum') {
        return MetaClass.enum;
    }
    if (type === 'flags') {
        return MetaClass.variant;
    }
    if (type === 'applicationobject') {
        return MetaClass.object;
    }
    return type;
}

function extractComplexType(record: SbisRecord): Record<string, TExistsIMeta> {
    const complexScope: Record<string, TExistsIMeta> = {};
    const ComplexTypesRs = record.get('ComplexTypes');
    if (ComplexTypesRs) {
        // первый этап, вычисляем весь массив ComplexTypes
        ComplexTypesRs.each((complexRecord: SbisRecord) => {
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
function convertElementsToDescriptor(data: IElementsData) {
    if (!data) {
        return Recipe.NotExistsSymbol;
    }
    const typesMeta: { [key: string]: IMeta<any> } = {};
    for (const element of data) {
        const metaInfo: IMeta<any> = {
            info: {
                title: element.display_name,
                description: element.tooltip,
                group: getSafeGroup(element.display_group),
            },
        };
        if (element.type === null) {
            typesMeta[element.id] = {
                is: MetaClass.primitive,
                id: 'null',
                ...metaInfo,
            };
            continue;
        }

        typesMeta[element.id] = {
            is: element.metatype,
            id: element.type,
            fixedId: true,
            ...metaInfo,
        };
    }
    return typesMeta;
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

function transformToArray(
    record: SbisRecord,
    descriptor: Partial<Mutable<IMeta<any>> & Record<string, any>>
) {
    // хардкод, создание псевдосущности для массива
    if (record.has('IsArray') && record.get('IsArray')) {
        const info = descriptor.info;
        const typeOf = descriptor.id || descriptor.is;
        delete descriptor.info;
        return {
            id: 'ArrayOf_' + typeOf,
            is: MetaClass.array,
            fixedId: true,
            arrayOf: descriptor,
            inherits: ['array'],
            info,
        };
    }
    return descriptor;
}
