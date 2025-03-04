import { IProviderEndpoint } from 'Types/source';
import { MetaResponse } from './MetaResponse';
import { MetaService } from './MetaService';

/**
 * Опции функции загрузки метатипов
 * @public
 */
interface IMetaFetchOptions {
    /**
     * Список идентификаторов требуемых метатипов
     */
    ids: string[];
    /**
     * Требуемая версия метатипа. По умолчанию текущая версия дистрибутива.
     */
    version?: string;
    /**
     * Параметры доступа к сервису типов
     * @remark
     * По умолчанию:
     * - сервис /metadata-repository/service/
     * - контракт Type
     * - метод Get
     */
    endpoint?: IProviderEndpoint | string;
}

/**
 * Получает метатип из сервиса типов
 * @deprecated используйте Meta/types:fetch
 * @remark
 * В результате будет один MetaResponse, который содержит объект со всеми запрошенными типами Record<string, Meta>
 * @example
 * Получим метатип Controls-Input/inputConnected:Text
 * <pre>
 *     import { fetchAll } from 'Meta/types';
 *
 *     const metaResponse = await fetchAll({ids: ['Controls-Input/inputConnected:Text']});
 * </pre>
 *
 * Проверим, что метатип загружен без ошибок:
 * <pre>
 *     metaResponse.ok(); // true
 * </pre>
 *
 * Получим объект со всеми экземплярами загруженных метатипов:
 * <pre>
 *     metaResponse.meta(); // WidgetMeta[]
 * </pre>
 * @public
 */
export function fetchAll(options?: IMetaFetchOptions): Promise<MetaResponse> {
    validateFetchOptions(options);

    const metaService = new MetaService({
        version: options?.version,
        endpoint: options?.endpoint,
    });

    return metaService.getMetaAsArrayMetaResponse(options?.ids);
}

/**
 * Получает метатип из сервиса типов
 * @remark
 * В результате будет массив из MetaResponse, каждый содержит по одному метатипу.
 * @example
 * Получим метатип Controls-Input/inputConnected:Text
 * <pre>
 *     import { fetch } from 'Meta/types';
 *
 *     const [metaResponse] = await fetch({ids: ['Controls-Input/inputConnected:Text']});
 * </pre>
 *
 * Проверим, что метатип загружен без ошибок:
 * <pre>
 *     metaResponse.ok(); // true
 * </pre>
 *
 * Получим экземпляр загруженного метатипа:
 * <pre>
 *     metaResponse.meta(); // WidgetMeta...
 * </pre>
 * @public
 */
export default function fetch(options?: IMetaFetchOptions): Promise<MetaResponse[]> {
    validateFetchOptions(options);

    const metaService = new MetaService({
        version: options.version,
        endpoint: options.endpoint,
    });

    return metaService.getMetaAsSingleMetaResponse(options.ids);
}

function validateFetchOptions(options?: IMetaFetchOptions): asserts options is IMetaFetchOptions {
    if (!options || typeof options === 'string') {
        throw new TypeError(
            'Неподдерживаемый тип аргумента options. Используйте IMetaFetchOptions'
        );
    }

    if (!Array.isArray(options?.ids)) {
        throw new TypeError('Передан некорректный массив options.ids');
    }
}
