/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Component, ReactNode } from 'react';
import { genId } from './base/id';
import {
    IComponentLoader,
    IComponentLoaderWithProps,
    ComponentLoaderWithProps,
    IComponent,
    TmpMetaEditor,
    IMetaEditor,
    ILoadedEditor,
    IPropertyEditorProps,
    IPropertyEditorCommonProps,
} from './components';
import type { IControlDesignerProps } from './design';
import { MetaClass, GENERATOR_ID_RANDOM_DELIMITER } from './marshalling/format';
export { MetaClass } from './marshalling/format';
import type { TMetaJson } from './marshalling/format';
import { serialize } from './marshalling/serializer';

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
 * Интерфейс загрузчиков редакторов по-умолчанию.
 */
export type IEditorLoaders = Record<string, IComponentLoader<IPropertyEditorProps<any>>>;

/**
 * Интерфейс карты загрузчиков редакторов по-умолчанию.
 */
type EditorLoaders = WeakMap<IComponentLoader<IPropertyEditorProps<any>>, TmpMetaEditor>;

function isLoadedEditor(editor: any): editor is IComponent<IPropertyEditorProps<any>> {
    return !(editor instanceof Function);
}

/**
 * Карта загрузчиков редакторов по-умолчанию.
 */
const defaultEditors: EditorLoaders = new WeakMap();
const defaultDesignTimeEditors: WeakMap<
    IComponentLoader<IPropertyEditorProps<any>>,
    ComponentLoaderWithProps<IPropertyEditorProps<any>>
> = new WeakMap();

/**
 * Поля, которые задаются Property Grid-ом и не могут быть переопределены.
 * @private
 */
export type IPropertyEditorHiddenProps = keyof IPropertyEditorProps<any>;

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
 * Группа метатипа
 * @public
 */
interface IGroup {
    uid: string;
    name: string;
}

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
     * Ссылка на документацию
     * @public
     */
    readonly devguide?: string;

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
    readonly group?: IGroup;

    /**
     * Сообщает о том, что этот тип расширяющий группу
     * @see Meta.group
     */
    readonly extended?: string;

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
 * Указатель на оригинальный тип и ключ в нём.
 * @public
 * @see Meta.getOrigin
 */
export interface MetaOrigin<RuntimeInterface extends object = any> {
    meta: Meta<RuntimeInterface>;
    key: string;
}

/**
 * Интерфейс базового мета-описания.
 * @public
 * @see Meta.toDescriptor
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
     * id зафиксирован и менять его не нужно при формировании метатипа
     */
    readonly fixedId?: boolean;

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
    readonly editor?: Partial<{ loader: string | Function; props: object }>;

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
     * Данных для примера наполнения.
     * @public
     * @see Meta.sampleData
     * @see Meta.sampleDataImport
     */
    readonly sampleData?: { data?: RuntimeInterface; importPath?: string };

    /**
     * Ссылка на родительский тип объекта.
     * @public
     * @see Meta.getOrigin
     */
    readonly origin?: MetaOrigin;
}

/**
 * Интерфейс мета-описания примитивного значения.
 * @public
 * @see IMeta
 */
export interface IPrimitiveMeta<RuntimeInterface> extends IMeta<RuntimeInterface> {
    readonly is: MetaClass.primitive;
}

type TMetaConstructor<T = any> = new (descriptor: any) => T;

/**
 * Класс, реализующий базовый тип.
 * @public
 * @see IMeta
 */
export class Meta<RuntimeInterface> {
    /**
     * Индентификатор конструктора метакласса
     * @see IMeta.is
     * @see Meta.is
     */
    protected _is: MetaClass;

    /**
     * Уникальный идентификатор типа.
     * @see IMeta.id
     * @see Meta.id
     * @see Meta.getId
     * @see Meta.inherits
     */
    protected _id: string;

    private fixedId: boolean = false;

    private _sampleData: {
        data?: RuntimeInterface;
        importPath?: string;
    };

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
    protected _editor: TmpMetaEditor;

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
     * @see IMeta.origin
     */
    protected _origin?: MetaOrigin;

    /**
     * Конструктор базового типа.
     * @param [descriptor] - Базовое мета-описание.
     * @public
     * @see IMeta
     */
    constructor(descriptor: IMeta<RuntimeInterface> = { is: MetaClass.primitive }) {
        this._is = descriptor.is;
        this._id = descriptor.id ?? this._id ?? '';
        this.fixedId = descriptor.fixedId ?? false;
        this._inherits = descriptor.inherits;
        this._required = descriptor.required ?? true;
        this._defaultValue = descriptor.defaultValue;
        this._sampleData = descriptor.sampleData;
        this._origin = descriptor.origin
            ? {
                  meta: descriptor.origin.meta,
                  key: descriptor.origin.key,
              }
            : undefined;
        this._editor = new TmpMetaEditor(
            descriptor[Meta.KEY_EDITOR]?.loader,
            descriptor[Meta.KEY_EDITOR]?.props,
            descriptor[Meta.KEY_EDITOR]?.component
        );
        this._designtimeEditor = this._createEditor<IControlDesignerProps<RuntimeInterface>>(
            descriptor,
            Meta.KEY_DESIGNTIME_EDITOR
        );
        this._info = createMetaInfo(descriptor.info);
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IMeta<RuntimeInterface> {
        return {
            is: MetaClass.primitive,
            id: this._id || undefined,
            fixedId: this.fixedId,
            inherits: this._inherits?.length ? this._inherits : undefined,
            required: this._required,
            info: this._info,
            editor:
                this._editor?.loader || this._editor?.component !== undefined
                    ? this._editor
                    : undefined,
            designtimeEditor:
                this._designtimeEditor?.loader || this._designtimeEditor?.component
                    ? this._designtimeEditor
                    : undefined,
            defaultValue: this._defaultValue,
            sampleData: this._sampleData,
            origin: this._origin,
        };
    }

    /**
     * Преобразует в json
     */
    toJSON(): TMetaJson {
        return serialize(this);
    }

    /**
     * Копирует тип, создавая новый экземпляр.
     * @param [update] - Изменения в новом типе.
     * @public
     */
    clone<TNewMeta = this, TDescriptor extends IMeta<unknown> = IMeta<any>>(
        update: Partial<TDescriptor> = {}
    ): TNewMeta {
        const Constructor = this.constructor as any;
        let id = update.id ?? this._id;

        // сохраняем базовый тип в цепочке наследования
        let inherits = update.inherits ?? this._inherits;
        if (this._id && (!inherits || inherits?.length === 0)) {
            inherits = [this._id];
        }

        // обновление id для того что бы отличить базовые типы для хранения в сервисе
        if (!(update.fixedId ?? this.fixedId ?? !!update.id)) {
            id = genId(id, update);
        }

        return new Constructor({ ...this.toDescriptor(), ...update, inherits, id });
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
            fixedId: true,
            inherits:
                this._id !== undefined ? [...(this._inherits || []), this._id] : this._inherits,
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
    group(uid: string, name: string = uid): this {
        if (this.getGroup()?.uid === uid) {
            return this;
        }
        return this.clone({ info: { ...this._info, group: { uid, name } } });
    }

    /**
     * Возвращает название группы, к которой относится тип.
     * @see IMeta.info.group
     * @see Meta.group
     */
    getGroup(): IGroup | undefined {
        return this._info.group;
    }

    /**
     * Тип является отображаемым по требованию
     */
    extended(title: string = ''): this {
        if (this.getExtended() === title) {
            return this;
        }
        return this.clone({ info: { ...this._info, extended: title } });
    }

    /**
     * Тип не является отображаемым по требованию
     */
    unextended(): this {
        return this.clone({ info: { ...this._info, extended: undefined } });
    }

    /**
     * Возвращает id группы, которую расширячет
     * @see Meta.extended
     * @see Meta.group
     */
    getExtended(): string {
        return this._info.extended;
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
     * Ссылка но документацию.
     * @param link - Новая ссылка.
     * @see IMeta.info.devguide
     * @see Meta.getDevguide
     */
    devguide(link: string | undefined): this {
        if (this.getDevguide() === link) {
            return this;
        }
        return this.clone({ info: { ...this._info, devguide: link } });
    }

    /**
     * Возвращает ссылку на документацию.
     * @see IMeta.info.devguide
     * @see Meta.devguide
     */
    getDevguide(): string | undefined {
        return this._info.devguide;
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
     * TODO разобраться, зачем тут может быть указан Meta.descriptor
     */
    is<ParentType extends Meta<unknown> | Pick<IMeta<unknown>, 'id'>>(
        parent: ParentType
    ): this is ParentType {
        const parentId = isMeta(parent) ? parent.getId() : parent.id;
        return Boolean(
            parentId &&
                (this._id === parentId ||
                    this._id.indexOf(parentId + GENERATOR_ID_RANDOM_DELIMITER) === 0 ||
                    this._inherits?.includes(parentId))
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
    designtimeEditor<EditorProps extends IControlDesignerProps<RuntimeInterface>>(
        loader: IComponentLoader<EditorProps> | string | undefined,
        props?: Partial<Omit<EditorProps, IPropertyEditorHiddenProps>> | undefined,
        isAlwaysShow?: boolean
    ): this {
        if (this._designtimeEditor?.loader === loader && this._designtimeEditor?.props === props) {
            return this;
        }
        if (!loader) {
            return this.clone({ designtimeEditor: undefined });
        }

        // @ts-ignore hotfix для серилизации. TODO https://dev.sbis.ru/opendoc.html?guid=bcf2d977-599e-46d5-b532-1a2a9540df8a&client=3
        if (this._designtimeEditor?.loader?._moduleName === loader) {
            return this;
        }

        return this.clone({
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
            | Partial<Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>>
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
        if (this._designtimeEditor?.component || this._designtimeEditor?.loader) {
            return this._designtimeEditor;
        }
        if (this._inherits?.length) {
            for (let index = this._inherits.length - 1; index > -1; index--) {
                const parentTypeId = this._inherits[index];
                const defaultEditorLoader = defaultEditorLoaders?.[parentTypeId];
                if (!defaultEditorLoader) {
                    continue;
                }
                if (!defaultDesignTimeEditors.has(defaultEditorLoader)) {
                    defaultDesignTimeEditors.set(
                        defaultEditorLoader,
                        new ComponentLoaderWithProps({
                            loader: defaultEditorLoader,
                        })
                    );
                }
                return defaultDesignTimeEditors.get(defaultEditorLoader);
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
        loader?: IComponentLoader<EditorProps> | string | undefined,
        props?: EditorProps | undefined
    ): this {
        if (this._editor.isSame(loader) && this._editor.props === props) {
            return this;
        }
        if (!loader) {
            return this.clone({ editor: undefined });
        }

        // @ts-ignore hotfix для серилизации. TODO https://dev.sbis.ru/opendoc.html?guid=bcf2d977-599e-46d5-b532-1a2a9540df8a&client=3
        if (this._editor?.loader?._moduleName === loader) {
            return this;
        }

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
            | Partial<Omit<IPropertyEditorProps<RuntimeInterface>, IPropertyEditorHiddenProps>>
            | undefined
    ): this {
        if (this._editor?.props === props) {
            return this;
        }
        return this.clone({
            editor: {
                loader: this._editor?.loader,
                props: { ...(this._editor?.props || {}), ...props },
            },
        });
    }

    /**
     * Возвращает информацию о редакторе.
     * @public
     * @see Meta.editor
     */
    getEditor(defaultEditorLoaders?: IEditorLoaders | ILoadedEditor): IMetaEditor {
        if (this._editor?.component || this._editor?.loader) {
            return this._editor;
        }

        let typesIds = [this._id];
        if (this._inherits?.length) {
            typesIds = [...this._inherits, this._id];
        }

        for (let index = typesIds.length - 1; index > -1; index--) {
            const typeId = typesIds[index];
            const defaultEditorLoader = defaultEditorLoaders?.[typeId];

            if (!defaultEditorLoader) {
                continue;
            }

            if (isLoadedEditor(defaultEditorLoader)) {
                return new TmpMetaEditor(
                    () => Promise.resolve(defaultEditorLoader),
                    {},
                    defaultEditorLoader as Component
                );
            }

            if (!defaultEditors.has(defaultEditorLoader)) {
                defaultEditors.set(defaultEditorLoader, new TmpMetaEditor(defaultEditorLoader));
            }
            return defaultEditors.get(defaultEditorLoader);
        }

        return this._editor;
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
        if (this.isRequired()) {
            return this;
        }
        return this.clone<Meta<Exclude<RuntimeInterface, undefined>>>({ required: true });
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
    isRequired(): this is Meta<Exclude<RuntimeInterface, undefined>> {
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
     * Установка данных для примера наполнения
     * @see IMeta.sampleData
     */
    sampleData(data: RuntimeInterface): this {
        if (this._sampleData?.data === data) {
            return this;
        }
        return this.clone({ sampleData: { data, importPath: this._sampleData?.importPath } });
    }

    /**
     * Установка пути по которому находятся данные для примера наполнения
     * @see IMeta.sampleData
     */
    sampleDataImport(importPath: string): this {
        if (this._sampleData?.importPath === importPath) {
            return this;
        }
        return this.clone({ sampleData: { importPath, data: this._sampleData?.data } });
    }

    /**
     * Получение данных для примера наполнения
     * @see IMeta.sampleData
     */
    getSampleData(): {
        data?: RuntimeInterface;
        importPath?: string;
    } {
        return this._sampleData;
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
    ): ComponentLoaderWithProps<TEditorProps, Omit<TEditorProps, IPropertyEditorHiddenProps>> {
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
    ): ComponentLoaderWithProps<ComponentInterface, Omit<any, IPropertyEditorHiddenProps>> {
        return new ComponentLoaderWithProps({ loader, props, isAlwaysShow, component });
    }

    /**
     * Возвращает базовый мета-тип, расширением которого является текущий
     */
    getBaseType() {
        return this._inherits ? this._inherits[0] : this.getId();
    }

    static KEY_EDITOR: string = 'editor';
    static KEY_DESIGNTIME_EDITOR: string = 'designtimeEditor';

    private static metaConstructors: [TMetaConstructor, (item: unknown) => boolean][] = [
        /* [Meta, isMeta] */
    ];

    static meta<T>(descriptor: T | any = {}): T | any {
        if (isMeta(descriptor)) {
            return descriptor;
        }

        for (let i = Meta.metaConstructors.length; i > 0; i--) {
            const metaVariant = Meta.metaConstructors[i - 1];
            if (metaVariant[1](descriptor)) {
                return new metaVariant[0](descriptor);
            }
        }

        if (isPrimitiveMetaDescriptor(descriptor)) {
            return new Meta(descriptor);
        }

        // type RuntimeInterface = T extends Meta<infer RI> ? RI : any;
        throw new Error(`Неверное мета-описание: ${JSON.stringify(descriptor)}`);
    }

    static registerChildMeta<T extends TMetaConstructor>(
        metaClass: T,
        condition: (item: unknown) => boolean
    ): void {
        this.metaConstructors.push([metaClass, condition]);
    }
}

/**
 * Формирует объект `IMetaInfo`.
 * @param [info] - Визуально описание типа.
 * @private
 */
export function createMetaInfo(info?: IMetaInfo): IMetaInfo {
    return {
        category: info?.category,
        group: info?.group,
        order: info?.order,
        extended: info?.extended,
        icon: info?.icon,
        title: info?.title,
        description: info?.description,
        devguide: info?.devguide,
        hidden: info?.hidden || undefined,
        disabled: info?.disabled || undefined,
    };
}

/**
 * Определяет, что аргумент - это экземпляр любого типа.
 * @param item - Всё, что угодно.
 * @private
 */
export function isMeta<RuntimeInterface>(item: any): item is Meta<RuntimeInterface> {
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

// TODO: Придумать что-то получше (по задаче: https://online.sbis.ru/opendoc.html?guid=432407b0-e389-4c13-acf9-27191d37bbe2&client=3)
export function isBaseWidget(type: Meta<unknown>) {
    return (
        type.getId() === 'widget' ||
        (type.getId().includes('widget') && type.getId().includes(GENERATOR_ID_RANDOM_DELIMITER))
    );
}
