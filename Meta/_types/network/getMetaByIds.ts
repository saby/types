import { logger } from 'Application/Env';
import { constants } from 'Env/Env';
import { SbisService, IProviderEndpoint } from 'Types/source';
import MetaResponse from './Response';
import deserialize from '../marshalling/deserializer';
import { TMetaJson } from '../marshalling/format';

/**
 * @private
 */
export default async function getMetaByIds(
    Ids: string[],
    endpoint: IProviderEndpoint | string
): Promise<MetaResponse> {
    const serviceCallData = { Ids, Version: constants.buildnumber };
    const metaResponse: MetaResponse = await new SbisService({ endpoint })
        .call('GetJson', serviceCallData)
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
