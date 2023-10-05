import { ICallHandler } from './ICallHandler';
import { RPCRequestParam } from './RPCRequestParam';

/**
 * Обработчик сообщений, выставляющий timeout запроса на уровне транспорта
 * @public
 */
export default class TimeoutCallHandler implements ICallHandler {
    private readonly _timeout: number;

    /**
     * Конструктор обработчика сообщений
     * @param timeout Таймаут запроса (в мс)
     */
    constructor(timeout: number) {
        this._timeout = timeout;
    }

    handle(request: RPCRequestParam): RPCRequestParam {
        if (this._timeout > 0) {
            request.timeout = this._timeout;
            request.headers['X-Timeout'] = this._timeout;
        }
        return request;
    }

    moduleName: string = 'Types/source:TimeoutCallHandler';
}
