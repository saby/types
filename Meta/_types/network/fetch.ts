import { IProviderEndpoint } from 'Types/source';
import MetaResponse from './Response';
import getMetaById from './getMetaById';
import getMetaByIds from './getMetaByIds';

interface IMetaFetchOptions {
    ids: string[];
    endpoint?: IProviderEndpoint | string;
}

// Тип для описания Фасада.
type TMetaFetch = {
    (resource: string, options: IMetaFetchOptions): Promise<MetaResponse[]>;
    (options: IMetaFetchOptions): Promise<MetaResponse[]>;
};
const defaultEndpoint = {
    address: '/metadata-repository/service/',
    contract: 'MetaType',
};
Object.freeze(defaultEndpoint);

/**
 * @public
 */
export default (async function metaFetch(
    resource?: string | IMetaFetchOptions,
    options?: IMetaFetchOptions
): Promise<MetaResponse[]> {
    const finalOptions = getOptionsByFacadeArguments(resource, options);
    const metaIds = finalOptions.ids;
    if (!Array.isArray(metaIds)) {
        throw new TypeError('Передан некорректный массив id');
    }
    const endpoint = finalOptions.endpoint || defaultEndpoint;
    const result = await Promise.all(metaIds.map((id) => getMetaById(id, endpoint)));
    return result;
} as TMetaFetch);

/**
 * @public
 */
export async function metaFetchAll(
    resource?: string | IMetaFetchOptions,
    options?: IMetaFetchOptions
): Promise<MetaResponse> {
    const finalOptions = getOptionsByFacadeArguments(resource, options);
    const metaIds = finalOptions.ids;
    if (!Array.isArray(metaIds)) {
        throw new TypeError('Передан некорректный массив id');
    }
    const endpoint = finalOptions.endpoint || defaultEndpoint;
    const result = await Promise.resolve(getMetaByIds(metaIds, endpoint));
    return result;
}

function getOptionsByFacadeArguments(
    resource?: string | IMetaFetchOptions,
    options?: IMetaFetchOptions
): IMetaFetchOptions {
    if (typeof resource === 'string') {
        if (options.endpoint) {
            throw new TypeError('Попытка задать путь до сервиса различными способами одновременно');
        }
        return {
            ...options,
            endpoint: {
                ...defaultEndpoint,
                address: resource,
            },
        };
    }
    return resource;
}
