import { IEndpoint } from './IProvider';
import { getMergeableProperty } from '../entity';
import { EntityMarker } from 'Types/declarations';

/**
 * @public
 */
export interface IOptions {
    /**
     *
     */
    endpoint?: IEndpoint | string;
}

/**
 * Миксин, позволяющий задавать конечную точку доступа.
 * @public
 */
export default abstract class EndpointMixin {
    readonly '[Types/_source/EndpointMixin]': EntityMarker = true;

    /**
     * Конечная точка, обеспечивающая доступ клиента к функциональным возможностям источника данных.
     * @remark
     * Можно использовать сокращенную запись, передав значение в виде строки - в этом случае оно будет интерпретироваться как контракт (endpoint.contract).
     * @see {link@ getEndPoint}
     * @example
     * Подключаем пользователей через HTTP API:
     * <pre>
     *     const dataSource = new HttpSource({
     *         endpoint: {
     *             address: '/api/',
     *             contract: 'users/'
     *         }
     *     });
     * </pre>
     * Подключаем пользователей через HTTP API с использованием сокращенной нотации:
     * <pre>
     *     const dataSource = new HttpSource({
     *         endpoint: '/users/'
     *     });
     * </pre>
     * Подключаем пользователей через HTTP API с указанием адреса подключения:
     * <pre>
     *     const dataSource = new RpcSource({
     *         endpoint: {
     *             address: '//server.name/api/rpc/',
     *             contract: 'Users'
     *         }
     *     });
     * </pre>
     */
    protected _$endpoint: IEndpoint;

    /**
     *
     */
    getEndpoint(): IEndpoint {
        return { ...this._$endpoint };
    }

    protected static _validateOptions(options?: IOptions): IOptions | undefined {
        // Shortcut support
        if (options && typeof options.endpoint === 'string') {
            options.endpoint = { contract: options.endpoint };
        }

        return options;
    }
}

Object.assign(EndpointMixin.prototype, {
    '[Types/_source/EndpointMixin]': true,
    _$endpoint: getMergeableProperty<IEndpoint>({}),
});
