import { List } from '../../collection';
import { mixin } from '../../util';
import { DestroyableMixin } from '../../entity';
import { CallChainItem, ICallChainItem, RootCallChainItem } from './CallChainItem';
import { ICallHandler } from '../callHandler/ICallHandler';
import { RPCRequestParam } from '../callHandler/RPCRequestParam';

/**
 * Возвращает признак соответствия списку {@link Types/collection:List}
 * @param handler пользовательский обработчик сообщений
 */
function isList(handler: List<ICallHandler>): boolean {
    return handler['[Types/_collection/List]'];
}

function checkList(handler: List<ICallHandler>): void {
    if (!isList(handler)) {
        // TODO: check inner items
        throw TypeError(
            'Argument "handlers" should be Types/collection:List of [Types/source:ICallHandler]'
        );
    }
}

const UNSPECIFIED_VERSION = -1;

/**
 * Менеджер обработчиков сообщений на основе цепочки обязанностей
 * @remark
 * Используется в {@link Types/source:SbisService#callHandlers} для обработки содержимого, заголовков запросов.
 * Возможности:
 * <ul>
 *     <li>Генерирует цепочку обязанностей из пользовательских обработчиков сообщений {@link Types/source:ICallHandler}</li>
 *     <li>Отслеживает наличие изменений в списке пользовательских обработчиков сообщений</li>
 *     <li>Управляет кэшем сгенерированных обработчиков сообщений</li>
 * </ul>
 * @public
 */
export class ChainFactory extends mixin<DestroyableMixin>(DestroyableMixin) {
    private _chain: ICallChainItem;
    private _chainVersion: number;

    /**
     * Конструктор менеджера цепочки зависимостей
     * @param handlers список пользовательских обработчиков сообщений
     */
    constructor(handlers?: List<ICallHandler>) {
        super();

        this._chain = this._generateChain(handlers);
    }

    /**
     * Возвращает построенную цепочку обработчиков сообщений
     * @remark
     * Если передан параметр handlers, то выполняется проверка переданного списка и при необходимости цепочка перестраивается.
     * @param handlers список пользовательских обработчиков сообщений
     * @public
     */
    getChain(handlers?: List<ICallHandler>): ICallChainItem {
        if (handlers) {
            this.updateChain(handlers);
        }

        return this._chain;
    }

    /**
     * Пересоздает цепочку обработчиков, если список пользовательских обработчиков поменялся.
     * @param handlers список пользовательских обработчиков сообщений.
     * @returns Признак обновления цепочки обработчиков сообщений
     * @public
     */
    updateChain(handlers: List<ICallHandler>): boolean {
        checkList(handlers);

        if (this.isChanged(handlers)) {
            this._chain = this._generateChain(handlers);
            return true;
        }

        return false;
    }

    /**
     * Генерирует цепочку из обработчиков сообщений
     * @param handlers список пользовательских обработчиков сообщений
     */
    private _generateChain(handlers?: List<ICallHandler>): ICallChainItem {
        let result: ICallChainItem = this._generateChainItem();

        if (!handlers) {
            this._setChainVersion(UNSPECIFIED_VERSION);
            return result;
        }

        handlers.each((handler) => {
            result = this._generateChainItem(handler, result);
        });

        this._setChainVersion(handlers.getVersion());

        return result;
    }

    /**
     * Порождает узел цепочки обработчиков сообщений
     * @remark
     * Если пользовательский обработчик сообщений не задан, то создается пустой корневой узел, который ничего не делает.
     * @param handler пользовательский обработчик сообщений
     */
    private _generateChainItem(handler?: ICallHandler, nextItem?: ICallChainItem): ICallChainItem {
        if (!handler && !nextItem) {
            return new RootCallChainItem();
        }

        return new CallChainItem(handler as ICallHandler, nextItem);
    }

    /**
     * Прогоняет объект с параметрами запроса через построенную цепочку обработчиков сообщений
     * @param request объект с параметрами запроса
     */
    processRequest(request: RPCRequestParam): RPCRequestParam {
        return this._chain.processRequest(request);
    }

    // TODO: process response object

    /**
     * Возвращает признак того, что список обработчиков поменялся с момента генерации цепочки обработчиков сообщений
     * @remark
     * Сравнивается номер версии переданного списка с номером версии списка, на основе которого сгенерирована цепочка.
     */
    isChanged(handlers: List<ICallHandler>): boolean {
        return handlers.getVersion() !== this.getChainVersion();
    }

    /**
     * Устанавливает версию списка, на основе которой была построена цепочка.
     * @param version версия списка обработчика
     */
    private _setChainVersion(version: number): void {
        if (!version) {
            this._chainVersion = UNSPECIFIED_VERSION;
        }

        this._chainVersion = version;
    }

    /**
     * Возвращает версию пользовательского списка обработчиков, на основе которого построена цепочка обработчиков сообщений
     * @returns Версия списка обработчиков
     */
    getChainVersion(): number {
        return this._chainVersion;
    }

    destroy(): void {
        //@ts-ignore
        this._chain = null;
        //@ts-ignore
        this._chainVersion = null;
        super.destroy();
    }
}
