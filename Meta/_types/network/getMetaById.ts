import { logger } from 'Application/Env';
import { constants } from 'Env/Env';
import { SbisService, IProviderEndpoint } from 'Types/source';
import { Record } from 'Types/entity';
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

/**
 * @private
 */
export default async function getMetaById(
    Id: string,
    endpoint: IProviderEndpoint | string
): Promise<MetaResponse> {
    const Params = getServiceCallParams();
    const serviceCallData = { Id, Params };
    const metaResponse: MetaResponse = await new SbisService({ endpoint })
        .call('AsJson', serviceCallData)
        .then(
            (result) => {
                const rawData: TMetaJson = result.getRawData();
                try {
                    const meta = deserialize(rawData);
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
