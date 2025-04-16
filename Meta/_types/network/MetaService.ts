import { Record, adapter } from 'Types/entity';
import { constants } from 'Env/Env';
import { IProviderEndpoint, SbisService } from 'Types/source';
import { MetaResponse } from './MetaResponse';
import deserialize from 'Meta/_types/marshalling/deserializer';
import { logger } from 'Application/Env';
import { Meta } from 'Meta/_types/baseMeta';

const defaultEndpoint = {
    address: '/metadata-repository/service/',
    contract: 'Type',
};
Object.freeze(defaultEndpoint);

const DEFAULT_GET_METHOD = 'Get';

/**
 * Интерфейс опций класса
 * @private
 */
interface IMetaServiceOptions {
    /**
     * Версия для сервиса типов
     */
    version?: string;
    /**
     * Адрес сервиса типов
     */
    endpoint?: IProviderEndpoint | string;

    ignoreTypeScope?: boolean;
}

/**
 * Абстракция над сервисом типов
 * @private
 */
export class MetaService {
    private readonly _endpoint: IProviderEndpoint | string;
    private readonly _version: string;
    private _callParams: Record;
    private _source: SbisService;
    private _ignoreTypeScope: boolean;

    /**
     * Конструктор класса
     * @param options
     */
    constructor(options: IMetaServiceOptions) {
        const { endpoint, version, ignoreTypeScope } = options;

        this._endpoint = endpoint ?? defaultEndpoint;
        this._version = version ?? constants.buildnumber;
        this._ignoreTypeScope = ignoreTypeScope ?? false;
    }

    /**
     * Получает метатипы в одном контейнере MetaResponse
     * @param ids идентификатор метатипа
     * @deprecated используйте getMetaAsSingleMetaResponse
     */
    async getMetaAsArrayMetaResponse(ids: string[]): Promise<MetaResponse> {
        return this._getMetaByIds(ids);
    }

    /**
     * Получает каждый метатип в отдельном контейнере MetaResponse
     * @param ids массив идентификаторы метатипов

     */
    async getMetaAsSingleMetaResponse(ids: string[]): Promise<MetaResponse[]> {
        const result = await this._getMetaByIds(ids);
        if (!result.ok) {
            // если БЛ упал с ошибкой, генерируем ошибку для сохранения совместимости со старым API результата
            return ids.map(() => {
                return MetaResponse.error(new Error(result.errorText));
            });
        }

        const meta = result.meta() as unknown as Meta<unknown>[];

        return meta.map((resp) => {
            return MetaResponse.meta(resp);
        });
    }

    /**
     * Отправляет запрос на получение метатипа
     * @private
     */
    private _getMetaByIds(ids: string[]): Promise<MetaResponse> {
        const callData = {
            Ids: ids,
            Params: this._getCallParams(this._version),
        };
        return this._getSource()
            .call(DEFAULT_GET_METHOD, callData)
            .then((result) => {
                const serviceRS = result.getAll();
                try {
                    const meta = deserialize(serviceRS, true);
                    return MetaResponse.meta(meta) as MetaResponse;
                } catch (err) {
                    logger.error(
                        'Ошибка десериализации ответа сервиса типов. Получен:',
                        serviceRS,
                        err
                    );
                    return MetaResponse.error(err as Error);
                }
            })
            .catch((err) => {
                return MetaResponse.error(err);
            });
    }

    /**
     * Формирует источник для обращения на сервис типов
     * @private
     */
    private _getSource(): SbisService {
        if (!this._source) {
            const endpoint = this._endpoint;
            this._source = new SbisService({ endpoint });
        }

        return this._source;
    }

    /**
     * Формирует параметры запроса на сервис типов
     * @param version версия метатипа
     */
    private _getCallParams(version?: string): Record {
        if (!this._callParams) {
            this._callParams = new Record({
                adapter: new adapter.Sbis(),
                format: {
                    Version: { type: 'string', defaultValue: version },
                    ScopeType: { type: 'string', defaultValue: 'USER' },
                    WithProperties: { type: 'boolean', defaultValue: true },
                    FullDereferencingComplexTypes: { type: 'boolean', defaultValue: true },
                    IgnoreTypeScope: { type: 'boolean', defaultValue: this._ignoreTypeScope },
                },
            });
        }
        return this._callParams;
    }
}
