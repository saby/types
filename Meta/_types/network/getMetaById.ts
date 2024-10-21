import { logger } from 'Application/Env';
import { constants } from 'Env/Env';
import { SbisService, IProviderEndpoint } from 'Types/source';
import { Record } from 'Types/entity';
import type { RecordSet } from 'Types/collection';
import MetaResponse from './Response';
import deserialize from '../marshalling/deserializer';
import { TMetaJson } from '../marshalling/format';

let serviceCallParams: Record;
function getServiceCallParams(): Record {
    if (!serviceCallParams) {
        serviceCallParams = new Record({
            adapter: 'adapter.sbis',
            format: [
                { name: 'Version', type: 'string' },
                { name: 'ScopeType', type: 'string' },
            ],
        });
        serviceCallParams.set({
            Version: constants.buildnumber,
            ScopeType: 'USER',
        });
    }
    return serviceCallParams;
}

function getServiceCallParamsNew(version?: string): Record {
    if (!serviceCallParams) {
        serviceCallParams = new Record({
            adapter: 'adapter.sbis',
            format: [
                { name: 'Version', type: 'string' },
                { name: 'ScopeType', type: 'string' },
                { name: 'FullDereferencingComplexTypes', type: 'boolean' },
                { name: 'WithProperties', type: 'boolean' },
            ],
        });
        serviceCallParams.set({
            Version: version || constants.buildnumber,
            ScopeType: 'USER',
            WithProperties: true,
            FullDereferencingComplexTypes: true,
        });
    }
    return serviceCallParams;
}

/**
 * @private
 */
export default async function getMetaById(
    Id: string,
    endpoint: IProviderEndpoint | string,
    version?: string,
    newFormat?: boolean
): Promise<MetaResponse> {
    const Params = newFormat ? getServiceCallParamsNew(version) : getServiceCallParams();
    const serviceCallData = newFormat ? { Ids: [Id], Params } : { Id, Params };
    const methodName = newFormat ? 'Get' : 'AsJson';
    const metaResponse: MetaResponse = await new SbisService({ endpoint })
        .call(methodName, serviceCallData)
        .then(
            (result) => {
                const rawData: RecordSet | TMetaJson = newFormat
                    ? result.getAll()
                    : result.getRawData();
                try {
                    const meta = deserialize(rawData, newFormat);
                    return MetaResponse.meta(meta);
                } catch (err) {
                    logger.error(
                        'Ошибка десериализации мета-массива. Переданный массив:',
                        rawData,
                        err
                    );
                    return MetaResponse.error(err);
                }
            },
            (err) => {
                return MetaResponse.error(err);
            }
        );
    return metaResponse;
}
