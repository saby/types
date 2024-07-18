/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IWidgetMeta } from './widget';
import type {} from './network/loadEditors';
import type { TMetaJson } from './marshalling/format';
import { Meta, MetaClass } from './baseMeta';
import { WidgetMeta } from './widget';
import { serialize } from './marshalling/serializer';
import { serialize as serializeNew } from './marshalling/serializerNew';

/**
 * Интерфейс мета-описания "страница".
 * @public
 * @see IMeta
 * @see IPageMetaAttributes
 */
export interface IPageMeta<ComponentPropsInterface extends object>
    extends IWidgetMeta<ComponentPropsInterface> {
    readonly is: MetaClass.page;

    readonly kaidzen?: string;

    readonly preview?: string;

    readonly url?: string;

    readonly git?: string;

    readonly design?: string;

    readonly accessArea?: string[];

    readonly templates?: string[];

    readonly prefetchConfig?: IPagePrefetchConfig;

    readonly constructorProps?: unknown;
}

interface IPagePrefetchConfig {
    customDataLoader: string;
    prepareExternalBindings: string;
    getLoaderConfig: string;
}

/**
 * Класс, реализующий тип "страница".
 * @public
 * @see Meta
 * @see IPageMeta
 */
export class PageMeta<
    T = object,
    ComponentPropsInterface extends object = T extends object ? T : never
> extends WidgetMeta<T, ComponentPropsInterface> {
    is: MetaClass.page;

    protected _kaidzen: string;

    protected _preview: string;

    protected _url: string;

    protected _git: string;

    protected _design: string;

    protected _accessArea: string[];

    protected _templates: string[];

    protected _prefetchConfig: IPagePrefetchConfig;

    protected _constructorProps: unknown;

    /**
     * Конструктор типа "страница".
     * @param descriptor - Мета-описание страницы.
     * @public
     * @see IPageMeta
     */
    constructor(descriptor: IPageMeta<ComponentPropsInterface> = { is: MetaClass.page }) {
        super(descriptor);

        this._kaidzen = descriptor.kaidzen ?? '';
        this._preview = descriptor.preview ?? '';
        this._url = descriptor.url ?? '';
        this._git = descriptor.git ?? '';
        this._design = descriptor.design ?? '';
        this._accessArea = descriptor.accessArea ?? [];
        this._templates = descriptor.templates ?? [];
        this._prefetchConfig = this.createPrefetchConfig(descriptor.prefetchConfig);
        this._constructorProps = this.createConstructorConfig(descriptor.constructorProps);
    }

    private createPrefetchConfig(constructorProps?: IPagePrefetchConfig): IPagePrefetchConfig {
        if (constructorProps) {
            return constructorProps;
        }
        return {
            customDataLoader: '',
            prepareExternalBindings: '',
            getLoaderConfig: '',
        };
    }

    private createConstructorConfig<TPageConstructorProps>(
        prefetchConfig?: TPageConstructorProps
    ): TPageConstructorProps {
        if (prefetchConfig) {
            return prefetchConfig;
        }
        return {
            previewButtonVisible: false,
            shopConfig: {
                viewMode: 'simple',
                items: [],
                detailedItems: [],
                groups: [],
                hideExisted: false,
            },
            adaptiveConfig: {
                items: [{}],
            },
            editorBackground: '',
            metaTypes: [],
            pageConstructors: [],
            editorTemplateName: '',
            headerToolbarItems: [],
            tabsConfig: {
                constructorTabTitle: '',
                metaTypes: [],
            },
            minimizedWidth: 0,
            propStorageId: '',
            fieldsConfig: {
                endpoint: '',
            },
        } as unknown as TPageConstructorProps;
    }

    /**
     * Меняет кайдзен страницы.
     * @param kaidzen - Новый кайдзен страницы.
     * @see IPageMeta.info.kaidzen
     * @see PageMeta.getKaidzen
     */
    kaidzen(kaidzen: string): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ kaidzen });
    }

    /**
     * Возвращает кайдзен страницы.
     * @see IPageMeta.info.kaidzen
     * @see PageMeta.kaidzen
     */
    getKaidzen(): string {
        return this._kaidzen;
    }

    /**
     * Меняет превью страницы.
     * @param preview - Новое превью страницы.
     * @see IPageMeta.preview
     * @see PageMeta.getPreview
     */
    preview(preview: string): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ preview });
    }

    /**
     * Возвращает превью страницы.
     * @see IPageMeta.preview
     * @see PageMeta.preview
     */
    getPreview(): string {
        return this._preview;
    }

    /**
     * Меняет адрес страницы.
     * @param url - Новый адрес страницы.
     * @see IPageMeta.url
     * @see PageMeta.getUrl
     */
    url(url: string): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ url });
    }

    /**
     * Возвращает адерс страницы.
     * @see IPageMeta.url
     * @see PageMeta.url
     */
    getUrl(): string {
        return this._url;
    }

    /**
     * Меняет адрес репозитория страницы.
     * @param git - Новый адрес репозитория страницы.
     * @see IPageMeta.git
     * @see PageMeta.getGit
     */
    git(git: string): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ git });
    }

    /**
     * Возвращает адерс репозитория страницы.
     * @see IPageMeta.git
     * @see PageMeta.git
     */
    getGit(): string {
        return this._git;
    }

    /**
     * Меняет адрес макета страницы.
     * @param design - Новый адрес макета страницы.
     * @see IPageMeta.design
     * @see PageMeta.getDesign
     */
    design(design: string): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ design });
    }

    /**
     * Возвращает адерс макета страницы.
     * @see IPageMeta.design
     * @see PageMeta.design
     */
    getDesign(): string {
        return this._design;
    }

    /**
     * .
     * @see IPageMeta.accessArea
     * @see PageMeta.getAccessArea
     */
    accessArea(accessArea: string[]): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ accessArea });
    }

    /**
     * .
     * @see IPageMeta.accessArea
     * @see PageMeta.accessArea
     */
    getAccessArea(): string[] {
        return this._accessArea;
    }

    /**
     * Устанавливает список шаблонов компонентов.
     * @see IPageMeta.templates
     * @see PageMeta.getTemplates
     */
    templates(templates: string[]): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ templates });
    }

    /**
     *  Возвращает список шаблонов компонентов.
     * @see IPageMeta.templates
     * @see PageMeta.templates
     */
    getTemplates(): string[] {
        return this._templates;
    }

    /**
     * Устанавливает настройки загрузки данных для конструктора.
     * @see IPageMeta.prefetchConfig
     * @see PageMeta.getPrefetchConfig
     */
    prefetchConfig(prefetchConfig: IPagePrefetchConfig): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ prefetchConfig });
    }

    /**
     * Возвращает настройки загрузки данных для конструктора.
     * @see IPageMeta.prefetchConfig
     * @see PageMeta.prefetchConfig
     */
    getPrefetchConfig(): IPagePrefetchConfig {
        return this._prefetchConfig;
    }

    /**
     * Устанавливает настройки редактора.
     * @see IPageMeta.constructorProps
     * @see PageMeta.getConstructorProps
     */
    constructorProps<TPageConstructorProps>(constructorProps: TPageConstructorProps): this {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore TODO поправть типы
        return this.clone({ constructorProps });
    }

    /**
     * Возвращает настройки редактора.
     * @see IPageMeta.constructorProps
     * @see PageMeta.constructorProps
     */
    getConstructorProps<TPageConstructorProps>(): TPageConstructorProps {
        return this._constructorProps as unknown as TPageConstructorProps;
    }

    /**
     * Преобразует тип в мета-описание.
     */
    toDescriptor(): IPageMeta<ComponentPropsInterface> {
        return {
            ...super.toDescriptor(),
            is: MetaClass.page,
            kaidzen: this._kaidzen,
            preview: this._preview,
            url: this._url,
            git: this._git,
            design: this._design,
            components: this._components,
            accessArea: this._accessArea,
            templates: this._templates,
            prefetchConfig: this._prefetchConfig,
            constructorProps: this._constructorProps,
        };
    }

    toJSON(isNewFormat: boolean = false): TMetaJson {
        // проверяем на true, т.к. нативный JSON.stringify вызывает toJSON() с аргументами
        // например JSON.stringify([a, b]), вызовет a.toJSON('0') и b.toJSON('1')
        return isNewFormat === true ? serializeNew(this) : serialize(this);
    }
}

/**
 * Определяет, что аргумент - это мета-описание страницы.
 * @param descriptor - Всё, что угодно.
 * @private
 */
export function isPageMetaDescriptor<RuntimeInterface extends object>(
    descriptor: any
): descriptor is IPageMeta<RuntimeInterface> {
    return descriptor?.is === MetaClass.page;
}

Meta.registerChildMeta(PageMeta, isPageMetaDescriptor);
