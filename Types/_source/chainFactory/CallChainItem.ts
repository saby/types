import { logger } from '../../util';
import { ICallHandler } from '../callHandler/ICallHandler';
import { RPCRequestParam } from '../callHandler/RPCRequestParam';

function instanceOfCallHandler(object: any): boolean {
    return 'handle' in object;
}

/**
 * Интерфейс элемента цепочки
 * @private
 */
export interface ICallChainItem {
    /**
     * Выставляет следующий узел цепочки
     * @param handler следующий узел цепочки
     */
    setNext(handler: ICallChainItem): ICallChainItem;
    /**
     * Возвращает следующий узел цепочки
     */
    getNext(): ICallChainItem;
    /**
     * Обрабатывает объект запроса с помощью пользовательского обработчика сообщений
     * @see Types/source:ICallHandler#handle
     * @param {Types/source:RPCRequestParam} request Объект с параметрами запроса
     */
    processRequest(request: RPCRequestParam): RPCRequestParam;
}

/**
 * Элемент цепочки обязанностей
 * @private
 */
export class CallChainItem implements ICallChainItem {
    protected _$handler: ICallHandler;
    protected _$next: ICallChainItem;
    protected _moduleName: string = 'Types/source:CallChainItem';

    constructor(handler: ICallHandler, next?: ICallChainItem) {
        if (!handler || !instanceOfCallHandler(handler)) {
            throw TypeError('Argument "handler" should implement [Types/source:ICallHandler]');
        }

        this._$handler = handler;

        if (next) {
            this._$next = next;
        }
    }

    /**
     * Выставляет следующий узел цепочки обязанностей
     * @remark
     * Позволяет связать обработчики простым способом handler.setNext(foo).setNext(bar)
     * @param handler следующий узел цепочки обязанностей
     */
    setNext(handler: ICallChainItem): ICallChainItem {
        this._$next = handler;
        return handler;
    }

    /**
     * Возвращает следующий узел цепочки обязанностей
     */
    getNext(): ICallChainItem {
        return this._$next;
    }

    /**
     * Прогоняет через обработчик следующий вызов
     * @param {Types/source:RequestParam} request Объект с параметрами запроса
     */
    processRequest(request: RPCRequestParam): RPCRequestParam {
        try {
            const result = this._$handler.handle(request);
            return this._callNext(result);
        } catch (error) {
            logger.error(
                this._moduleName,
                `call handler in chain throws an error "${error.message}". Chain item will be skipped`
            );
            return this._callNext(request);
        }
    }

    /**
     * Вызывает обработчик из следующего узла цепочки обязанностей
     * @param {Types/source:RPCRequestParam} request Объект с параметрами запроса
     */
    protected _callNext(request: RPCRequestParam): RPCRequestParam {
        if (this._$next) {
            return this._$next.processRequest(request);
        }
        return request;
    }
}

/**
 * Корневой обработчик сообщений.
 * @remark На данный момент корневой узел цепочки обязанностей ничего не делает.
 * В будущем возьмет на себя задачу обработки запроса, получения ответа и возврата его по цепочке обратно в начало.
 * @private
 */
export class RootCallChainItem implements ICallChainItem {
    setNext(handler: ICallChainItem): ICallChainItem {
        throw new Error(
            'RootCallChainItem::setNext(): unable to set next node for root chain item'
        );
    }

    getNext(): ICallChainItem {
        throw new Error(
            'RootCallChainItem::getNext(): unable to get next node for root chain item'
        );
    }

    processRequest(request: RPCRequestParam): RPCRequestParam {
        return request;
    }
}
