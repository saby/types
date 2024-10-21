import { logger } from 'Application/Env';
import { WidgetMeta } from './widget';
import { loadAsync } from 'WasabyLoader/ModulesLoader';

// TODO: Заменить на реальный тип (по задаче https://online.sbis.ru/opendoc.html?guid=432407b0-e389-4c13-acf9-27191d37bbe2&client=3)
type IEditingElementFacade<_RuntimeInterface = unknown> = any;

type LoadableFunctionSignature = (...args: any[]) => any;

export type FuncLoader<FS extends LoadableFunctionSignature> = (
    value: unknown
) => Promise<FS | { default: FS }>;

interface ILoadableConverterFunc<FS extends LoadableFunctionSignature> {
    /**
     * Ссылка на загрузчик функции конвертера.
     * @public
     */
    readonly loader?: FuncLoader<FS> | string;

    /**
     * Функция конвертации.
     * @public
     */
    readonly func?: FS;
}

export class LoadableConverterFunc<FS extends LoadableFunctionSignature>
    implements ILoadableConverterFunc<FS>
{
    /**
     * Ссылка на загрузчик функции конвертера.
     * @public
     */
    readonly loader?: FuncLoader<FS>;

    /**
     * Функция конвертации.
     * @public
     */
    readonly func?: FS;

    private _moduleName?: string;

    constructor(descriptor: ILoadableConverterFunc<FS> = {}) {
        const loader = descriptor.loader;
        let newLoader: FuncLoader<FS> | undefined;
        if (typeof loader === 'string') {
            newLoader = () => loadAsync(loader);
            // TODO: https://dev.sbis.ru/opendoc.html?guid=702dbadf-8468-413c-bfa7-11a8dc6c35dc&client=3
            // @ts-ignore Временное решение для сериализации. Решится по задача
            newLoader._moduleName = loader;
        } else {
            newLoader = loader;
        }

        this.loader = newLoader;
        this.func = descriptor.func;
    }

    /**
     * Загружена ли функция.
     * @public
     * @returns {boolean}
     */
    get ready(): boolean {
        return Boolean(!this.loader || this.func || this.func === BROKEN_FUNC);
    }

    /**
     * Загружает функцию.
     * @returns {Promise}
     * @public
     */
    async load(value?: unknown): Promise<FS> {
        if (this.loader && this.func === undefined) {
            (this as any).func = null; // Предотвращаем повторные вызовы load
            let result: any;
            try {
                result = await this.loader(value);
            } catch (e: unknown) {
                const err = e as {
                    requireModules?: string[];
                    message?: string;
                };
                logger?.error(
                    'Meta/types: Ошибка загрузчика функции конвертера: ',
                    err.requireModules || err.message
                );
            }

            if (typeof result === 'function') {
                (this as any).func = result;
            } else if (typeof result === 'object' && typeof result?.default === 'function') {
                (this as any).func = result.default;
            } else {
                throw new Error('Неизвестный формат функции конвертера: ' + result);
            }
        }
        return this.func as FS;
    }
}

export const BROKEN_FUNC: any = () => {
    logger?.error('Из-за ошибки загрузки функции конвертера использована функция-заглушка');
};

export type ConversionContent = (IEditingElementFacade | IEditingElementFacade[])[];

export type ValueConverterOutputType = (element: IEditingElementFacade) => ConversionContent;

export type ValueConverterInputType = (
    originalElements: ConversionContent,
    extractedElements: ConversionContent,
    meta: WidgetMeta
) => ConversionContent;

/**
 * Интерфейс загрузчика конвертера
 * @public
 */
export type ValueConverterLoader<FS extends ValueConverterOutputType | ValueConverterInputType> =
    FuncLoader<FS>;

export interface IValueConverter<FS extends ValueConverterOutputType | ValueConverterInputType>
    extends ILoadableConverterFunc<FS> {}

export class ValueConverter<FS extends ValueConverterOutputType | ValueConverterInputType>
    extends LoadableConverterFunc<FS>
    implements IValueConverter<FS>
{
    constructor(descriptor: IValueConverter<FS> = {}) {
        super(descriptor);
    }
}

export type ConvertableCheckerSignature = (meta: WidgetMeta) => boolean;

export interface IConvertableChecker extends ILoadableConverterFunc<ConvertableCheckerSignature> {}

export class ConvertableChecker extends LoadableConverterFunc<ConvertableCheckerSignature> {
    constructor(descriptor: IConvertableChecker) {
        super(descriptor);
    }
}
