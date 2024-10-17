import type { IMeta } from './baseMeta';
import { Meta, MetaClass } from './baseMeta';
import type { IObjectMetaProperties, ObjectMetaProperties } from './object';
import { ObjectMeta } from './object';
import { RightMode } from './marshalling/rightmode';
import type { TMetaJson } from './marshalling/format';
import { serialize } from './marshalling/serializer';
import { serialize as serializeNew } from './marshalling/serializerNew';
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
import { App, logger } from 'Application/Env';

interface IAttributeProps {
    [key: string]: object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TAttachedInterface<T extends IAttributeProps = any> = {
    [property in keyof T]?: ObjectMetaProperties<T[property]>;
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

    readonly roles?: string[];

    readonly keywords?: string[];

    readonly parent?: string;

    readonly valueConverterOutput?: IValueConverter<ValueConverterOutputType>;

    readonly valueConverterInput?: IValueConverter<ValueConverterInputType>;

    readonly isValueConvertable?: IConvertableChecker;

    attachedProperties?: TAttachedInterface;

    styles?: TStyleAttributes;

    attachedStyles?: TAttachedStyles<ComponentPropsInterface>;

    /**
     * Описание свойств виджета.
     * @public
     * @deprecated Свойство устарело, вместо него следует использовать properties
     */
    readonly attributes?:
        | ObjectMetaProperties<ComponentPropsInterface>
        | IObjectMetaProperties<ComponentPropsInterface>;

    /**
     * Описание свойств виджета.
     * @public
     */
    readonly properties?:
        | ObjectMetaProperties<ComponentPropsInterface>
        | IObjectMetaProperties<ComponentPropsInterface>;
}

const DEFAULT_ICON = 'icon-Widget';

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

    protected _roles: string[];

    protected _keywords: string[];

    protected _parent: string;

    private _attachedProperties: TAttachedInterface = {};

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
        this._roles = descriptor.roles ?? [];
        this._keywords = descriptor.keywords ?? [];
        this._parent = descriptor.parent ?? '';
        this._attachedProperties = descriptor.attachedProperties ?? {};
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

        if (this._info.icon === undefined) {
            this._info.icon = DEFAULT_ICON;
        }
    }

    /**
     * Возвращает типы свойств виджета.
     * @public
     * @deprecated Метод устарел, вместо него следует использовать properties()
     */
    attributes(): ObjectMetaProperties<ComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета.
     * @param properties - Атрибуты объекта.
     * @public
     * @deprecated Метод устарел, вместо него следует использовать properties()
     */
    attributes<NewComponentPropsInterface extends object>(
        properties: IWidgetMeta<NewComponentPropsInterface>['properties']
    ): WidgetMeta<NewComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета или возвращает текущие.
     * @param [properties] - Атрибуты объекта.
     * @public
     * @deprecated Метод устарел, вместо него следует использовать properties()
     */
    attributes<NewComponentPropsInterface extends object>(
        properties?: IWidgetMeta<NewComponentPropsInterface>['properties']
    ): WidgetMeta<NewComponentPropsInterface> | ObjectMetaProperties<ComponentPropsInterface> {
        if (App.instance) {
            logger.error(
                'Meta/types: метод attributes устарел вместо него следует использовать properties'
            );
        }
        if (!arguments.length) {
            return this._properties;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ properties });
    }

    /**
     * Возвращает типы атрибутов объекта.
     * @deprecated Метод устарел, вместо него следует использовать getProperties()
     */
    getAttributes(): ObjectMetaProperties<ComponentPropsInterface> {
        if (App.instance) {
            logger.error(
                'Meta/types: метод getAttributes устарел вместо него следует использовать getProperties'
            );
        }
        if (Object.keys(this._styles).length === 0) {
            return this._properties;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO тут должено быть ObjectMeta, но без обязательных атрибутов
        return { ...this._properties, '.style': this._getCachedStyleType() };
    }

    /**
     * Возвращает типы свойств виджета.
     * @public
     */
    properties(): ObjectMetaProperties<ComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета.
     * @param properties - Атрибуты объекта.
     * @public
     */
    properties<NewComponentPropsInterface extends object>(
        properties: IWidgetMeta<NewComponentPropsInterface>['properties']
    ): WidgetMeta<NewComponentPropsInterface>;

    /**
     * Меняет типы свойств виджета или возвращает текущие.
     * @param [properties] - Атрибуты объекта.
     * @public
     */
    properties<NewComponentPropsInterface extends object>(
        properties?: IWidgetMeta<NewComponentPropsInterface>['properties']
    ): WidgetMeta<NewComponentPropsInterface> | ObjectMetaProperties<ComponentPropsInterface> {
        if (!arguments.length) {
            return this._properties;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ properties });
    }

    /**
     * Возвращает типы атрибутов объекта.
     */
    getProperties(): ObjectMetaProperties<ComponentPropsInterface> {
        if (Object.keys(this._styles).length === 0) {
            return this._properties;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO тут должено быть ObjectMeta, но без обязательных атрибутов
        return { ...this._properties, '.style': this._getCachedStyleType() };
    }

    /**
     * Устанавливает список присоединяемых атрибутов для свойств
     * @param properties
     */
    attachedProperties(properties: TAttachedInterface): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attachedProperties: properties });
    }

    /**
     * Получение присоеденяемых атрибутов
     * @param propertyName свойство к которому присоеденяют стили
     */
    getAttachedProperties(
        propertyName?: string
    ): TAttachedInterface | ObjectMetaProperties<Record<string, unknown>> {
        if (!propertyName) {
            return this._attachedProperties;
        }
        return this._attachedProperties[propertyName];
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
     * @param attributes
     */
    attachedStyles(attachedStyles: TAttachedStyles<ComponentPropsInterface>): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attachedStyles });
    }

    /**
     * Получение присоеденяемых стилей
     * @param attributeName свойство к которому присоеденяют стили
     */
    getAttachedStyles(
        attributeName?: string
    ): TAttachedStyles<ComponentPropsInterface> | TStyleAttributes {
        if (!attributeName) {
            return this._attachedStyles;
        }
        return this._attachedStyles[attributeName];
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
     * Устанавливает родительский виджет, бз которого текущий виджет существовать не может
     */
    parent(parent: string): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({
            parent,
        });
    }

    /**
     * Возвращает родительский виджет
     */
    getParent(): string {
        return this._parent;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IWidgetMeta<ComponentPropsInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.widget,
            attachedProperties: this._attachedProperties,
            styles: this._styles,
            attachedStyles: this._attachedStyles,
            access: this._access,
            license: this._license,
            roles: this._roles,
            keywords: this._keywords,
            parent: this._parent,

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

    /**
     * Преобразует в json для сохранения в сервисе метатипов
     */
    saveMeta(isNewFormat: boolean = false): TMetaJson {
        // проверяем на true, т.к. нативный JSON.stringify вызывает toJSON() с аргументами
        // например JSON.stringify([a, b]), вызовет a.toJSON('0') и b.toJSON('1')
        return isNewFormat === true ? serializeNew(this) : serialize(this);
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
                properties: this._styles,
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
            valueConverterOutput: new ValueConverter<ValueConverterOutputType>({
                loader,
            }),
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
            valueConverterInput: new ValueConverter<ValueConverterInputType>({
                loader,
            }),
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
