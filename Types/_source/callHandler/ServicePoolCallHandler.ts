import { ICallHandler } from './ICallHandler';
import { RPCRequestParam } from './RPCRequestParam';

const DEFAULT_PARAMETER_NAME = 'srv';
const DEFAULT_PARAMETER_VALUE = '1';

export default class ServicePoolCallHandler implements ICallHandler {
    moduleName: string = 'Types/source:ServicePoolCallHandler';

    handle(request: RPCRequestParam): RPCRequestParam {
        // TODO: нужно добавить публичный метод получения адреса в транспорт
        const { transport } = request;
        if (!transport) {
            return request;
        }
        const url = transport._options?.url;
        if (!url) {
            return request;
        }
        const servicePoolParam = `${DEFAULT_PARAMETER_NAME}=${DEFAULT_PARAMETER_VALUE}`;
        const divider = url.indexOf('?') > -1 ? '&' : '?';

        transport.setUrl(url + divider + servicePoolParam);

        return request;
    }
}
