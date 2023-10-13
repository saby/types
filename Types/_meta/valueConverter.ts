import { logger } from 'Application/Env';
// TODO: Заменить на реальный тип (по задаче https://online.sbis.ru/opendoc.html?guid=432407b0-e389-4c13-acf9-27191d37bbe2&client=3)
type IEditingElementFacade<RuntimeInterface = unknown> = any;

export const BROKEN_CONVERTER_FUNC: any = () => {
    logger.error('Из-за ошибки загрузки функции конвертации использована функция-заглушка');
};

export type ValueConverterOutputType = (
    element: IEditingElementFacade
) => IEditingElementFacade | IEditingElementFacade[];

export type ValueConverterInputType = (
    elements: IEditingElementFacade | IEditingElementFacade[]
) => IEditingElementFacade | IEditingElementFacade[];

/**
 * Интерфейс загрузчика конвертера
 * @public
 */
export type ValueConverterLoader<FS extends ValueConverterOutputType | ValueConverterInputType> = (
    value: unknown
) => Promise<FS | { default: FS }>;

export interface IValueConverter<FS extends ValueConverterOutputType | ValueConverterInputType> {
    /**
     * Ссылка на загрузчик функции конвертера.
     * @public
     */
    readonly loader?: ValueConverterLoader<FS>;

    /**
     * Функция конвертации.
     * @public
     */
    readonly func?: FS;
}

export class ValueConverter<FS extends ValueConverterOutputType | ValueConverterInputType>
    implements IValueConverter<FS>
{
    /**
     * Ссылка на загрузчик функции конвертера.
     * @public
     */
    readonly loader?: ValueConverterLoader<FS>;

    /**
     * Функция конвертации.
     * @public
     */
    readonly func?: FS;

    constructor(descriptor: IValueConverter<FS> = {}) {
        this.loader = descriptor.loader;
        this.func = descriptor.func;
    }

    /**
     * Загружена ли функция конвертации.
     * @public
     * @returns {boolean}
     */
    get ready(): boolean {
        return Boolean(!this.loader || this.func || this.func === BROKEN_CONVERTER_FUNC);
    }

    /**
     * Загружает функцию конвертации.
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
                const err = e as { requireModules?: string[]; message?: string };
                logger.error(
                    'Types/meta: Ошибка загрузчика функции конвертации: ',
                    err.requireModules || err.message
                );
            }

            if (typeof result === 'function') {
                (this as any).func = result;
            } else if (typeof result === 'object' && typeof result?.default === 'function') {
                (this as any).func = result.default;
            } else {
                throw new Error('Неизвестный формат конвертера: ' + result);
            }
        }
        return this.func;
    }
}
