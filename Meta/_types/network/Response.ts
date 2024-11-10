import { Meta } from '../baseMeta';
import { logger } from 'Application/Env';

/**
 * @private
 */
export default class MetaResponse<TMeta = Meta<unknown>> {
    private _error: Error;
    private _meta: TMeta;
    get ok(): boolean {
        return !!this._meta && !this._error;
    }
    get errorText(): string {
        return this._error?.message || '';
    }
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
