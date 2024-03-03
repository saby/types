import type { IMeta } from './baseMeta';
import { Meta, MetaClass } from './baseMeta';
import type { IObjectMetaAttributes, ObjectMetaAttributes } from './object';
import { ObjectMeta } from './object';
import type { TMetaJson } from './marshalling/format';
import { serialize } from './marshalling/serializer';
import { loadAsync } from 'WasabyLoader/ModulesLoader';
import {
    ConvertableCheckerSignature,
    IValueConverter,
    LoadableConverterFunc,
    ValueConverterInputType,
    ValueConverterOutputType,
    ConvertableChecker,
    IConvertableChecker,
    ValueConverterLoader,
    FuncLoader,
    ValueConverter,
} from './valueConverter';

/**
 * Варианты проверки прав доступа.
 * @public
 */
export enum RightMode {
    any = 0,
    anyNested = 1,
    all = 10,
    allNested = 11,
}

interface IAttributeProps {
    [key: string]: object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TAttachedInterface<T extends IAttributeProps = any> = {
    [attribute in keyof T]?: ObjectMetaAttributes<T[attribute]>;
};

export type TOneOfCSSProperties = {
    [key: string]: string | number;
};

export const StyleType = new ObjectMeta<TOneOfCSSProperties>({
    is: MetaClass.object,
    info: {
        title: 'Style',
    },
    id: '.style',
    editor: {
        loader: () => loadAsync('Controls-editors/style:StyleEditor'),
    },
});

type TStyleAttributes =
    | {
          [selector in keyof CSSStyleDeclaration]?: Meta<number> | Meta<string>;
      }
    | {
          [key: string]: Meta<Partial<CSSStyleDeclaration>>; // TODO тут должено быть ObjectMeta, но без обязательных атрибутов
      };

type TAttachedStyles<T> = {
    [attribute in keyof T]?: TStyleAttributes;
};

/**
 * Правила проверки прав доступа, необходимых для работы виджета.
 * @public
 * @see WidgetMeta.access
 */
export interface IWidgetMetaAccess {
    /**
     * Список зон доступа, необходимых для работы виджета.
     * @public
     * @see IWidgetMetaAccess.mode
     */
    readonly rights?: string[];

    /**
     * Правила проверки прав доступа.
     * @default RightMode.any
     * @public
     * @see IWidgetMetaAccess.rights
     */
    readonly mode?: RightMode;
}

interface IWidgetMetaLicense {
    licenseConfig?: {
        licenseParams: object;
        dialogParams?: object;
    };
}

/**
 * Описание виджета.
 * @public
 * @see WidgetMeta
 */
export interface IWidgetMeta<ComponentPropsInterface extends object>
    extends IMeta<ComponentPropsInterface> {
    is: MetaClass.widget;

    /**
     * Правила проверки прав доступа, необходимых для работы виджета.
     * @public
     * @see IWidgetMetaAccess
     */
    readonly access?: IWidgetMetaAccess;

    readonly license?: IWidgetMetaLicense;

    readonly feature?: string;

    readonly relatedObjects?: string[];

    readonly components?: string[];

    readonly roles?: string[];

    readonly keywords?: string[];

    readonly valueConverterOutput?: IValueConverter<ValueConverterOutputType>;

    readonly valueConverterInput?: IValueConverter<ValueConverterInputType>;

    readonly isValueConvertable?: IConvertableChecker;

    attachedAttributes?: TAttachedInterface;

    styles?: TStyleAttributes;

    attachedStyles?: TAttachedStyles<ComponentPropsInterface>;

    /**
     * Описание свойств виджета.
     * @public
     */
    readonly attributes?:
        | ObjectMetaAttributes<ComponentPropsInterface>
        | IObjectMetaAttributes<ComponentPropsInterface>;
}

/**
 * Класс, реализующий тип "виджет".
 * @public
 * @see ObjectMeta
 */
export class WidgetMeta<
    T = object,
    ComponentPropsInterface extends object = T extends object ? T : never
> extends ObjectMeta<T, ComponentPropsInterface> {
    /**
     * Правила проверки прав доступа, необходимых для работы виджета.
     */
    protected _access: IWidgetMetaAccess;

    protected _license: IWidgetMetaLicense;

    protected _feature: string;

    protected _relatedObjects: string[];

    protected _components: string[];

    protected _roles: string[];

    protected _keywords: string[];

    private _attachedAttributes: TAttachedInterface = {};

    private _styles: TStyleAttributes = {};

    private _attachedStyles: TAttachedStyles<ComponentPropsInterface> = {};

    private _cachedStyleType: ObjectMeta;

    private _isValueConvertable?: ConvertableChecker;

    private _valueConverterOutput?: ValueConverter<ValueConverterOutputType>;

    private _valueConverterInput?: ValueConverter<ValueConverterInputType>;

    /**
     * Конструктор типа "виджет".
     * @param descriptor - Мета-описание виджета.
     */
    constructor(
        descriptor: IWidgetMeta<ComponentPropsInterface> = {
            is: MetaClass.widget,
        }
    ) {
        super(descriptor);
        this._access = {
            rights: descriptor.access?.rights,
            mode: descriptor.access?.mode ?? RightMode.any,
        };
        this._license = descriptor.license ?? {};
        this._feature = descriptor.feature ?? '';
        this._relatedObjects = descriptor.relatedObjects ?? [];
        this._components = descriptor.components ?? [];
        this._roles = descriptor.roles ?? [];
        this._keywords = descriptor.keywords ?? [];
        this._attachedAttributes = descriptor.attachedAttributes ?? {};
        this._styles = descriptor.styles ?? {};
        this._attachedStyles = descriptor.attachedStyles ?? {};
        this._valueConverterInput = this._createConverterFuncLoader<ValueConverterInputType>(
            descriptor,
            WidgetMeta.KEY_VALUE_CONVERTER_INPUT
        );
        this._valueConverterOutput = this._createConverterFuncLoader<ValueConverterOutputType>(
            descriptor,
            WidgetMeta.KEY_VALUE_CONVERTER_OUTPUT
        );
        this._isValueConvertable = this._createConverterFuncLoader<ConvertableCheckerSignature>(
            descriptor,
            WidgetMeta.KEY_VALUE_CONVERTER_CHECKER
        );
    }

    /**
     * Возвращает типы свойств виджета.
     * @public
     */
    attributes(): ObjectMetaAttributes<ComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета.
     * @param attributes - Атрибуты объекта.
     * @public
     */
    attributes<NewComponentPropsInterface extends object>(
        attributes: IWidgetMeta<NewComponentPropsInterface>['attributes']
    ): WidgetMeta<NewComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета или возвращает текущие.
     * @param [attributes] - Атрибуты объекта.
     * @public
     */
    attributes<NewComponentPropsInterface extends object>(
        attributes?: IWidgetMeta<NewComponentPropsInterface>['attributes']
    ): WidgetMeta<NewComponentPropsInterface> | ObjectMetaAttributes<ComponentPropsInterface> {
        if (!arguments.length) {
            return this._attributes;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attributes });
    }

    /**
     * Возвращает типы атрибутов объекта.
     */
    getAttributes(): ObjectMetaAttributes<ComponentPropsInterface> {
        if (Object.keys(this._styles).length === 0) {
            return this._attributes;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO тут должено быть ObjectMeta, но без обязательных атрибутов
        return { ...this._attributes, '.style': this._getCachedStyleType() };
    }

    /**
     * Устанавливает список присоединяемых атрибутов для свойств
     * @param attributies
     */
    attachedAttributes(attributies: TAttachedInterface): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attachedAttributes: attributies });
    }

    /**
     * Получение присоеденяемых атрибутов
     * @param attributieName свойство к которому присоеденяют стили
     */
    getAttachedAttributes(
        attributieName?: string
    ): TAttachedInterface | ObjectMetaAttributes<Record<string, unknown>> {
        if (!attributieName) {
            return this._attachedAttributes;
        }
        return this._attachedAttributes[attributieName];
    }

    /**
     * Установка стилей виджета
     * @param styles объект где ключ из React.CSSProperties, а значением метатип
     */
    styles(styles?: TStyleAttributes): TStyleAttributes | this {
        if (!arguments.length) {
            return this._styles;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ styles });
    }

    /**
     * Добавление стилей виджета к текущем
     * @param styles объект где ключ из React.CSSProperties, а значением метатип
     */
    appendStyles(styles: TStyleAttributes): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ styles: { ...this._styles, ...styles } });
    }

    /**
     * Получение стилей виджета
     */
    getStyles(): TStyleAttributes {
        return this._styles;
    }

    /**
     * Устанавливает присоединяемые стили
     * @param attributies
     */
    attachedStyles(attachedStyles: TAttachedStyles<ComponentPropsInterface>): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attachedStyles });
    }

    /**
     * Получение присоеденяемых стилей
     * @param attributieName свойство к которому присоеденяют стили
     */
    getAttachedStyles(
        attributieName?: string
    ): TAttachedStyles<ComponentPropsInterface> | TStyleAttributes {
        if (!attributieName) {
            return this._attachedStyles;
        }
        return this._attachedStyles[attributieName];
    }

    /**
     * Изменяет правила проверки прав доступа, необходимых для работы виджета.
     */
    access(rights?: string[], mode: RightMode = RightMode.any): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            access: { rights, mode },
        });
    }

    /**
     * Возвращает правила проверки прав доступа, необходимых для работы виджета.
     */
    getAccess(): IWidgetMetaAccess {
        return this._access;
    }

    /**
     * Устанавливает лицензию для виджета
     */
    license(licenseConfig: IWidgetMetaLicense): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            license: licenseConfig,
        });
    }

    /**
     * Возвращает лицензию виджета
     */
    getLicense(): IWidgetMetaLicense {
        return this._license;
    }

    /**
     * Устанавливает фичу для виджета
     */
    feature(featureName: string): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            feature: featureName,
        });
    }

    /**
     * Возвращает фичу виджета
     */
    getFeature(): string {
        return this._feature;
    }

    /**
     * Устанавливает набор эндпоинтов для виджета.
     * Подробнее о relatedObjects можно прочитать {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/widget/#_2 здесь}
     */
    relatedObjects(relatedObjects: string[]): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            relatedObjects,
        });
    }

    /**
     * Возвращает набор эндпоинтов виджета.
     * Подробнее о relatedObjects можно прочитать {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/widget/#_2 здесь}
     */
    getRelatedObjects(): string[] {
        return this._relatedObjects;
    }

    /**
     * Устанавливает список идентификаторов компонентов, к которым привязан виджет
     */
    components(components: string[]): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            components,
        });
    }

    /**
     * Возвращает список идентификаторов компонентов, к которым привязан виджет
     */
    getComponents(): string[] {
        return this._components;
    }

    /**
     * Устанавливает список ролей, для которых доступен виджет
     */
    roles(roles: string[]): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            roles,
        });
    }

    /**
     * Возвращает список ролей, для которых доступен виджет
     */
    getRoles(): string[] {
        return this._roles;
    }

    /**
     * Устанавливает список ключевых слов
     */
    keywords(keywords: string[]): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            keywords,
        });
    }

    /**
     * Возвращает список ключевых слов
     */
    getKeywords(): string[] {
        return this._keywords;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IWidgetMeta<ComponentPropsInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.widget,
            attachedAttributes: this._attachedAttributes,
            styles: this._styles,
            attachedStyles: this._attachedStyles,
            access: this._access,
            license: this._license,
            feature: this._feature,
            relatedObjects: this._relatedObjects,
            components: this._components,
            roles: this._roles,
            keywords: this._keywords,

            valueConverterInput:
                this._valueConverterInput?.loader || this._valueConverterInput?.func
                    ? this._valueConverterInput
                    : undefined,
            valueConverterOutput:
                this._valueConverterOutput?.loader || this._valueConverterOutput?.func
                    ? this._valueConverterOutput
                    : undefined,
            isValueConvertable:
                this._isValueConvertable?.loader || this._isValueConvertable?.func
                    ? this._isValueConvertable
                    : undefined,
        };
    }

    toJSON(): TMetaJson {
        return serialize(this);
    }

    private _createConverterFuncLoader<
        FS extends ValueConverterOutputType | ValueConverterInputType | ConvertableCheckerSignature
    >(descriptor: IWidgetMeta<ComponentPropsInterface>, converterKey: string) {
        const loader = descriptor[converterKey]?.loader;
        const func = descriptor[converterKey]?.func;

        if (!loader && !func) {
            return undefined;
        }

        return new LoadableConverterFunc<FS>({ loader, func });
    }

    // Формируем единожды тип для стилей со свойствами, чтобы у него была единая ссылка
    // и иденитификатор
    private _getCachedStyleType() {
        if (!this._cachedStyleType) {
            this._cachedStyleType = StyleType.clone({
                attributes: this._styles,
                id: StyleType.getId(),
            });
        }

        return this._cachedStyleType;
    }

    /**
     * Устанавливает конвертер контента, обрабатываемого перед извлечением из виджета в процессе конвертации
     */
    valueConverterOutput(loader?: ValueConverterLoader<ValueConverterOutputType> | string) {
        if (this._valueConverterOutput?.loader === loader) {
            return this;
        }

        if (!loader) {
            return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
                valueConverterOutput: undefined,
            });
        }

        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            valueConverterOutput: new ValueConverter<ValueConverterOutputType>({ loader }),
        });
    }

    /**
     * Возвращает конвертер контента, обрабатываемого перед извлечением из виджета в процессе конвертации
     */
    getValueConverterOutput() {
        return this._valueConverterOutput;
    }

    /**
     * Устанавливает конвертер контента, обрабатываемого перед вставкой в виджет в процессе конвертации
     */
    valueConverterInput(loader: ValueConverterLoader<ValueConverterInputType> | string) {
        if (this._valueConverterInput?.loader === loader) {
            return this;
        }

        if (!loader) {
            return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
                valueConverterInput: undefined,
            });
        }

        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            valueConverterInput: new ValueConverter<ValueConverterInputType>({ loader }),
        });
    }

    /**
     * Возвращает конвертер контента, обрабатываемого перед вставкой в виджет в процессе конвертации
     */
    getValueConverterInput() {
        return this._valueConverterInput;
    }

    /**
     * Устанавливает функцию, определяющую конвертируемость входящего элемента в текущий
     */
    isValueConvertable(loader: FuncLoader<ConvertableCheckerSignature> | string) {
        if (this._isValueConvertable?.loader === loader) {
            return this;
        }

        if (!loader) {
            return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
                isValueConvertable: undefined,
            });
        }

        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            isValueConvertable: new ConvertableChecker({ loader }),
        });
    }

    getIsValueConvertable() {
        return this._isValueConvertable;
    }

    static KEY_VALUE_CONVERTER_INPUT: string = 'valueConverterInput';
    static KEY_VALUE_CONVERTER_OUTPUT: string = 'valueConverterOutput';
    static KEY_VALUE_CONVERTER_CHECKER: string = 'isValueConvertable';
}

/**
 * Определяет, что аргумент - это мета-описание виджета.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isWidgetMetaDescriptor<PropsRuntimeInterface extends object = never>(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    descriptor: any
): descriptor is IWidgetMeta<PropsRuntimeInterface> {
    return descriptor?.is === MetaClass.widget;
}

Meta.registerChildMeta(WidgetMeta, isWidgetMetaDescriptor);
