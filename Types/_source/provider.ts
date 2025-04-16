/**
 * Библиотека получения данных.
 * @library
 * @public
 * @module
 */

export { IEndpoint as ISbisBusinessLogicEndPoint } from './IProvider';

export { default as IAbstract } from './provider/IAbstract';
export { default as IChannel } from './provider/IChannel';
export { default as INotify } from './provider/INotify';
export {
    default as SbisBusinessLogic,
    IOptions as ISbisBusinessLogicOptions,
    IRpcTransportConstructor,
    IRpcTransportOptions,
    IRpcTransport,
} from './provider/SbisBusinessLogic';

export {
    default as Https,
    IHttpMethodBinding,
    IOptions as IHttpOptions,
    HttpMethod as HttpMethodType
} from './provider/Https';
