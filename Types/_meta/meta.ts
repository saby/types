// Важно: Интерфейсы, классы и функции нельзя разнести по разным файлам, т.к. все они сильно связаны друг с другом!

import { ReactNode } from 'react';
import {
    IComponentLoader,
    IEditorProps,
    IComponentLoaderWithProps,
    ComponentLoaderWithProps,
    ObjectComponentLoaderWithProps,
    IComponent,
} from './components';
import type { IControlDesignerProps } from './design';

/**
 * Указатель на то, каким классом конструировать тип.
 */
export enum MetaClass {
    widget = 'widget',
    primitive = 'primitive',
    object = 'object',
    array = 'array',
    promise = 'promise',
    function = 'function',
    union = 'union',
}

/**
 * Интерфейс общих свойств для редактора и его раскладки.
 * @private
 */
interface IPropertyEditorCommonProps {
    /**
     * Ссылка на иконку для редактора.
     */
    icon?: string;

    /**
     * Название редактора.
     */
    title?: string;

    /**
     * Детальное описание редактора.
     */
    description?: string;

    /**
     * Обязательно ли значение.
     */
    required?: boolean;

    /**
     * Признак недоступности свойства для редактирования.
     */
    disabled?: boolean;
}

/**
 * Интерфейс компонента, оборачивающего редакторы.
 * @public
 */
export interface IPropertyEditorLayoutProps extends IPropertyEditorCommonProps {
    /**
     * Редактор.
     */
    children: ReactNode;
}

/**
 * Интерфейс свойств редактора типа (React-компонента).
 * @public
 */
export interface IPropertyEditorProps<RuntimeInterface>
    extends IEditorProps<RuntimeInterface>,
        IPropertyEditorCommonProps {
    /**
     * Тип свойства.
     * @deprecated Используйте metaType.
     */
    type?: Meta<RuntimeInterface>;

    /**
     * Тип свойства.
     */
    metaType?: Meta<RuntimeInterface>;

    /**
     * Название свойства в объекте (ключ свойства).
     */
    name?: string;
}

/**
 * Интерфейс загрузчиков редакторов по-умолчанию.
 */
export type IEditorLoaders = Record<
    string,
    IComponentLoader<IPropertyEditorProps<any>>
>;

/**
 * Интерфейс карты загрузчиков редакторов по-умолчанию.
 */
type EditorLoaders = WeakMap<
    IComponentLoader<IPropertyEditorProps<any>>,
    ComponentLoaderWithProps<IPropertyEditorProps<any>>
>;

/**
 * Карта загрузчиков редакторов по-умолчанию.
 */
const defaultEditors: EditorLoaders = new WeakMap();

/**
 * Поля, которые задаются Property Grid-ом и не могут быть переопределены.
 * @private
 */
type IPropertyEditorHiddenProps = keyof IPropertyEditorProps<any>;

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

/**
 * Вспомогательный тип, удаляющий из Union типы, перечисленные вторым аргументом.
 * @remark
 * Используется для required(), чтобы превратить RuntimeInterface | undefined в RuntimeInterface.
 * @example
 * Exclude<number | string | null | undefined, null | undefined> = number | string
 * @public
 */
export type Exclude<T, U> = T extends U ? never : T;

/**
 * Описание логических условий.
 * @see IMetaInfo.hidden
 * @see IMetaInfo.disabled
 */
export type Condition = boolean;

/**
 * Визуальное описание для представления в различных View, таких, как палитра или магазин.
 * @public
 */
export interface IMetaInfo {
    /**
     * Название.
     * @public
     */
    readonly title?: string;

    /**
     * Детальное описание.
     * @public
     */
    readonly description?: string;

    /**
     * Иконка.
     * @remark
     * Ссылка на SVG-файл.
     * @example
     * "/cdn/MyModule/1.0.0/widgetIcon.svg"
     * @public
     */
    readonly icon?: string;

    /**
     * Название категории.
     * @remark
     * Используется для визуального разделения на разные блоки.
     * @public
     * @see IMetaInfo.group
     * @see IMetaInfo.order
     */
    readonly category?: string;

    /**
     * Название группы в категории.
     * @remark
     * Используется для визуального разделения на разные блоки внутри категории.
     * @public
     * @see IMetaInfo.category
     * @see IMetaInfo.order
     */
    readonly group?: string;

    /**
     * Порядковый номер в категории.
     * @remark
     * Чем меньше значение, тем выше располагается визуальный компонент.
     * Если значение не указано, порядок определяется автоматически.
     * Виджеты с указанным `order` располагаются выше виджетов без `order`.
     * @public
     * @see IMetaInfo.category
     * @see IMetaInfo.group
     */
    readonly order?: number;

    /**
     * Информация скрыта от пользователя.
     * @public
     */
    readonly hidden?: Condition;

    /**
     * Редактирование запрещено.
     * @public
     */
    readonly disabled?: Condition;
}

/**
 * Указатель на оригинальное мета-описание и ключ в нём.
 * @public
 * @see IMeta.origin
 */
export interface IMetaOrigin<RuntimeInterface extends object = any> {
    meta: IObjectMeta<RuntimeInterface>;
    key: string;
}

/**
 * Указатель на оригинальный тип и ключ в нём.
 * @public
 * @see Meta.getOrigin
 */
export interface MetaOrigin<RuntimeInterface extends object = any> {
    meta: ObjectMeta<RuntimeInterface>;
    key: string;
}

/**
 * Интерфейс базового мета-описания.
 * @public
 * @see Meta
 */
export interface IMeta<RuntimeInterface> {
    readonly is?: MetaClass;

    /**
     * Уникальный идентификатор типа.
     * @public
     * @see IMeta.inherits
     * @see Meta.id
     */
    readonly id?: string;

    /**
     * Список идентификаторов типов, от которых был унаследован этот.
     * @public
     * @see IMeta.id
     * @see Meta.is
     */
    readonly inherits?: string[];

    /**
     * Флаг того, что значение обязательно.
     * @public
     * @default true
     * @see Meta.required
     */
    readonly required?: boolean;

    /**
     * Визуальное описание для представления в Property Grid-е.
     * @public
     * @see IMetaInfo
     */
    readonly info?: IMetaInfo;

    /**
     * Редактора типа.
     * @public
     */
    readonly editor?: IComponentLoaderWithProps<
        IPropertyEditorProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    >;

    /**
     * Редактора типа.
     * @public
     */
    readonly designtimeEditor?: IComponentLoaderWithProps<
        IPropertyEditorProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    >;

    /**
     * Начальное значение для редактора типа.
     * @public
     * @see Meta.defaultValue
     */
    readonly defaultValue?: RuntimeInterface;

    /**
     * Ссылка на родительский тип объекта.
     * @public
     * @see IMetaOrigin
     * @see Meta.getOrigin
     */
    readonly origin?: IMetaOrigin | MetaOrigin;
}

/**
 * Интерфейс мета-описания примитивного значения.
 * @public
 * @see IMeta
 */
export interface IPrimitiveMeta<RuntimeInterface>
    extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.primitive;
}

/**
 * Интерфейс мета-описания атрибутов объекта.
 * @remark
 * Требует описать каждый атрибут `RuntimeInterface` через `IMeta`.
 * Допускается указывать `null`, если этот атрибут неважен для конструктора;
 *   поведение аналогично мета-описанию с `info.hidden=true`.
 * @public
 * @see IObjectMeta.attributes
 * @see IMeta
 * @see IMeta.hidden
 */
export type IObjectMetaAttributes<RuntimeInterface extends object> = {
    [Key in keyof RuntimeInterface]-?: IMeta<RuntimeInterface[Key]> | null;
};

/**
 * Интерфейс атрибутов объекта.
 * @remark
 * Требует описать каждый атрибут RuntimeInterface через `Meta`.
 * Допускается указывать `null`, если этот атрибут неважен для конструктора;
 *   поведение аналогично типу с `isHidden()`.
 * @public
 * @see IObjectMetaAttributes
 * @see IObjectMeta.attributes
 * @see IMeta
 * @see IMeta.hidden
 */
export type ObjectMetaAttributes<RuntimeInterface extends object> = {
    [Key in keyof RuntimeInterface]-?: Meta<RuntimeInterface[Key]> | null;
};

/**
 * Интерфейс мета-описания объекта.
 * @public
 * @see IMeta
 * @see IObjectMetaAttributes
 */
export interface IObjectMeta<RuntimeInterface extends object>
    extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.object;

    /**
     * Описание атрибутов объекта.
     * @public
     * @see IObjectMetaAttributes
     */
    readonly attributes?:
        | ObjectMetaAttributes<RuntimeInterface>
        | IObjectMetaAttributes<RuntimeInterface>;
}

/**
 * Интерфейс мета-описания массива.
 * @public
 * @see IMeta
 */
export interface IArrayMeta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.array;

    /**
     * Тип или мета-описание элемента массива.
     * @see IMeta
     */
    readonly arrayOf?: IMeta<ItemRuntimeInterface> | Meta<ItemRuntimeInterface>;
}

/**
 * Интерфейс мета-описания вариативного типа.
 */
export interface IUnionMeta<RuntimeInterface> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.union;

    /**
     * Типы или мета-описания вариантов.
     */
    readonly types?: (IMeta<any> | Meta<any>)[];
}

/**
 * Интерфейс мета-описания "обещания".
 * @public
 * @see IMeta
 */
export interface IPromiseMeta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.promise;

    /**
     * Тип или мета-описание значения, возвращаемого промисом.
     * @public
     * @see IMeta
     */
    readonly result?:
        | IMeta<ResolvedRuntimeInterface>
        | Meta<ResolvedRuntimeInterface>
        | null;
}

/**
 * Интерфейс описания аргументов для IFunctionMeta.
 * @remark
 * Интерфейс используется для описания любой функции с количеством аргументов не более 5.
 * @public
 * @see IAnyFunction
 * @see IFunctionArguments
 * @see FunctionMeta
 */
export type IMetas<A, B, C, D, E> = A extends void
    ? []
    : B extends void
    ? [IMeta<A>]
    : C extends void
    ? [IMeta<A>, IMeta<B>]
    : D extends void
    ? [IMeta<A>, IMeta<B>, IMeta<C>]
    : E extends void
    ? [IMeta<A>, IMeta<B>, IMeta<C>, IMeta<D>]
    : [IMeta<A>, IMeta<B>, IMeta<C>, IMeta<D>, IMeta<E>];

/**
 * Интерфейс описания аргументов для FunctionMeta.
 * @remark
 * Интерфейс используется для описания любой функции с количеством аргументов не более 5.
 * @public
 * @see IAnyFunction
 * @see IFunctionArguments
 * @see FunctionMeta
 */
export type Metas<A, B, C, D, E> = A extends void
    ? []
    : B extends void
    ? [Meta<A>]
    : C extends void
    ? [Meta<A>, Meta<B>]
    : D extends void
    ? [Meta<A>, Meta<B>, Meta<C>]
    : E extends void
    ? [Meta<A>, Meta<B>, Meta<C>, Meta<D>]
    : [Meta<A>, Meta<B>, Meta<C>, Meta<D>, Meta<E>];

/**
 * Интерфейс аргументов любой функции.
 * @remark
 * Количество аргументов не может быть больше 5.
 * @public
 * @see IAnyFunction
 * @see IMetas
 * @see FunctionMeta
 */
export type IFunctionArguments<
    A = void,
    B = void,
    C = void,
    D = void,
    E = void
> = A extends void
    ? []
    : B extends void
    ? [A]
    : C extends void
    ? [A, B]
    : D extends void
    ? [A, B, C]
    : E extends void
    ? [A, B, C, D]
    : [A, B, C, D, E];

/**
 * Интерфейс любой функции.
 * @remark
 * Интерфейс описывает любую функцию с количеством аргументов не более 5.
 * @public
 * @see IMetas
 * @see IFunctionArguments
 * @see FunctionMeta
 */
export type IAnyFunction<
    R = void,
    A = void,
    B = void,
    C = void,
    D = void,
    E = void
> = A extends void
    ? () => R
    : B extends void
    ? (a: A) => R
    : C extends void
    ? (a: A, b: B) => R
    : D extends void
    ? (a: A, b: B, c: C) => R
    : E extends void
    ? (a: A, b: B, c: C, d: D) => R
    : (a: A, b: B, c: C, d: D, e: E) => R;

/**
 * Интерфейс мета-описания функции.
 * @public
 * @see IMeta
 * @see IAnyFunction
 */
export interface IFunctionMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.function;

    /**
     * Список типов или мета-описаний аргументов функции.
     */
    readonly arguments?: IMetas<A, B, C, D, E> | Metas<A, B, C, D, E>;

    /**
     * Тип или мета-описание результата функции.
     */
    readonly result?: IMeta<R> | Meta<R>;
}

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

    /**
     * Описание свойств виджета.
     * @public
     */
    readonly attributes?:
        | ObjectMetaAttributes<ComponentPropsInterface>
        | IObjectMetaAttributes<ComponentPropsInterface>;
}

// Классы

/**
 * Класс, реализующий базовый тип.
 * @public
 * @see IMeta
 */
export class Meta<RuntimeInterface> {
    /**
     * Уникальный идентификатор типа.
     * @see IMeta.id
     * @see Meta.id
     * @see Meta.getId
     * @see Meta.inherits
     */
    protected _id: string;

    /**
     * Список идентификаторов типов, от которых был унаследован этот.
     * @public
     * @see Meta.id
     * @see IMeta.inherits
     */
    protected _inherits?: string[];

    /**
     * Свойство обязательно и не может быть равно `undefined`.
     * @public
     * @default true
     * @see IMeta.required
     * @see Meta.optional
     * @see Meta.required
     */
    protected _required: boolean;

    /**
     * Визуальное описание для представления в Property Grid-е.
     * @public
     * @see IMetaInfo
     */
    protected _info: IMetaInfo;

    /**
     * Редактор типа.
     * @public
     * @see Meta.editor
     * @see Meta.getEditor
     */
    protected _propsEditor: ComponentLoaderWithProps<
        IPropertyEditorProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    >;

    /**
     * Редактор на стекле.
     * @public
     * @see Meta.designtimeEditor
     * @see Meta.getDesigntimeEditor
     */
    protected _designtimeEditor: ComponentLoaderWithProps<
        IControlDesignerProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    >;

    /**
     * Начальное значение для редактора типа.
     * @public
     * @see IMeta.defaultValue
     * @see Meta.defaultValue
     * @see Meta.getDefaultValue
     */
    protected _defaultValue?: RuntimeInterface;

    /**
     * Ссылка на тип родительского объекта.
     * @public
     * @see IMetaOrigin
     * @see IMeta.origin
     */
    protected _origin?: MetaOrigin;

    /**
     * Конструктор базового типа.
     * @param [descriptor] - Базовое мета-описание.
     * @public
     * @see IMeta
     */
    constructor(
        descriptor: IMeta<RuntimeInterface> = { is: MetaClass.primitive }
    ) {
        this._id = descriptor.id ?? '';
        this._inherits = descriptor.inherits;
        this._required = descriptor.required ?? true;
        this._defaultValue = descriptor.defaultValue;
        this._origin = descriptor.origin
            ? {
                  meta: meta(descriptor.origin.meta as any),
                  key: descriptor.origin.key,
              }
            : undefined;
        this._propsEditor = this._createEditor<
            IPropertyEditorProps<RuntimeInterface>
        >(descriptor, Meta.KEY_EDITOR);
        this._designtimeEditor = this._createEditor<
            IControlDesignerProps<RuntimeInterface>
        >(descriptor, Meta.KEY_DESIGNTIME_EDITOR);
        this._info = createMetaInfo(descriptor.info);
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IMeta<RuntimeInterface> {
        return {
            is: MetaClass.primitive,
            id: this._id || undefined,
            inherits: this._inherits?.length ? this._inherits : undefined,
            required: this._required,
            info: this._info,
            editor:
                this._propsEditor?.loader || this._propsEditor?.component
                    ? this._propsEditor
                    : undefined,
            designtimeEditor:
                this._designtimeEditor?.loader ||
                this._designtimeEditor?.component
                    ? this._designtimeEditor
                    : undefined,
            defaultValue: this._defaultValue,
            origin: this._origin,
        };
    }

    /**
     * Копирует тип, создавая новый экземпляр.
     * @param [update] - Изменения в новом типе.
     * @public
     */
    clone(update: Partial<IMeta<any>> = {}): this {
        const Constructor = this.constructor as any;
        return new Constructor({ ...this.toDescriptor(), ...update });
    }

    /**
     * Меняет идентификатор типа.
     * @param id - Новый идентификатор типа.
     * @see IMeta.id
     * @see Meta.getId
     */
    id(id: string | undefined): this {
        if (id === this._id) {
            return this;
        }
        if (id && this._inherits?.includes(id)) {
            throw new Error('Циклическое наследование недопустимо');
        }
        return this.clone({
            id,
            inherits:
                this._id !== undefined
                    ? [...(this._inherits || []), this._id]
                    : this._inherits,
        });
    }

    /**
     * Возвращает идентификатор типа.
     * @see IMeta.id
     * @see Meta.id
     */
    getId(): string {
        return this._id;
    }

    /**
     * Меняет название категории.
     * @param category - Новое название категории.
     * @see IMeta.info.category
     * @see Meta.getCategory
     */
    category(category: string): this {
        if (this.getCategory() === category) {
            return this;
        }
        return this.clone({ info: { ...this._info, category } });
    }

    /**
     * Возвращает название категории.
     * @see IMeta.info.category
     * @see Meta.category
     */
    getCategory(): string | undefined {
        return this._info.category;
    }

    /**
     * Меняет названием группы.
     * @param group - Новое название группы.
     * @see IMeta.info.group
     * @see Meta.getGroup
     */
    group(group: string): this {
        if (this.getGroup() === group) {
            return this;
        }
        return this.clone({ info: { ...this._info, group } });
    }

    /**
     * Возвращает название группы, к которой относится тип.
     * @see IMeta.info.group
     * @see Meta.group
     */
    getGroup(): string | undefined {
        return this._info.group;
    }

    /**
     * Меняет название типа.
     * @param title - Новое название.
     * @see IMeta.info.title
     * @see Meta.getTitle
     */
    title(title: string | undefined): this {
        if (this.getTitle() === title) {
            return this;
        }
        return this.clone({ info: { ...this._info, title } });
    }

    /**
     * Возвращает название типа.
     * @see IMeta.info.title
     * @see Meta.title
     */
    getTitle(): string | undefined {
        return this._info.title;
    }

    /**
     * Меняет детальное описание типа.
     * @param description - Новое описание типа.
     * @see IMeta.info.description
     * @see Meta.getDescription
     */
    description(description: string | undefined): this {
        if (this.getDescription() === description) {
            return this;
        }
        return this.clone({ info: { ...this._info, description } });
    }

    /**
     * Возвращает детальное описание типа.
     * @see IMeta.info.description
     * @see Meta.description
     */
    getDescription(): string | undefined {
        return this._info.description;
    }

    /**
     * Меняет иконку.
     * @param icon - Новая иконка.
     */
    icon(icon: string | undefined): this {
        if (this.getIcon() === icon) {
            return this;
        }
        return this.clone({ info: { ...this._info, icon } });
    }

    /**
     * Возвращает иконку.
     */
    getIcon(): string | undefined {
        return this._info.icon;
    }

    /**
     * Меняет порядковый номер.
     * @param order - Новый порядковый номер.
     * @public
     * @see Meta.order
     */
    order(order: number | undefined): this {
        if (this.getOrder() === order) {
            return this;
        }
        return this.clone({ info: { ...this._info, order } });
    }

    /**
     * Возвращает порядковый номер.
     */
    getOrder(): number | undefined {
        return this._info.order;
    }

    /**
     * Меняет условия видимости редактора типа.
     * @public
     * @see Meta.visible
     */
    hidden(): this {
        if (this.isHidden()) {
            return this;
        }
        return this.clone({ info: { ...this._info, hidden: true } });
    }

    /**
     * Сообщает о том, что редактор должен быть скрыт.
     */
    isHidden(): boolean {
        return Boolean(this._info.hidden);
    }

    /**
     * Меняет условия видимости редактора.
     * @public
     * @see Meta.hidden
     */
    visible(): this {
        if (this.isVisible()) {
            return this;
        }
        return this.clone({ info: { ...this._info, hidden: undefined } });
    }

    /**
     * Сообщает о том, что редактор должен быть виден.
     */
    isVisible(): boolean {
        return !this.isHidden();
    }

    disable(): this {
        if (this.isDisabled()) {
            return this;
        }
        return this.clone({ info: { ...this._info, disabled: true } });
    }

    /**
     * Сообщает о том, что редактировать значение запрещено.
     */
    isDisabled(): boolean {
        return Boolean(this._info.disabled);
    }

    enable(): this {
        if (this.isEnabled()) {
            return this;
        }
        return this.clone({ info: { ...this._info, disabled: false } });
    }

    /**
     * Сообщает о том, что редактировать значение разрешено.
     */
    isEnabled(): boolean {
        return !this.isDisabled();
    }

    /**
     * Проверяет, расширен ли тип от другого.
     * @param parent - Исходный тип или мета-описание.
     */
    is(parent: Meta<any> | Pick<IMeta<any>, 'id'>): boolean {
        const parentId = isMeta(parent) ? parent.getId() : parent.id;
        return Boolean(
            parentId &&
                (this._id === parentId || this._inherits?.includes(parentId))
        );
    }

    /**
     * Возвращает указатель на оригинальный тип и ключ в нём.
     * @public
     * @see MetaOrigin
     * @see IMeta.origin
     */
    getOrigin(): MetaOrigin | undefined {
        return this._origin;
    }

    /**
     * Меняет редактор типа.
     * @param loader - Загрузчик нового редактора типа.
     * @param [props] - Параметры для редактора.
     * @public
     * @see Meta.designtimeEditor
     * @see Meta.editorProps
     */
    designtimeEditor<
        EditorProps extends IControlDesignerProps<RuntimeInterface>
    >(
        loader: IComponentLoader<EditorProps> | undefined,
        props?:
            | Partial<Omit<EditorProps, IPropertyEditorHiddenProps>>
            | undefined,
        isAlwaysShow?: boolean
    ): this {
        if (
            this._designtimeEditor?.loader === loader &&
            this._designtimeEditor?.props === props
        ) {
            return this;
        }
        if (!loader) {
            return this.clone({ designtimeEditor: undefined });
        }

        return this.clone({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            designtimeEditor: { loader, props, isAlwaysShow },
        });
    }

    /**
     * Меняет параметры режима design time.
     * @remark
     * Новые параметры добавляются к ранее указанным.
     * @param props - Новые параметры для редактора.
     * @public
     * @see Meta.designtimeEditor
     * @see Meta.getDesigntimeEditor
     */
    designtimeEditorProps(
        props:
            | Partial<
                  Omit<
                      IPropertyEditorProps<RuntimeInterface>,
                      IPropertyEditorHiddenProps
                  >
              >
            | undefined
    ): this {
        if (this._designtimeEditor?.props === props) {
            return this;
        }
        return this.clone({
            designtimeEditor: {
                loader: this._designtimeEditor?.loader,
                props: { ...(this._designtimeEditor?.props || {}), ...props },
                isAlwaysShow: this._designtimeEditor.isAlwaysShow,
            },
        });
    }

    /**
     * Возвращает информацию о редакторе.
     * @public
     * @see Meta.designtimeEditor
     */
    getDesigntimeEditor(
        defaultEditorLoaders?: IEditorLoaders
    ): ComponentLoaderWithProps<
        IPropertyEditorProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    > {
        if (
            this._designtimeEditor?.component ||
            this._designtimeEditor?.loader
        ) {
            return this._designtimeEditor;
        }
        if (this._inherits?.length) {
            for (let index = this._inherits.length - 1; index > -1; index--) {
                const parentTypeId = this._inherits[index];
                const defaultEditorLoader =
                    defaultEditorLoaders?.[parentTypeId];
                if (!defaultEditorLoader) {
                    continue;
                }
                if (!defaultEditors.has(defaultEditorLoader)) {
                    defaultEditors.set(
                        defaultEditorLoader,
                        new ComponentLoaderWithProps({
                            loader: defaultEditorLoader,
                        })
                    );
                }
                return defaultEditors.get(defaultEditorLoader);
            }
        }
        return this._designtimeEditor;
    }

    /**
     * Меняет параметры редактора.
     * @public
     * @see Meta.editor
     * @see Meta.getEditor
     */
    editor<EditorProps extends IPropertyEditorProps<RuntimeInterface>>(
        loader?: IComponentLoader<EditorProps> | undefined,
        props?: IComponentLoader<EditorProps> | undefined
    ): this {
        if (
            this._propsEditor?.loader === loader &&
            this._propsEditor?.props === props
        ) {
            return this;
        }
        if (!loader) {
            return this.clone({ editor: undefined });
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.clone({ editor: { loader, props } });
    }

    /**
     * Меняет параметры редактора.
     * @remark
     * Новые параметры добавляются к ранее указанным.
     * @param props - Новые параметры для редактора.
     * @public
     * @see Meta.editor
     * @see Meta.getEditor
     */
    editorProps(
        props:
            | Partial<
                  Omit<
                      IPropertyEditorProps<RuntimeInterface>,
                      IPropertyEditorHiddenProps
                  >
              >
            | undefined
    ): this {
        if (this._propsEditor?.props === props) {
            return this;
        }
        return this.clone({
            editor: {
                loader: this._propsEditor?.loader,
                props: { ...(this._propsEditor?.props || {}), ...props },
            },
        });
    }

    /**
     * Возвращает информацию о редакторе.
     * @public
     * @see Meta.editor
     */
    getEditor(
        defaultEditorLoaders?: IEditorLoaders
    ): ComponentLoaderWithProps<
        IPropertyEditorProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    > {
        if (this._propsEditor?.component || this._propsEditor?.loader) {
            return this._propsEditor;
        }
        if (this._inherits?.length) {
            for (let index = this._inherits.length - 1; index > -1; index--) {
                const parentTypeId = this._inherits[index];
                const defaultEditorLoader =
                    defaultEditorLoaders?.[parentTypeId];
                if (!defaultEditorLoader) {
                    continue;
                }
                if (!defaultEditors.has(defaultEditorLoader)) {
                    defaultEditors.set(
                        defaultEditorLoader,
                        new ComponentLoaderWithProps({
                            loader: defaultEditorLoader,
                        })
                    );
                }
                return defaultEditors.get(defaultEditorLoader);
            }
        }
        return this._propsEditor;
    }

    /**
     * Помечает тип обязательным.
     * @public
     * @see Meta.required
     * @see Meta.optional
     * @see Meta.isRequired
     */
    // @ts-ignore Изменение "неизвестного" RuntimeInterface
    required(): Meta<Exclude<RuntimeInterface, undefined>> {
        if (this._required) {
            return this as any;
        }
        return this.clone({ required: true }) as any;
    }

    /**
     * Помечает тип необязательным.
     * @public
     * @see Meta.required
     * @see Meta.isRequired
     */
    // @ts-ignore Изменение "неизвестного" RuntimeInterface
    optional(): Meta<RuntimeInterface | undefined> {
        if (!this._required) {
            return this as Meta<RuntimeInterface | undefined>;
        }
        return this.clone({ required: false }) as any;
    }

    /**
     * Сообщает о том, что значение обязательно.
     * @public
     * @see Meta.required
     * @see Meta.optional
     */
    isRequired(): boolean {
        return Boolean(this._required);
    }

    /**
     * Сообщает о том, что значение необязательно.
     * @see Meta.required
     * @see Meta.optional
     */
    isOptional(): boolean {
        return !this.isRequired();
    }

    /**
     * Меняет значение по-умолчанию.
     * @param defaultValue - Новое значение по-умолчанию для конструктора.
     * @public
     * @see IMeta.defaultValue
     * @see Meta.getDefaultValue
     */
    defaultValue(defaultValue: RuntimeInterface | undefined): this {
        if (this._defaultValue === defaultValue) {
            return this;
        }
        return this.clone({ defaultValue });
    }

    /**
     * Возвращает значение по-умолчанию.
     * @public
     * @see IMeta.defaultValue
     * @see Meta.defaultValue
     */
    getDefaultValue(): RuntimeInterface | undefined {
        return this._defaultValue;
    }

    /**
     * Уточняет возможные значения типа.
     * @remark
     * Используется только для коррекции Runtime-интерфейса, не содержит какой-либо логики.
     * @public
     */
    oneOf<NewRuntimeType extends RuntimeInterface>(
        values: readonly NewRuntimeType[]
    ): Meta<(typeof values)[number]> {
        return this as any;
    }

    /**
     * Создаёт экземпляр класса `ComponentLoaderWithProps`.
     * @param [descriptor] - Базовое мета-описание.
     * @protected
     */
    protected _createEditor<TEditorProps extends object>(
        descriptor: IMeta<RuntimeInterface> = {},
        loaderKey: string = 'editor'
    ): ComponentLoaderWithProps<
        TEditorProps,
        Omit<TEditorProps, IPropertyEditorHiddenProps>
    > {
        return this._createComponentLoader(
            descriptor[loaderKey]?.loader,
            descriptor[loaderKey]?.props,
            descriptor[loaderKey]?.isAlwaysShow,
            loaderKey,
            descriptor[loaderKey]?.component
        );
    }

    /**
     * Создаёт экземпляр класса `ComponentLoaderWithProps`.
     * @param [loader] - Описание загрузчика компонента.
     * @param [props] - Параметры для компонента.
     * @protected
     */
    protected _createComponentLoader<
        ComponentInterface extends object = IPropertyEditorProps<RuntimeInterface>
    >(
        loader: IComponentLoader<ComponentInterface> | undefined,
        props: any,
        isAlwaysShow: boolean,
        loaderKey: string,
        component?: IComponent<ComponentInterface>
    ): ComponentLoaderWithProps<
        ComponentInterface,
        Omit<any, IPropertyEditorHiddenProps>
    > {
        return new ComponentLoaderWithProps({
            loader,
            props,
            isAlwaysShow,
            component,
        });
    }

    static KEY_EDITOR: string = 'editor';
    static KEY_DESIGNTIME_EDITOR: string = 'designtimeEditor';
}

/**
 * Класс, реализующий тип "объект".
 * @public
 * @see Meta
 * @see IObjectMeta
 */
export class ObjectMeta<
    RuntimeInterface extends object
> extends Meta<RuntimeInterface> {
    /**
     * Атрибуты объекта.
     * @see ObjectMetaAttributes
     * @see IObjectMetaAttributes
     */
    protected _attributes: ObjectMetaAttributes<RuntimeInterface>;

    /**
     * Конструктор типа "объект".
     * @param descriptor - Мета-описание объекта.
     * @public
     * @see IObjectMeta
     */
    constructor(
        descriptor: IObjectMeta<RuntimeInterface> = { is: MetaClass.object }
    ) {
        super(descriptor);
        this._attributes = this._createAttributes(descriptor.attributes);
        this._propsEditor = this._createEditor<
            IPropertyEditorProps<RuntimeInterface>
        >(descriptor, Meta.KEY_EDITOR);
        this._designtimeEditor = this._createEditor<
            IControlDesignerProps<RuntimeInterface>
        >(descriptor, Meta.KEY_DESIGNTIME_EDITOR);
        this._info = createMetaInfo(descriptor.info);

        // Подменяем `origin` у всех атрибутов на текущий тип.
        // Это позволит при отрисовке редактора типа использовать редактор из `origin` с привязкой атрибутов
        // из оригинального типа к атрибутам в текущем объекте.
        // Важно: создаются циклические ссылки, использование JSON.stringify() становится невозможным.
        // TODO Реализовать собственную логику сериализации
        if (this._propsEditor?.loader || this._propsEditor?.component) {
            Object.entries(
                this._attributes as Record<string, Meta<any> | null>
            ).forEach(([key, value]) => {
                if (value) {
                    this._attributes[key] = value.clone({
                        origin: { meta: this, key },
                    });
                }
            });
        }
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IObjectMeta<RuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.object,
            attributes: this._attributes,
        };
    }

    /**
     * Возвращает информацию о редакторе.
     * @public
     * @see Meta.editor
     */
    getDesigntimeEditor(
        defaultEditorLoaders?: IEditorLoaders
    ): ObjectComponentLoaderWithProps<
        IPropertyEditorProps<RuntimeInterface>,
        Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>
    > {
        return super.getDesigntimeEditor(defaultEditorLoaders) as any;
    }

    /**
     * Помечает тип обязательным для заполнения.
     * @remark
     * Перегрузка в `ObjectMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ObjectMeta.required
     * @see ObjectMeta.optional
     */
    // @ts-ignore By default RuntimeInterface cannot be undefined
    required(): ObjectMeta<Exclude<RuntimeInterface, undefined>> {
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным для заполнения.
     * @remark
     * Перегрузка в `ObjectMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ObjectMeta.required
     * @see ObjectMeta.required
     */
    // @ts-ignore By default RuntimeInterface cannot be undefined
    optional(): ObjectMeta<RuntimeInterface | undefined> {
        return super.optional() as any;
    }

    /**
     * Возвращает значение по-умолчанию.
     * @remark
     * Если у мета-описания не указано собственное значение `defaultValue`,
     * оно рассчитывается на основе `getDefaultValue` всех атрибутов объекта.
     * @public
     * @see IObjectMeta.defaultValue
     * @see ObjectMeta.defaultValue
     * @see IObjectMetaAttributes
     */
    getDefaultValue(): RuntimeInterface | undefined {
        if (this._defaultValue !== undefined) {
            return this._defaultValue;
        }
        const result: any = {};
        Object.keys(this._attributes).forEach((key) => {
            const value = this._attributes[key];
            const defaultValue = value?.getDefaultValue();
            if (defaultValue !== undefined) {
                result[key] = defaultValue;
            }
        });
        return result;
    }

    /**
     * Возвращает типы атрибутов объекта.
     * @public
     */
    attributes(): ObjectMetaAttributes<RuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта.
     * @param attributes - Атрибуты объекта.
     * @public
     */
    attributes<NewRuntimeInterface extends object>(
        attributes: IObjectMeta<NewRuntimeInterface>['attributes']
    ): ObjectMeta<NewRuntimeInterface>;

    /**
     * Меняет типы атрибутов объекта или возвращает текущие.
     * @param [attributes] - Атрибуты объекта.
     * @public
     */
    attributes<NewRuntimeInterface extends object>(
        attributes?: IObjectMeta<NewRuntimeInterface>['attributes']
    ):
        | ObjectMeta<NewRuntimeInterface>
        | ObjectMetaAttributes<RuntimeInterface> {
        if (!arguments.length) {
            return this._attributes;
        }
        return this.clone({ attributes } as any) as any;
    }

    /**
     * Возвращает типы атрибутов объекта.
     */
    getAttributes(): ObjectMetaAttributes<RuntimeInterface> {
        return this._attributes;
    }

    /**
     * Создаёт объект `attributes` на базе типа или мета-описания.
     * @param [attributes] - Тип или мета-описание атрибутов.
     * @protected
     */
    protected _createAttributes(
        attributes?:
            | ObjectMetaAttributes<RuntimeInterface>
            | IObjectMetaAttributes<RuntimeInterface>
    ): ObjectMetaAttributes<RuntimeInterface> {
        const result = {} as ObjectMetaAttributes<RuntimeInterface>;
        Object.keys(attributes || {}).forEach((key) => {
            const value = attributes?.[key];
            result[key] = value ? meta(value) : null;
        });
        return result;
    }

    /**
     * Создаёт экземпляр класса `ObjectComponentLoaderWithProps`.
     * @param [loader] - Описание загрузчика компонента.
     * @param [props] - Параметры для компонента.
     * @protected
     */
    protected _createComponentLoader<
        ComponentInterface extends object = IPropertyEditorProps<RuntimeInterface>
    >(
        loader: IComponentLoader<ComponentInterface> | undefined,
        props: any,
        isAlwaysShow: boolean,
        loaderKey: string
    ): ObjectComponentLoaderWithProps<ComponentInterface, any> {
        return new ObjectComponentLoaderWithProps(
            { loader, props, isAlwaysShow },
            this._attributes,
            loaderKey === Meta.KEY_EDITOR
                ? ObjectMeta.getEditorFrom
                : ObjectMeta.getDesigntimeEditorFrom
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    private static getDesigntimeEditorFrom(meta: Meta<unknown>) {
        return meta?.getDesigntimeEditor?.();
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    private static getEditorFrom(meta: Meta<unknown>) {
        return meta?.getEditor?.();
    }
}

/**
 * Класс, реализующий тип "массив".
 * @public
 * @see Meta
 * @see IArrayMeta
 */
export class ArrayMeta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
> extends Meta<RuntimeInterface> {
    /**
     * Тип элемента массива.
     * @see Meta
     */
    protected _arrayOf: Meta<ItemRuntimeInterface>;

    /**
     * Конструктор типа "массив".
     * @param descriptor - Мета-описание массива.
     * @public
     * @see IArrayMeta
     */
    constructor(
        descriptor: IArrayMeta<RuntimeInterface, ItemRuntimeInterface> = {
            is: MetaClass.array,
        }
    ) {
        super(descriptor);
        this._arrayOf = meta(
            (descriptor.arrayOf || {}) as Meta<ItemRuntimeInterface>
        );
    }

    /**
     * Меняет тип элемента массива.
     * @param arrayOf - Тип или мета-описание элемента массива.
     */
    of<
        NewItemRuntimeInterface extends ItemRuntimeInterface = ItemRuntimeInterface,
        NewRuntimeInterface extends NewItemRuntimeInterface[] = NewItemRuntimeInterface[]
    >(
        arrayOf: Meta<NewItemRuntimeInterface> | IMeta<ItemRuntimeInterface>
    ): ArrayMeta<NewRuntimeInterface, NewItemRuntimeInterface> {
        if (this._arrayOf === arrayOf) {
            return this as any;
        }
        return this.clone({ arrayOf } as any) as any;
    }

    /**
     * Возвращает тип элемента массива.
     */
    getItemMeta(): Meta<ItemRuntimeInterface> {
        return this._arrayOf;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IArrayMeta<RuntimeInterface, ItemRuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.array,
            arrayOf: this._arrayOf,
        };
    }

    /**
     * Помечает тип обязательным для заполнения.
     * @remark
     * Перегрузка в `ArrayMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ArrayMeta.required
     * @see ArrayMeta.optional
     */
    // @ts-ignore RuntimeInterface поменялся, поэтому интерфейс редактора не соответствует
    required(): ArrayMeta<
        Exclude<RuntimeInterface, undefined>,
        ItemRuntimeInterface
    > {
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным для заполнения.
     * @remark
     * Перегрузка в `ArrayMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see ArrayMeta.required
     * @see ArrayMeta.required
     */
    // @ts-ignore By default RuntimeInterface cannot be undefined
    optional(): ArrayMeta<RuntimeInterface | undefined, ItemRuntimeInterface> {
        return super.optional() as any;
    }
}

/**
 * Класс, реализующий тип "обещание".
 * @public
 * @see Meta
 * @see IPromiseMeta
 */
export class PromiseMeta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
> extends Meta<RuntimeInterface> {
    /**
     * Nbg значения, возвращаемого промисом.
     * @remark
     * `null` означает, что Promise ничего не возвращает.
     * @public
     * @see Meta
     */
    protected _result: Meta<ResolvedRuntimeInterface> | null;

    /**
     * Начальное значение для редактора.
     * @remark
     * Для типа "обещание" значение по-умолчанию всегда равно `undefined`.
     * @public
     * @see PromiseMeta.defaultValue
     * @see PromiseMeta.getDefaultValue
     */
    protected _defaultValue: undefined;

    /**
     * Конструктор типа "обещание".
     * @param descriptor - Мета-описание "обещания".
     * @public
     * @see IPromiseMeta
     */
    constructor(
        descriptor: IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> = {
            is: MetaClass.promise,
        }
    ) {
        super(descriptor);
        this._defaultValue = undefined;
        this._result = descriptor.result
            ? meta(descriptor.result as Meta<ResolvedRuntimeInterface>)
            : null;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.promise,
            result: this._result,
        };
    }

    result<
        NewResolvedRuntimeInterface,
        NewRuntimeInterface extends Promise<NewResolvedRuntimeInterface>
    >(
        result: Meta<NewResolvedRuntimeInterface>
    ): PromiseMeta<NewRuntimeInterface, NewResolvedRuntimeInterface> {
        return this.clone({ result } as any) as any;
    }

    /**
     * Возвращает тип возвращаемого значения промиса.
     * @remark
     * `null` означает, что Promise ничего не возвращает.
     */
    getResult(): Meta<ResolvedRuntimeInterface> | null {
        return this._result;
    }

    /**
     * Помечает тип обязательным.
     * @remark
     * Перегрузка в `PromiseMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see PromiseMeta.required
     * @see PromiseMeta.optional
     */
    // @ts-ignore RuntimeInterface поменялся, поэтому интерфейс редактора не соответствует
    required(): PromiseMeta<
        Exclude<RuntimeInterface, undefined>,
        ResolvedRuntimeInterface
    > {
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным.
     * @remark
     * Перегрузка в `PromiseMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see PromiseMeta.required
     * @see PromiseMeta.required
     */
    // @ts-ignore By default RuntimeInterface cannot be undefined
    optional(): PromiseMeta<
        RuntimeInterface | undefined,
        ResolvedRuntimeInterface
    > {
        return super.optional() as any;
    }

    /**
     * Меняет значение по-умолчанию.
     * @remark
     * Переданное значение игнорируется, т.к. тип "обещание" не имеет значения по-умолчанию.
     * @public
     * @see PromiseMeta.defaultValue
     * @see PromiseMeta.getDefaultValue
     */
    defaultValue(ignore: any): this {
        return this;
    }

    /**
     * Возвращает значение по-умолчанию.
     * @remark
     * Всегда возвращается `undefined`, т.к. тип "обещание" не имеет значения по-умолчанию.
     * @public
     * @see PromiseMeta.defaultValue
     * @see PromiseMeta.defaultValue
     */
    getDefaultValue(): undefined {
        return undefined;
    }
}

/**
 * Класс, реализующий тип "функция".
 * @public
 * @see Meta
 * @see IAnyFunction
 * @see IFunctionMeta
 */
export class FunctionMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
> extends Meta<RuntimeInterface> {
    /**
     * Начальное значение для редактора.
     * @remark
     * Для типа "функции" значение по-умолчанию всегда равно `undefined`.
     * @public
     * @see FunctionMeta.defaultValue
     * @see FunctionMeta.getDefaultValue
     */
    protected _defaultValue: undefined;

    /**
     * Список типов аргументов функции.
     * @protected
     */
    protected _arguments?: Metas<A, B, C, D, E>;

    /**
     * Тип результата функции.
     * @protected
     */
    protected _result?: Meta<R>;

    /**
     * Конструктор типа "функция".
     * @param descriptor - Мета-описание функции.
     * @public
     * @see IFunctionMeta
     */
    constructor(
        descriptor: IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> = {
            is: MetaClass.function,
        }
    ) {
        super(descriptor);

        this._defaultValue = undefined;
        this._arguments = descriptor.arguments?.map(meta) || ([] as any);
        this._result = descriptor.result
            ? (meta(descriptor.result as any) as any)
            : undefined;
    }

    /**
     * Удаляет аргументы функции.
     */
    arguments(): FunctionMeta<IAnyFunction<R>, R>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     */
    arguments<NewA>(
        a: Meta<NewA>
    ): FunctionMeta<IAnyFunction<R, NewA>, R, NewA>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     */
    arguments<NewA, NewB>(
        a: Meta<NewA>,
        b: Meta<NewB>
    ): FunctionMeta<IAnyFunction<R, NewA, NewB>, R, NewA, NewB>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     * @param c
     */
    arguments<NewA, NewB, NewC>(
        a: Meta<NewA>,
        b: Meta<NewB>,
        c: Meta<NewC>
    ): FunctionMeta<IAnyFunction<R, NewA, NewB, NewC>, R, NewA, NewB, NewC>;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     * @param c
     * @param d
     */
    arguments<NewA, NewB, NewC, NewD>(
        a: Meta<NewA>,
        b: Meta<NewB>,
        c: Meta<NewC>,
        d: Meta<NewD>
    ): FunctionMeta<
        IAnyFunction<R, NewA, NewB, NewC, NewD>,
        R,
        NewA,
        NewB,
        NewC,
        NewD
    >;

    /**
     * Меняет типы аргументов функции.
     * @param a
     * @param b
     * @param c
     * @param d
     * @param e
     */
    arguments<NewA, NewB, NewC, NewD, NewE>(
        a: Meta<NewA>,
        b: Meta<NewB>,
        c: Meta<NewC>,
        d: Meta<NewD>,
        e: Meta<NewE>
    ): FunctionMeta<
        IAnyFunction<R, NewA, NewB, NewC, NewD, NewE>,
        R,
        NewA,
        NewB,
        NewC,
        NewD,
        NewE
    >;

    /**
     * Меняет типы аргументов функции.
     * @param [a]
     * @param [b]
     * @param [c]
     * @param [d]
     * @param [e]
     */
    arguments(a?: any, b?: any, c?: any, d?: any, e?: any): any {
        return this.clone({
            arguments: [a, b, c, d, e].filter(Boolean),
        } as any) as any;
    }

    /**
     * Возвращает список типов аргументов функции.
     */
    getArguments(): Metas<A, B, C, D, E> | undefined {
        return this._arguments;
    }

    /**
     * Меняет тип результата функции.
     * @param result
     */
    result<
        NewRuntimeInterface extends IAnyFunction<NewR, A, B, C, D, E>,
        NewR extends any = never
    >(
        result?: Meta<NewR>
    ): FunctionMeta<NewRuntimeInterface, NewR, A, B, C, D, E> {
        return this.clone({ result } as any) as any;
    }

    /**
     * Возвращает тип результата функции.
     */
    getResult(): Meta<R> | undefined {
        return this._result;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.function,
            arguments: this._arguments,
            result: this._result,
        };
    }

    /**
     * Помечает тип обязательным.
     * @remark
     * Перегрузка в `FunctionMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see FunctionMeta.required
     * @see FunctionMeta.optional
     */
    // @ts-ignore RuntimeInterface поменялся, поэтому интерфейс редактора не соответствует
    required(): FunctionMeta<
        Exclude<RuntimeInterface, undefined>,
        R,
        A,
        B,
        C,
        D,
        E
    > {
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным.
     * @remark
     * Перегрузка в `FunctionMeta` необходима только для корректного указания Runtime-типа.
     * @public
     * @see FunctionMeta.required
     * @see FunctionMeta.required
     */
    // @ts-ignore By default RuntimeInterface cannot be undefined
    optional(): FunctionMeta<RuntimeInterface | undefined, R, A, B, C, D, E> {
        return super.optional() as any;
    }

    /**
     * Меняет значение по-умолчанию.
     * @remark
     * Переданное значение игнорируется, т.к. тип "функция" не имеет значения по-умолчанию.
     * @public
     * @see FunctionMeta.defaultValue
     * @see FunctionMeta.getDefaultValue
     */
    defaultValue(ignore: any): this {
        return this;
    }

    /**
     * Возвращает значение по-умолчанию.
     * @remark
     * Всегда возвращается `undefined`, т.к. тип "функция" не имеет значения по-умолчанию.
     * @public
     * @see IFunctionMeta.defaultValue
     * @see FunctionMeta.defaultValue
     */
    getDefaultValue(): undefined {
        return undefined;
    }
}

/**
 * Класс, реализующий вариативный тип.
 * @public
 */
export class UnionMeta<RuntimeInterface> extends Meta<RuntimeInterface> {
    /**
     * Возможные типы.
     */
    protected _types: Meta<any>[];

    /**
     * Конструктор вариативного типа.
     * @param descriptor - Мета-описание вариативного типа.
     */
    constructor(
        descriptor: IUnionMeta<RuntimeInterface> = { is: MetaClass.union }
    ) {
        super(descriptor);
        this._types = (descriptor.types || []).map((item) => {
            return meta(item as any);
        });
    }

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A>(types: readonly [Meta<A>]): UnionMeta<A>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B>(types: readonly [Meta<A>, Meta<B>]): UnionMeta<A | B>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B, C>(
        types: readonly [Meta<A>, Meta<B>, Meta<C>]
    ): UnionMeta<A | B | C>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B, C, D>(
        types: readonly [Meta<A>, Meta<B>, Meta<C>, Meta<D>]
    ): UnionMeta<A | B | C | D>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of<A, B, C, D, E>(
        types: readonly [Meta<A>, Meta<B>, Meta<C>, Meta<D>, Meta<E>]
    ): UnionMeta<A | B | C | D | E>;

    /**
     * Меняет возможные типы.
     * @param types - Тип или мета-описание вариантов.
     */
    of(types: any): UnionMeta<any> {
        return this.clone({ types } as any);
    }

    /**
     * Возвращает возможные типы.
     */
    getTypes(): Meta<any>[] {
        return this._types;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IUnionMeta<RuntimeInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.union,
            types: this._types,
        };
    }

    /**
     * Помечает тип обязательным для заполнения.
     * @see IUnionMeta.required
     * @see UnionMeta.optional
     */
    required(): UnionMeta<Exclude<RuntimeInterface, undefined>> {
        // Возможно потребуется удалять из `types` мета-описание `Meta<undefined>`.
        return super.required() as any;
    }

    /**
     * Помечает тип необязательным для заполнения.
     * @see IUnionMeta.required
     * @see UnionMeta.required
     */
    optional(): UnionMeta<RuntimeInterface | undefined> {
        // Возможно потребуется добавлять в `types` мета-описание `Meta<undefined>`.
        return super.optional() as any;
    }
}

/**
 * Класс, реализующий тип "виджет".
 * @public
 * @see ObjectMeta
 */
export class WidgetMeta<
    ComponentPropsInterface extends object
> extends ObjectMeta<ComponentPropsInterface> {
    /**
     * Правила проверки прав доступа, необходимых для работы виджета.
     */
    protected _access: IWidgetMetaAccess;

    /**
     * Конструктор типа "виджет".
     * @param descriptor - Мета-описание виджета.
     */
    constructor(
        descriptor: IWidgetMeta<ComponentPropsInterface> = {
            is: MetaClass.widget,
        }
    ) {
        super(descriptor as any);
        this._access = {
            rights: descriptor.access?.rights,
            mode: descriptor.access?.mode ?? RightMode.any,
        };
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
    ):
        | WidgetMeta<NewComponentPropsInterface>
        | ObjectMetaAttributes<ComponentPropsInterface> {
        if (!arguments.length) {
            return this._attributes;
        }
        return this.clone({ attributes } as any) as any;
    }

    /**
     * Изменяет правила проверки прав доступа, необходимых для работы виджета.
     */
    access(rights?: string[], mode: RightMode = RightMode.any): this {
        return this.clone({ access: { rights, mode } } as any);
    }

    /**
     * Возвращает правила проверки прав доступа, необходимых для работы виджета.
     */
    getAccess(): IWidgetMetaAccess {
        return this._access;
    }
}

// Вспомогательные функции

/**
 * Формирует объект `IMetaInfo`.
 * @param [info] - Визуально описание типа.
 * @private
 */
function createMetaInfo(info?: IMetaInfo): IMetaInfo {
    return {
        category: info?.category,
        group: info?.group,
        order: info?.order,
        icon: info?.icon,
        title: info?.title,
        description: info?.description,
        hidden: info?.hidden || undefined,
        disabled: info?.disabled || undefined,
    };
}

/**
 * Определяет, что аргумент - это экземпляр любого типа.
 * @param item - Всё, что угодно.
 * @private
 */
export function isMeta<RuntimeInterface>(
    item: any
): item is Meta<RuntimeInterface> {
    return item instanceof Meta;
}

/**
 * Определяет, что аргумент - это базовое мета-описание.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isPrimitiveMetaDescriptor<RuntimeInterface>(
    descriptor: any
): descriptor is IPrimitiveMeta<RuntimeInterface> {
    return (
        Boolean(descriptor) &&
        typeof descriptor === 'object' &&
        !Array.isArray(descriptor) &&
        !isMeta(descriptor) &&
        (descriptor.is === undefined || descriptor.is === MetaClass.primitive)
    );
}

/**
 * Определяет, что аргумент - это тип "объект".
 * @param item - Всё, что угодно.
 * @private
 */
export function isObjectMeta<RuntimeInterface extends object>(
    item: any
): item is ObjectMeta<RuntimeInterface> {
    return item instanceof ObjectMeta && !(item instanceof WidgetMeta);
}

/**
 * Определяет, что аргумент - это мета-описание объекта.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isObjectMetaDescriptor<RuntimeInterface extends object>(
    descriptor: any
): descriptor is IObjectMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.object;
}

/**
 * Определяет, что аргумент - это тип "массив".
 * @param item - Всё, что угодно.
 * @private
 */
export function isArrayMeta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface
>(item: any): item is ArrayMeta<RuntimeInterface, ItemRuntimeInterface> {
    return item instanceof ArrayMeta;
}

/**
 * Определяет, что аргумент - это мета-описание массива.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isArrayMetaDescriptor<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface
>(
    descriptor: any
): descriptor is IArrayMeta<RuntimeInterface, ItemRuntimeInterface> {
    return descriptor?.is === MetaClass.array;
}

/**
 * Определяет, что аргумент - это тип "обещание".
 * @param item - Всё, что угодно.
 * @private
 */
export function isPromiseMeta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface
>(item: any): item is PromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> {
    return item instanceof PromiseMeta;
}

/**
 * Определяет, что аргумент - это мета-описание "обещания".
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isPromiseMetaDescriptor<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface
>(
    descriptor: any
): descriptor is IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> {
    return descriptor?.is === MetaClass.promise;
}

/**
 * Определяет, что аргумент - это тип "функция".
 * @param item - Всё, что угодно.
 * @private
 */
export function isFunctionMeta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(item: any): item is FunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
    return item instanceof FunctionMeta;
}

/**
 * Определяет, что аргумент - это мета-описание функции.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isFunctionMetaDescriptor<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(
    descriptor: any
): descriptor is IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> {
    return descriptor?.is === MetaClass.function;
}

/**
 * Определяет, что аргумент - это вариативный тип.
 * @param item - Всё, что угодно.
 * @private
 */
export function isUnionMeta<RuntimeInterface>(
    item: any
): item is UnionMeta<RuntimeInterface> {
    return item instanceof UnionMeta;
}

/**
 * Определяет, что аргумент - это мета-описание вариативного типа.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isUnionMetaDescriptor<RuntimeInterface>(
    descriptor: any
): descriptor is IUnionMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.union;
}

/**
 * Определяет, что аргумент - это тип "виджет".
 * @param meta - Всё, что угодно.
 * @private
 */
export function isWidgetMeta<PropsRuntimeInterface extends object = any>(
    meta: any
): meta is WidgetMeta<PropsRuntimeInterface> {
    return meta instanceof WidgetMeta;
}

/**
 * Определяет, что аргумент - это мета-описание виджета.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isWidgetMetaDescriptor<
    PropsRuntimeInterface extends object = any
>(descriptor: any): descriptor is IWidgetMeta<PropsRuntimeInterface> {
    return descriptor?.is === MetaClass.widget;
}

/**
 * Создаёт необязательный тип "объект".
 * @param descriptor - Мета-описание объекта.
 * @private
 */
export function meta<RuntimeInterface extends object>(
    descriptor: IObjectMeta<RuntimeInterface> & { required: false }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): ObjectMeta<RuntimeInterface | undefined>;

/**
 * Создаёт тип "объект".
 * @param descriptor - Мета-описание объекта.
 * @private
 */
export function meta<RuntimeInterface extends object>(
    descriptor: IObjectMeta<RuntimeInterface>
): ObjectMeta<RuntimeInterface>;

/**
 * Создаёт необязательный тип "массив".
 * @param descriptor - Мета-описание массива.
 * @private
 */
export function meta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
>(
    descriptor: IArrayMeta<RuntimeInterface, ItemRuntimeInterface> & {
        required: false;
    }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): ArrayMeta<RuntimeInterface | undefined, ItemRuntimeInterface>;

/**
 * Создаёт тип "массив".
 * @param descriptor - Мета-описание массива.
 * @private
 */
export function meta<
    RuntimeInterface extends ItemRuntimeInterface[],
    ItemRuntimeInterface = unknown
>(
    descriptor: IArrayMeta<RuntimeInterface, ItemRuntimeInterface>
): ArrayMeta<RuntimeInterface, ItemRuntimeInterface>;

/**
 * Создаёт необязательный тип "функция".
 * @param descriptor - Мета-описание функции.
 * @private
 */
export function meta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(
    descriptor: IFunctionMeta<RuntimeInterface, R, A, B, C, D, E> & {
        required: false;
    }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): FunctionMeta<RuntimeInterface | undefined, R, A, B, C, D, E>;

/**
 * Создаёт тип "функция".
 * @param descriptor - Мета-описание функции.
 * @private
 */
export function meta<
    RuntimeInterface extends IAnyFunction<R, A, B, C, D, E>,
    R extends any = void,
    A extends any = void,
    B extends any = void,
    C extends any = void,
    D extends any = void,
    E extends any = void
>(
    descriptor: IFunctionMeta<RuntimeInterface, R, A, B, C, D, E>
): FunctionMeta<RuntimeInterface, R, A, B, C, D, E>;

/**
 * Создаёт необязательный тип "обещание".
 * @param descriptor - Мета-описание "обещания".
 * @private
 */
export function meta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
>(
    descriptor: IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface> & {
        required: false;
    }
    // @ts-ignore By default RuntimeInterface cannot be undefined
): PromiseMeta<RuntimeInterface | undefined, ResolvedRuntimeInterface>;

/**
 * Создаёт тип "обещание".
 * @param descriptor - Мета-описание "обещания".
 * @private
 */
export function meta<
    RuntimeInterface extends Promise<ResolvedRuntimeInterface>,
    ResolvedRuntimeInterface = unknown
>(
    descriptor: IPromiseMeta<RuntimeInterface, ResolvedRuntimeInterface>
    // @ts-ignore By default RuntimeInterface cannot be undefined
): PromiseMeta<RuntimeInterface, ResolvedRuntimeInterface>;

/**
 * Создаёт тип "виджет".
 * @param descriptor - Мета-описание виджета.
 * @private
 */
export function meta<ComponentPropsInterface extends object>(
    descriptor: IWidgetMeta<ComponentPropsInterface>
): WidgetMeta<ComponentPropsInterface>;

/**
 * Создаёт необязательный базовый тип.
 * @param descriptor - Базовое мета-описание.
 * @private
 */
export function meta<
    RuntimeInterface extends void | null | boolean | number | string
>(
    descriptor: IMeta<RuntimeInterface> & { required: false }
): Meta<RuntimeInterface | undefined>;

/**
 * Создаёт базовый тип.
 * @param [descriptor] - Базовое мета-описание.
 * @private
 */
export function meta<
    RuntimeInterface extends void | null | boolean | number | string
>(descriptor?: IMeta<RuntimeInterface>): Meta<RuntimeInterface>;

/**
 * Ни чего не создаёт, просто возвращает аргумент как результат.
 * @remark
 * Необходимо для унификации функции `meta`, чтобы разработчик мог передавать как мета-описание, так и тип,
 *   зная, что на выходе всегда будет тип.
 * @param meta - Любой экземпляр мета-описания.
 * @private
 */
export function meta(meta: Meta<any>): typeof meta;

/**
 * Реализация всех объявленных выше вариантов использования.
 * @param [descriptor] - Мета-описание.
 * @remark
 * @private
 */
export function meta(descriptor: any = {}): any {
    if (isMeta(descriptor)) {
        return descriptor;
    }
    if (isArrayMetaDescriptor(descriptor)) {
        return new ArrayMeta(descriptor);
    }
    if (isObjectMetaDescriptor(descriptor)) {
        return new ObjectMeta(descriptor);
    }
    if (isFunctionMetaDescriptor(descriptor)) {
        return new FunctionMeta(descriptor);
    }
    if (isPromiseMetaDescriptor(descriptor)) {
        return new PromiseMeta(descriptor);
    }
    if (isWidgetMetaDescriptor(descriptor)) {
        return new WidgetMeta(descriptor);
    }
    if (isUnionMetaDescriptor(descriptor)) {
        return new UnionMeta(descriptor);
    }
    if (isPrimitiveMetaDescriptor(descriptor)) {
        return new Meta(descriptor);
    }
    throw new Error(`Неверное мета-описание: ${JSON.stringify(descriptor)}`);
}

/**
 * Переносит все атрибуты в указанную категорию.
 * @param name - Название категории.
 * @param attributes - Атрибуты объекта.
 * @public
 */
export function category<
    RuntimeInterface extends object,
    Attributes extends IObjectMetaAttributes<RuntimeInterface> = IObjectMetaAttributes<RuntimeInterface>
>(name: string, attributes: Attributes): Attributes {
    const result: any = {};
    Object.keys(attributes || {}).forEach((attributeName) => {
        const attribute = (attributes || {})[attributeName];
        result[attributeName] = attribute
            ? meta(attribute).category(name)
            : null;
    });
    return result;
}

/**
 * Переносит все атрибуты в указанную группу.
 * @param name - Название группы.
 * @param attributes - Атрибуты объекта.
 * @public
 */
export function group<
    RuntimeInterface extends object,
    Attributes extends IObjectMetaAttributes<RuntimeInterface> = IObjectMetaAttributes<RuntimeInterface>
>(name: string, attributes: Attributes): Attributes {
    const result: any = {};
    Object.keys(attributes || {}).forEach((attributeName) => {
        const attribute = (attributes || {})[attributeName];
        result[attributeName] = attribute ? meta(attribute).group(name) : null;
    });
    return result;
}
