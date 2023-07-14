import type { IMeta } from './baseMeta';
import { Meta, MetaClass } from './baseMeta';
import { ObjectMeta } from './object';
import type { IObjectMetaAttributes, ObjectMetaAttributes } from './object';
import type { TMetaJson } from './marshalling/format';
import { serialize } from './marshalling/serializer';


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

type IStyleAttributes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Key in keyof React.CSSProperties]?: Meta<any> | undefined;
};

export const StyleType = new ObjectMeta<React.CSSProperties>({
    is: MetaClass.object,
    id: '.style'
});

type TAttachedInterface<ComponentPropsInterface extends object> = {
    [attribute in keyof ComponentPropsInterface]?: ObjectMetaAttributes<{ className: Meta<string> }>
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

    attachedAttributes?: TAttachedInterface<ComponentPropsInterface>;

    styles?: IStyleAttributes;

    attachedStyles?: TAttachedInterface<ComponentPropsInterface>;

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
export class WidgetMeta<T = object,
    ComponentPropsInterface extends object = T extends object ? T : never
> extends ObjectMeta<T, ComponentPropsInterface> {
    /**
     * Правила проверки прав доступа, необходимых для работы виджета.
     */
    protected _access: IWidgetMetaAccess;

    protected _license: IWidgetMetaLicense;

    protected _feature: string;

    private _attachedAttributes: TAttachedInterface<ComponentPropsInterface> = {};

    private _styles: IStyleAttributes = {};

    private _attachedStyles: TAttachedInterface<ComponentPropsInterface> = {};

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
        this._attachedAttributes = descriptor.attachedAttributes ?? {};
        this._styles = descriptor.styles ?? {};
        this._attachedStyles = descriptor.attachedStyles ?? {};
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { ...this._attributes, '.style': StyleType.attributes<any>(this._styles) };
    }

    /**
     * Устанавливает список присоединяемых атрибутов для свойств
     * @param attributies
     */
    attachedAttributes(attributies: TAttachedInterface<ComponentPropsInterface>): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attachedAttributes: attributies });
    }

    /**
     * Получение присоеденяемых атрибутов
     * @param attributieName свойство к которому присоеденяют стили
     */
    getAttachedAttributes(attributieName?: string): TAttachedInterface<ComponentPropsInterface> {
        if (!attributieName) {
            return this._attachedAttributes;
        }
        return this._attachedAttributes[attributieName];
    }

    /**
     * Установка стилей виджета
     * @param styles объект где ключ из React.CSSProperties, а значением метатип
     */
    styles(styles?: IStyleAttributes): IStyleAttributes | this {
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
    appendStyles(styles: IStyleAttributes): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ styles: { ...this._styles, ...styles } });
    }

    /**
     * Получение стилей виджета
     */
    getStyles(): IStyleAttributes {
        return this._styles;
    }

    /**
     * Устанавливает присоединяемые стили
     * @param attributies
     */
    attachedStyles(attachedStyles: TAttachedInterface<ComponentPropsInterface>): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ attachedStyles });
    }

    /**
     * Получение присоеденяемых стилей
     * @param attributieName свойство к которому присоеденяют стили
     */
    getAttachedStyles(attributieName?: string): TAttachedInterface<ComponentPropsInterface> {
        if (!attributieName) {
            return this._attachedStyles;
        }
        return this._attachedStyles[attributieName];
    }

    /**
     * Изменяет правила проверки прав доступа, необходимых для работы виджета.
     */
    access(rights?: string[], mode: RightMode = RightMode.any): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({ access: { rights, mode } });
    }

    /**
     * Возвращает правила проверки прав доступа, необходимых для работы виджета.
     */
    getAccess(): IWidgetMetaAccess {
        return this._access;
    }

    license(licenseConfig: IWidgetMetaLicense): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({ license: licenseConfig });
    }

    getLicense(): IWidgetMetaLicense {
        return this._license;
    }

    feature(featureName: string): this {
        return this.clone<this, IWidgetMeta<ComponentPropsInterface>>({ feature: featureName });
    }

    getFeature(): string {
        return this._feature;
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
            feature: this._feature
        };
    }

    toJSON(): TMetaJson {
        return serialize(this);
    }
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
