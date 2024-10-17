import { RPCRequestParam } from './RPCRequestParam';

/**
 * Интерфейс пользовательского обработчика сообщений
 * @remark Обработчик сообщений поддерживается только в провайдере Browser/Transport:RPCJSON
 * @see {@link Types/source:RPCRequestParam}
 * @see {@link Types/source:SbisService#callHandlers}
 * @public
 * @example
 * Пример обработчика сообщений, задающего timeout запроса:
 * <pre>
 *     import {ICallHandler} from 'Types/source';
 *
 *     class TimeoutCallHandler implements ICallHandler {
 *         private _$timeout;
 *
 *         constructor(timeout: number) {
 *             this._$timeout = timeout;
 *         }
 *
 *         handle(request: RPCRequestParam): RPCRequestParam {
 *             request.timeout = this._$timeout;
 *             return request;
 *         }
 *     }
 * </pre>
 *
 * Пример обработчика сообщений, выставляющего требуемые заголовки кеширования:
 * <pre>
 *     import {ICallHandler} from 'Types/source';
 *
 *     class CacheCallHandler implements ICallHandler {
 *         handle(request: RPCRequestParam): RPCRequestParam {
 *             const cacheParams = {
 *                 'X-PublishAsyncResponse': true,
 *                 maxAge: 123,
 *                 ignoredParams: ['test']
 *             };
 *            request.headers = { ...request.headers, ...cacheParams };
 *             return request;
 *         }
 *     }
 * </pre>
 *
 * Пример обработчика сообщений, отправляющего все запросы на служебный пул:
 * <pre>
 *     import {ICallHandler} from 'Types/source';
 *
 *     class ServicePoolHandler implements ICallHandler {
 *         handle(request: RPCRequestParam): RPCRequestParam {
 *             const url = new URL(request.url);
 *             const searchParams = url.searchParams;
 *
 *             if (!searchParams.has('srv')) {
 *                 searchParams.set('srv', '1');
 *             }
 *
 *             request.url = url.toString();
 *             return request;
 *         }
 *     }
 * </pre>
 *
 * Обработчики сообщений могут быть переданы в опции callHandlers конструктора {@link Types/source:SbisService}:
 * <pre>
 *     import {SbisService} from 'Types/source';
 *
 *     const handlers = new List<ICallHandler>({
 *         items: [
 *             new CacheCallHandler(),
 *             new TimeoutCallHandler(5000)
 *         ]
 *     });
 *
 *     const source = new SbisService({
 *         endpoint: 'Users',
 *         callHandlers: handlers
 *     });
 * </pre>
 *
 * Либо могут быть добавлены в список обработчиков у существующего экземпляра {@link Types/source:SbisService}:
 * <pre>
 *     // получаем список обработчиков сообщений у существующего источника
 *     const handlers = source.callHandlers;
 *
 *     handlers.add(new ServicePoolHandler());
 *     handlers.add(new TimeoutCallHandler(5000));
 * </pre>
 */
export interface ICallHandler {
    /**
     *
     */
    moduleName: string;
    /**
     *
     */
    handle(request: RPCRequestParam): RPCRequestParam;
}
