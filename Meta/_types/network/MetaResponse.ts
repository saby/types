import { Meta } from '../baseMeta';
import { logger } from 'Application/Env';

/**
 * Результат загрузки метатипа из сервиса типов
 * @remark
 * Содержит внутри себя полученный экземпляр метатипа или сообщение об ошибке.
 * @public
 */
export class MetaResponse<TMeta = Meta<unknown>> {
    private _error: Error;
    private _meta: TMeta;

    /**
     * Возвращает признак, что метатип загружен успешно
     */
    get ok(): boolean {
        return !!this._meta && !this._error;
    }

    /**
     * Возвращает сообщение об ошибке загрузки метатипа
     */
    get errorText(): string {
        return this._error?.message || '';
    }

    /**
     * Возвращает загруженный метатип
     */
    meta(): TMeta {
        if (!this._meta) {
            logger.error(
                'Попытка получить результат, которого нет. ' +
                    'Необходимо вызывать response.meta() только если response.ok равен true.'
            );
        }
        return this._meta;
    }

    // Создание ответа с ошибкой.
    static error(error: Error): MetaResponse {
        const errorResponse = new MetaResponse();
        errorResponse._error = error;
        return errorResponse;
    }

    // Создание ответа с meta.
    static meta<TMeta = Meta<unknown>>(meta: TMeta): MetaResponse<TMeta> {
        const metaResponse = new MetaResponse<TMeta>();
        metaResponse._meta = meta;
        return metaResponse;
    }
}
