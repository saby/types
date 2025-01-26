import IAbstract from './IAbstract';
import { EntityMarker } from 'Types/declarations';
import { ICacheParameters, IOptions as IOptionsRemote, IProviderOptions } from '../Remote';
import 'Types/PromiseAPIDeferred';
import { ICallChainItem } from '../chainFactory/CallChainItem';

interface ITransportOptions {
    method: string;
    body?: string;
}

/**
 * Метод Http
 */
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE';

/**
 * Соответствие методов ICrud методам Https
 */
export type IHttpMethodBinding = {
    [name in keyof IOptionsRemote['binding']]: HttpMethod;
};

/**
 * Опции провайдера Https
 * @public
 */
export interface IOptions extends IProviderOptions {
    /**
     * Базовый транспорт, через который нужно отправлять запросы
     */
    transport?: typeof fetch;
    /**
     * Соответствие методов ICrud методам Https
     */
    httpMethodBinding?: IHttpMethodBinding;
}

/**
 * Провайдер для работы с БЛ по транспорту Https
 * @public
 */
class Https implements IAbstract {
    readonly '[Types/_source/provider/IAbstract]': EntityMarker = true;

    protected _baseUrl: string;

    protected _transport: typeof fetch;

    protected _httpMethodBinding: IHttpMethodBinding = {
        create: 'POST',
        read: 'GET',
        update: 'POST',
        destroy: 'POST',
        query: 'POST',
        copy: 'POST',
        merge: 'POST',
        move: 'POST',
    };

    constructor(options: IOptions) {
        if (options.transport) {
            this._transport = options.transport;
        }

        if (typeof options.httpMethodBinding === 'object') {
            this._httpMethodBinding = {
                ...this._httpMethodBinding,
                ...options.httpMethodBinding,
            };
        }

        this._baseUrl = options.endpoint?.address || '';

        if (options.endpoint?.contract) {
            this._baseUrl += `/${options.endpoint.contract}`;
        }
    }

    protected _getTransport() {
        return this._transport || fetch;
    }

    protected _getTransportOptions(method: string, args: object = {}): ITransportOptions {
        const result: ITransportOptions = {
            method,
        };

        if (method !== 'GET') {
            result.body = JSON.stringify(args);
        }

        return result;
    }

    protected _buildUrl(name: string, arg?: Record<string, unknown>): string {
        const path = `${this._baseUrl}/${name}`;

        if (arg && Object.keys(arg).length) {
            const parameters = [];

            for (const key of Object.keys(arg)) {
                if (typeof arg[key] !== 'undefined') {
                    parameters.push(
                        `${key}=${
                            typeof arg[key] === 'string' ? arg[key] : JSON.stringify(arg[key])
                        }`
                    );
                }
            }

            return encodeURI(`${path}?${parameters.join('&')}`);
        }

        return path;
    }

    call<T>(
        name: keyof IHttpMethodBinding,
        args: Record<string, unknown>,
        _cache?: ICacheParameters,
        method?: string,
        _callHandlers?: ICallChainItem
    ): Promise<T> {
        const httpMethod = method || this._httpMethodBinding[name];
        const url = httpMethod === 'GET' ? this._buildUrl(name, args) : this._buildUrl(name);

        return new Promise<T>((resolve, reject) => {
            this._getTransport()(url, this._getTransportOptions(httpMethod, args))
                .then((response) => {
                    if (response.ok) {
                        response.json().then(resolve).catch(reject);
                    } else {
                        reject('Error HTTP: ' + response.status);
                    }
                })
                .catch(reject);
        });
    }
}

export default Https;
