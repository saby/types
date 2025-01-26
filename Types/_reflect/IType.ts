/**
 * Идентификатор типа для которого можно получить мета информацию. По умолчанию поддерживается возможность получения метаинформации по стоковому идентификатору.
 */
export type TTypeId = string;

/**
 * Опции для представления
 * @public
 */
export type ISourceArguments = Record<string, unknown>;

/**
 * Настройки представления экземпляра типа.
 * @public
 */
export interface ITypeSource {
    /**
     * Путь до конструктора или функции, который создает объект этого типа.
     */
    reference?: string;
    /**
     * Аргументы для конструктора или функции, переданные в reference.
     */
    arguments?: ISourceArguments;
    /**
     * Путь до js метода, который вернет конфигурацию для загрузки данных. (аналогично как предзагрузка для страниц сайта). В результате загрузки, данные будут помещены в свойства виджета, где названию конфига будут соответствовать загруженные данных. Данная настройка является временной, и будет удалена. Для организации загрузки данных необходимо использовать карту данных.
     */
    sourceConfigGetter?: string;
}

/**
 * Общие базовые настройки используемые в описании типа и свойств объекта типа.
 * @public
 */
export interface ITypeDescription {
    /**
     * Название типа для отображения в пользовательском интерфейсе.
     */
    title?: string;
    /**
     * Подробное описание.
     */
    description?: string;
    /**
     * Иконка.
     */
    icon?: string;
    /**
     * Категория. Может использоваться для группировки редакторов.
     */
    category?: string;
    /**
     * Настройки редакторов.
     */
    source?: Record<string, ITypeSource>;
    /**
     * Информация о свойствах объекта типа.
     */
    properties: Record<string, IProperty<unknown>>;
    /**
     *
     */
    meta?: Record<string, unknown>;
}

/**
 * @public
 */
export interface IProperty<T> {
    /**
     * Порядковый номер свойства при отображении в интерфейсе.
     */
    order: number;
    /**
     * Тип свойства.
     */
    type: TTypeId;
    /**
     * Значение по умолчанию.
     */
    defaultValue?: T;
    /**
     * Дополнительное описание свойства. Формат описания свойства является подмножеством формата описания типа. Описание свойства может быть полностью отдельно описано как тип и задано через поле {@link Types/reflect:IProperty#type type}. Либо можно использовать готовый тип свойства, но дополнительно сконфигурировать свойство по месту с помощью {@link Types/reflect:IProperty#propertyDescription propertyDescription}.
     */
    propertyDescription?: ITypeDescription;
}

/**
 * @public
 */
export interface IPropertyArrayItem<T> extends IProperty<T> {
    name: string;
}

/**
 * Описание типа.
 * @public
 */
export interface IType extends ITypeDescription {
    /**
     * Текстовый идентификатор типа.
     */
    typeId: TTypeId;
    /**
     * массив идентификаторов типов от которых наследуется данный тип.
     */
    extends?: TTypeId[];
    /**
     * массив зон доступа, необходимых для использования объектов этого типа.
     */
    permissions?: string[];
    /**
     *
     */
    permissionMode?: number;
}
