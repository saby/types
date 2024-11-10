import Base, { IOptions as IBaseOptions } from './Base';
import ICrud, { EntityKey } from './ICrud';
import ICrudPlus from './ICrudPlus';
import IProvider, { IEndpoint } from './IProvider';
import DataMixin from './DataMixin';
import DataCrudMixin from './DataCrudMixin';
import BindingMixin, { IOptions as IBindingOptions } from './BindingMixin';
import EndpointMixin, { IOptions as IEndpointOptions } from './EndpointMixin';
import OptionsMixin, { IOptionsOption as IOptionsMixinOption } from './OptionsMixin';
import Query, { NavigationType } from './Query';
import DataSet from './DataSet';
import jsonize from './jsonize';
import { IAbstract } from './provider';
import {
    adapter,
    Record as TypesRecord,
    Model,
    ObservableMixin,
    IObservableMixinOptions,
    ISerializableSignature,
    getMergeableProperty,
    SerializableMixin,
    ISerializableState as IDefaultSerializableState,
} from '../entity';
import { RecordSet } from '../collection';
import { create } from '../di';
import { mixin, logger } from '../util';
import { EntityMarker, IHashMap } from 'Types/declarations';
import { ICallChainItem } from './chainFactory/CallChainItem';
import { ChainFactory } from './chainFactory/CallChainFactory';
import { ICallHandler } from './callHandler/ICallHandler';
import { List } from 'Types/collection';
import { loadSync } from 'WasabyLoader/ModulesLoader';

/**
 * @public
 */
export interface IExtendedPromise<T> extends Promise<T> {
    /**
     *
     * @param callback
     */
    addCallback: (callback: Function) => IExtendedPromise<T>;
    /**
     *
     * @param callback
     */
    addErrback: (callback: Function) => IExtendedPromise<T>;
    /**
     *
     * @param callback
     * @param errback
     */
    addCallbacks: (callback: Function, errback: Function) => IExtendedPromise<T>;
}

// @ts-ignore
const DeferredCanceledError = globalThis.DeferredCanceledError;

/**
 * Параметры кэширования запроса
 * @remark
 * Подробнее о кэшировании запросов на клиенте читайте {@link /doc/platform/developmentapl/interface-development/pattern-and-practice/client-cache/ в статье}
 * @public
 */
export interface ICacheParameters {
    /**
     *
     */
    maxAge: number;
    /**
     *
     */
    mustRevalidate?: number;
    /**
     *
     */
    ignoredParams?: string[];
}

/**
 * @public
 */
export enum NavigationTypes {
    /**
     *
     */
    PAGE = NavigationType.Page,
    /**
     *
     */
    OFFSET = NavigationType.Offset,
    /**
     *
     */
    POSITION = NavigationType.Position,
}

/**
 * @public
 */
export interface IPassing {
    /**
     * Метод подготовки аргументов при вызове {@link create}.
     */
    create?: (meta?: IHashMap<unknown>) => any;
    /**
     * Метод подготовки аргументов при вызове {@link read}.
     */
    read?: (key: EntityKey, meta?: IHashMap<unknown>) => any;
    /**
     * Метод подготовки аргументов при вызове {@link update}.
     */
    update?: (data: TypesRecord | RecordSet, meta?: IHashMap<unknown>) => any;
    /**
     * Метод подготовки аргументов при вызове {@link destroy}.
     */
    destroy?: (keys: EntityKey | EntityKey[], meta?: IHashMap<unknown>) => any;
    /**
     * Метод подготовки аргументов при вызове {@link query}.
     */
    query?: (query?: Query) => any;
    /**
     * Метод подготовки аргументов при вызове {@link copy}.
     */
    copy?: (key: EntityKey, meta?: IHashMap<unknown>) => any;
    /**
     * Метод подготовки аргументов при вызове {@link merge}.
     */
    merge?: (from: EntityKey, to: EntityKey | EntityKey[]) => any;
    /**
     * Метод подготовки аргументов при вызове {@link move}.
     */
    move?: (from: EntityKey | EntityKey[], to: EntityKey, meta?: object) => any;
}

/**
 * Интерфейс дополнительных настроек удаленного источника данных.
 * @public
 */
export interface IOptionsOption extends IOptionsMixinOption {
    /**
     * При сохранении отправлять только измененные записи (если обновляется набор записей) или только измененные поля записи (если обновляется одна запись).
     * @remark
     * Задавать опцию имеет смысл только если указано значение опции {@link Types/_source/Remote#keyProperty}, позволяющая отличить новые записи от уже существующих.
     */
    updateOnlyChanged?: boolean;
    /**
     * Тип навигации, используемой в методе {@link query}.
     * @deprecated Вместо опции на источнике задайте мета-данные на методе {@link Types/_source/Query#meta query}
     */
    navigationType?: NavigationTypes;
}

/**
 * @public
 */
export interface IOptions
    extends IBaseOptions,
        IObservableMixinOptions,
        IBindingOptions,
        IEndpointOptions {
    /**
     *
     */
    options?: IOptionsOption;
    /**
     *
     */
    passing?: IPassing;
    /**
     *
     */
    provider?: IAbstract | string;
    /**
     *
     */
    callHandlers?: List<ICallHandler>;
    /**
     *
     */
    callbacks?: IRemoteCallback;
}

interface ISerializableState extends IDefaultSerializableState {
    _beforeProviderCallCallback: string;
}

/**
 * Объект, содержащий функции обратного вызова для источника.
 * @remark
 * Функция обратного вызова задается в виде имени модуля в библиотечном (Foo/bar:baz) синтаксисе
 * @private
 */
export interface IRemoteCallback {
    /**
     * Имя модуля функции, вызываемой перед вызовом метода удаленного сервиса через провайдер
     */
    beforeProviderCall: string;
}

/**
 * @public
 */
export interface IProviderOptions {
    /**
     *
     */
    endpoint?: IEndpoint;
    /**
     *
     */
    options?: IOptionsOption;
}

declare const wsErrorMonitor: {
    onError(event: unknown): void;
};

function isNull(value: any): boolean {
    return value === null || value === undefined;
}

function isEmpty(value: any): boolean {
    return value === '' || isNull(value);
}

/**
 * Формирует данные, передаваемые в провайдер при вызове create().
 * @param meta Дополнительные мета данные, которые могут понадобиться для создания записи
 */
function passCreate(meta?: IHashMap<unknown>): any {
    return {
        meta,
    };
}

/**
 * Формирует данные, передаваемые в провайдер при вызове read().
 * @param key Первичный ключ записи
 * @param meta Дополнительные мета данные
 */
function passRead(key: EntityKey, meta?: IHashMap<unknown>): any {
    return {
        key,
        meta,
    };
}

/**
 * Формирует данные, передаваемые в провайдер при вызове update().
 * @param data Обновляемая запись или рекордсет
 * @param meta Дополнительные мета данные
 */
function passUpdate(this: Remote, data: TypesRecord | RecordSet, meta?: IHashMap<unknown>): any {
    if (this._$options.updateOnlyChanged) {
        const keyProperty = this._getValidKeyProperty(data);
        if (!isEmpty(keyProperty)) {
            if (
                DataMixin.isModelInstance(data) &&
                !isNull((data as TypesRecord).get(keyProperty))
            ) {
                // Filter record fields
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const Record = require('Types/entity').Record;
                const changed = (data as TypesRecord).getChanged();
                changed.unshift(keyProperty);
                data = Record.filterFields(data, changed);
            } else if (DataMixin.isRecordSetInstance(data)) {
                // Filter recordset fields
                data = ((source) => {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    const RecordSet = require('Types/collection').RecordSet;
                    const result = new RecordSet({
                        adapter: source.getAdapter(),
                        keyProperty: (source as RecordSet).getKeyProperty(),
                    });

                    source.each((record) => {
                        if (isNull(record.get(keyProperty)) || record.isChanged()) {
                            result.add(record);
                        }
                    });

                    return result;
                })(data);
            }
        }
    }

    return {
        data,
        meta,
    };
}

/**
 * Формирует данные, передаваемые в провайдер при вызове destroy().
 * @param keys Первичный ключ, или массив первичных ключей записи
 * @param meta Дополнительные мета данные
 */
function passDestroy(keys: EntityKey | EntityKey[], meta?: IHashMap<unknown> | TypesRecord): any {
    return {
        keys,
        meta,
    };
}

/**
 * Формирует данные, передаваемые в провайдер при вызове query().
 * @param query Запрос
 */
function passQuery(query?: Query): any {
    return query instanceof Query
        ? {
              select: query.getSelect(),
              from: query.getFrom(),
              where: query.getWhere(),
              orderBy: query.getOrderBy(),
              offset: query.getOffset(),
              limit: query.getLimit(),
          }
        : query;
}

/**
 * Формирует данные, передаваемые в провайдер при вызове copy().
 * @param key Первичный ключ записи
 * @param meta Дополнительные мета данные
 */
function passCopy(key: EntityKey, meta?: IHashMap<unknown>): any {
    return {
        key,
        meta,
    };
}

/**
 * Формирует данные, передаваемые в провайдер при вызове merge().
 * @param from Первичный ключ записи-источника (при успешном объединении запись будет удалена)
 * @param to Первичный ключ записи-приёмника
 */
function passMerge(from: EntityKey, to: EntityKey | EntityKey[]): any {
    return {
        from,
        to,
    };
}

/**
 * Формирует данные, передаваемые в провайдер при вызове move().
 * @param from Перемещаемая запись.
 * @param to Идентификатор целевой записи, относительно которой позиционируются перемещаемые.
 * @param meta Дополнительные мета данные.
 */
function passMove(from: EntityKey | EntityKey[], to: EntityKey, meta?: object): any {
    return {
        from,
        to,
        meta,
    };
}

/**
 * Источник данных, работающий удаленно.
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @public
 */
export default abstract class Remote
    extends mixin<Base, ObservableMixin, DataCrudMixin, BindingMixin, EndpointMixin>(
        Base,
        ObservableMixin,
        DataCrudMixin,
        BindingMixin,
        EndpointMixin
    )
    implements ICrud, ICrudPlus, IProvider
{
    // endregion

    // region Statics

    /**
     * Типы поддерживаемой навигации.
     */
    static get NAVIGATION_TYPE(): typeof NavigationTypes {
        return NavigationTypes;
    }

    /**
     * Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
     * @see {@link getProvider}
     * @see {@link Types/di}
     * @example
     * <pre>
     *     import {Remote} from 'Types/source';
     *
     *     const dataSource = new Remote({
     *         endpoint: '/users/'
     *         provider: new AjaxProvider()
     *     });
     * </pre>
     */
    protected _$provider: IAbstract | string;

    /**
     * Методы подготовки аргументов по CRUD контракту.
     * @example
     * Подключаем пользователей через HTTP API, для метода create() передадим данные как объект с полем 'data':
     * <pre>
     *     const dataSource = new HttpSource({
     *         endpoint: '//some.server/users/',
     *         passing: {
     *             create(meta) {
     *                 return {
     *                     data: meta
     *                 }
     *             }
     *         }
     *     });
     * </pre>
     */
    protected _$passing: Required<IPassing>;

    protected _$options: IOptionsOption;

    // region call handlers

    /**
     * Список обработчиков сообщений.
     * @remark Обработчики сообщений позволяют модифицировать параметры запроса на уровне {@link Browser/Transport:RPCJSON транспорта}.
     * @example
     * Создадим свой обработчик сообщений, отправляющий запрос на служебный пул, и передадим его в источник:
     * <pre>
     *     import { RPCRequestParam, ICallHandler } from 'Types/source';
     *     // объявляем обработчик сообщений
     *     class ServicePoolCallHandler implements ICallHandler {
     *         handle(request: RPCRequestParam): RPCRequestParam {
     *             request.url = request.url + '?srv=1';
     *             return request;
     *         }
     *     }
     *
     *     // создаём источник, работают с обработчиком сообщений
     *     const dataSource = new SbisService({
     *         endpoint: 'Users',
     *         callHandlers:
     *             new List<ICallHandler>({
     *                 items: [
     *                     new ServicePoolCallHandler()
     *                 ]
     *             })
     *     });
     * </pre>
     * Воспользуемся готовым обработчиком сообщений, отправляющим запрос на служебный пул, и передадим его в источник:
     * <pre>
     *     import { SbisService, ServicePoolCallHandler } from 'Types/source';
     *
     *     const dataSource = new SbisService({
     *         endpoint: 'Users',
     *         callHandlers:
     *             new List<ICallHandler>({
     *                 items: [
     *                     new ServicePoolCallHandler()
     *                 ]
     *             })
     *     });
     * </pre>
     * Создадим свой обработчик сообщений, выставляющий таймаут запроса в 2 мин на уровне транспорта:
     * <pre>
     *     import { RPCRequestParam, ICallHandler } from 'Types/source';
     *     // объявляем обработчик сообщений
     *     class TimeoutCallHandler implements ICallHandler {
     *         private _timeout: number;
     *
     *         constructor(timeout: number) {
     *             this._timeout = timeout;
     *         }
     *
     *         handle(request: RPCRequestParam): RPCRequestParam {
     *             request.timeout = this._timeout;
     *             return request;
     *         }
     *     }
     *
     *     // создаём источник, работают с обработчиком сообщений
     *     const dataSource = new SbisService({
     *         endpoint: 'Users',
     *         callHandlers:
     *             new List<ICallHandler>({
     *                 items: [
     *                     new TimeoutCallHandler(120000)
     *                 ]
     *             })
     *     });
     * </pre>
     * Воспользуемся готовым обработчиком сообщений, выставляющим таймаут запроса в 2 мин на уровне транспорта:
     * <b>Обратите внимание:</b> транспорт выставляет таймаут в заголовке X-Timeout, который влияет только на время нахождения запроса в очереди на сервисе-исполнителе.
     * Фактическое <b>время ответа может быть больше установленного таймаута</b> с учетом поправки на передачу запроса и получение ответа.
     * <pre>
     *     import {SbisService, TimeoutCallHandler} from 'Types/source';
     *
     *     const dataSource = new SbisService({
     *         endpoint: 'Users',
     *         callHandlers:
     *             new List<ICallHandler>({
     *                 items: [
     *                     new TimeoutCallHandler(120000)
     *                 ]
     *             })
     *     });
     * </pre>
     * Пример работы с несколькими обработчиками сообщений:
     * <pre>
     *     const dataSource = new SbisService({
     *         endpoint: 'Users',
     *         callHandlers:
     *             new List<ICallHandler>({
     *                 items: [
     *                     new ServicePoolCallHandler(),
     *                     new TimeoutCallHandler(120000)
     *                 ]
     *             })
     *     });
     * </pre>
     * @see {@link Types/source:Remote#hasCallHandler}
     */
    protected _$callHandlers: List<ICallHandler>;

    /**
     * Имя модуля, содержащего функцию, вызываемую перед вызовом метода удаленного сервиса через провайдер.
     * @remark
     * Функция обратного вызова задается в виде имени модуля в библиотечном (Foo/bar:baz) синтаксисе.
     * Это позволяет избежать проблем с сериализацией источника, при передаче его из сервиса представления.
     * @example
     * Создаем модуль, содержащий функцию обратного вызова:
     * <pre>
     *     // myAwesomeCallback.ts
     *     export function myAwesomeCallback() {
     *         args.meta.a = 3;
     *         return args;
     *     }
     *
     *     // User library
     *     export {myAwesomeCallback} from 'application/User/myAwesomeCallback;
     *
     *     // создаём источник, работающий с функцией обратного вызова
     *     const dataSource = new SbisService({
     *         endpoint: 'Users',
     *         callbacks: {
     *             beforeProviderCall: 'application/User:myAwesomeCallback'
     *         }
     *     });
     */
    protected _beforeProviderCallCallback: string;

    /**
     * Список обработчиков сообщений
     * @see {@link Types/source:Remote#hasCallHandler}
     */
    callHandlers: List<ICallHandler>;

    /**
     * Экземпляр менеджера цепочки обработчиков сообщений
     */
    protected _chainFactory: ChainFactory;
    // endregion call handlers

    /**
     * Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер
     */
    protected _provider: IAbstract;

    // region ICrud

    readonly '[Types/_source/ICrud]': EntityMarker = true;

    // endregion

    // region ICrudPlus

    readonly '[Types/_source/ICrudPlus]': EntityMarker = true;

    // endregion

    // region IProvider

    readonly '[Types/_source/IProvider]': EntityMarker = true;

    /**
     *
     * @param options
     * @protected
     */
    protected constructor(options?: IOptions) {
        super(EndpointMixin._validateOptions(options));

        // Весь код из конструктора необходимо писать в отдельной функции, чтобы была возможность вызвать данный код вне конструктора.
        // Причина: отваливается старое наследование через Core-extend. В es 2021 нельзя вызывать конструктор класса,
        // описанный через нативную конструкцию class, через call и apply. Core-extend именно это и делает для родительского конструктора.
        // Специально для Core-extend реализована статичная функция es5Constructor, которая будет вызываться вместо встроенного конструктора.
        this.initRemote(options);
    }

    protected initRemote(options?: IOptions) {
        ObservableMixin.initMixin(this, options);
        if (this._$callHandlers) {
            this.callHandlers = this._$callHandlers;
        }
        if (!this.callHandlers) {
            this.callHandlers = new List<ICallHandler>();
        }
        if (!!options?.callbacks?.beforeProviderCall) {
            this._beforeProviderCallCallback = options.callbacks.beforeProviderCall;
        }
        this._publish('onBeforeProviderCall');
    }

    /**
     *
     * @param meta
     */
    create<TData = Model>(meta?: IHashMap<unknown>): Promise<TData> {
        if (!this._$binding.create) {
            throw new Error('Create binding not defined');
        }

        return this._callProvider<TData>(
            this._$binding.create,
            this._$passing.create.call(this, meta),
            this._getHandlerChain()
        ).addCallback((data: TData) => {
            return this._loadAdditionalDependencies().addCallback(() => {
                return this._prepareCreateResult(data);
            });
        });
    }

    /**
     *
     * @param key
     * @param meta
     */
    read<TData = Model>(key: EntityKey, meta?: IHashMap<unknown>): Promise<TData> {
        if (!this._$binding.read) {
            throw new Error('Read binding not defined');
        }

        return this._callProvider<TData>(
            this._$binding.read,
            this._$passing.read.call(this, key, meta),
            this._getHandlerChain()
        ).addCallback((data: TData) => {
            return this._loadAdditionalDependencies().addCallback(() => {
                return this._prepareReadResult(data);
            });
        });
    }

    /**
     *
     * @param data
     * @param meta
     */
    update<TData = void>(data: TypesRecord | RecordSet, meta?: IHashMap<unknown>): Promise<TData> {
        if (!this._$binding.update) {
            throw new Error('Update binding not defined');
        }

        return this._callProvider<TData>(
            this._$binding.update,
            this._$passing.update.call(this, data, meta),
            this._getHandlerChain()
        ).addCallback((key: string[]) => {
            return this._prepareUpdateResult(data, key);
        });
    }

    /**
     *
     * @param keys
     * @param meta
     */
    //@ts-ignore
    destroy<TData = void>(keys: EntityKey | EntityKey[], meta?: IHashMap<unknown>): Promise<TData> {
        if (!this._$binding.destroy) {
            throw new Error('Destroy binding not defined');
        }

        return this._callProvider<TData>(
            this._$binding.destroy,
            this._$passing.destroy.call(this, keys, meta),
            this._getHandlerChain()
        );
    }

    /**
     *
     * @param query
     */
    query(query?: Query): Promise<DataSet> {
        if (!this._$binding.query) {
            throw new Error('Query binding not defined');
        }

        return this._callProvider<DataSet>(
            this._$binding.query,
            this._$passing.query.call(this, query),
            this._getHandlerChain()
        ).addCallback((data: DataSet) => {
            return this._loadAdditionalDependencies().addCallback(() => {
                return this._prepareQueryResult(data);
            });
        });
    }

    /**
     *
     * @param target
     * @param merged
     */
    merge(target: EntityKey, merged: EntityKey | EntityKey[]): Promise<void> {
        if (!this._$binding.merge) {
            throw new Error('Merge binding not defined');
        }

        return this._callProvider(
            this._$binding.merge,
            this._$passing.merge.call(this, target, merged),
            this._getHandlerChain()
        );
    }

    /**
     *
     * @param key
     * @param meta
     */
    copy(key: EntityKey, meta?: IHashMap<Record<string, unknown>>): Promise<Model> {
        if (!this._$binding.copy) {
            throw new Error('Copy binding not defined');
        }

        return this._callProvider<Model>(
            this._$binding.copy,
            this._$passing.copy?.call(this, key, meta),
            this._getHandlerChain()
        ).addCallback((data: any) => {
            return this._prepareReadResult(data);
        });
    }

    /**
     *
     * @param items
     * @param target
     * @param meta
     */
    move(
        items: EntityKey | EntityKey[],
        target: EntityKey,
        meta?: IHashMap<Record<string, unknown>>
    ): Promise<void> {
        if (!this._$binding.move) {
            throw new Error('Move binding not defined');
        }

        return this._callProvider(
            this._$binding.move,
            this._$passing.move.call(this, items, target, meta),
            this._getHandlerChain()
        );
    }

    /**
     *
     */
    getProvider(): IAbstract {
        if (!this._provider) {
            this._provider = this._createProvider(this._$provider, {
                endpoint: this._$endpoint,
                options: this._$options,
            });
        }

        return this._provider;
    }

    // endregion

    /**
     * Получить список обработчиков сообщений
     */
    getCallHandlers(): List<ICallHandler> {
        return this.callHandlers;
    }

    /**
     * Возвращает признак наличия обработчика сообщений в списке у источника
     */
    hasCallHandler(target: ICallHandler): boolean {
        let result = false;

        if (!target.moduleName) {
            return false;
        }

        this.getCallHandlers().each((handler) => {
            if (handler.moduleName === target.moduleName) {
                result = true;
            }
        });

        return result;
    }

    // region SerializableMixin

    toJSON(): ISerializableSignature<IOptions>;
    toJSON(key?: unknown): string;
    toJSON(_?: unknown): ISerializableSignature<IOptions> | string {
        return super.toJSON();
    }

    // endregion

    // region Protected methods

    /**
     * Инстанциирует провайдер удаленного доступа
     * @param provider Алиас или инстанс
     * @param options Аргументы конструктора
     * @protected
     */
    protected _createProvider(provider: IAbstract | string, options: IProviderOptions): IAbstract {
        if (!provider) {
            throw new Error('Remote access provider is not defined');
        }
        if (typeof provider === 'string') {
            provider = create<IAbstract>(provider, options);
        }

        return provider;
    }

    /**
     * Вызывает удаленный сервис через провайдер
     * @param name Имя сервиса
     * @param args Аргументы вызова
     * @param cache Параметры кэширования
     * @return Асинхронный результат операции
     * @protected
     */
    protected _callProvider<TResult>(
        name: string,
        args: object,
        callHandlers?: ICallChainItem,
        cache?: ICacheParameters
    ): IExtendedPromise<TResult> {
        const provider = this.getProvider();

        const eventResult = this._notifyBeforeProviderCall(name, args);

        if (eventResult !== undefined) {
            args = eventResult;
        }

        const result = provider.call<TResult>(
            name,
            this._prepareProviderArguments(args),
            cache,
            undefined,
            callHandlers
        );

        if (this._$options.debug) {
            result.catch((error) => {
                if (error instanceof DeferredCanceledError) {
                    logger.info(
                        this._moduleName,
                        `calling of remote service "${name}" has been cancelled.`
                    );
                } else {
                    logger.error(
                        this._moduleName,
                        `remote service "${name}" throws an error "${error.message}".`
                    );
                }
                return error;
            });
        }

        return result as IExtendedPromise<TResult>;
    }

    /**
     * Подготавливает аргументы к передаче в удаленный сервис
     * @param args Аргументы вызова
     * @protected
     */
    protected _prepareProviderArguments(args: object): object {
        return jsonize(args) as object;
    }

    protected _getValidKeyProperty(data: any): string {
        const keyProperty = this.getKeyProperty();
        if (!isEmpty(keyProperty)) {
            return keyProperty;
        }
        if (typeof data.getKeyProperty === 'function') {
            return data.getKeyProperty();
        }
        // Support deprecated method 'getIdProperty()'
        if (typeof data.getIdProperty === 'function') {
            return data.getIdProperty();
        }

        // FIXME: тут стоит выбросить исключение, поскольку в итоге возвращаем пустой keyProperty
        return keyProperty;
    }

    // endregion

    // region call handler chain
    protected _getHandlerChain(): ICallChainItem {
        if (!this._chainFactory) {
            this._chainFactory = new ChainFactory();
        }

        return this._chainFactory.getChain(this.callHandlers);
    }

    protected _notifyBeforeProviderCall(name: string, args: object): object {
        let callbackFunction;
        if (!!this._beforeProviderCallCallback) {
            callbackFunction = this._resolveCallback(this._beforeProviderCallCallback);
        }
        return callbackFunction
            ? callbackFunction(name, args)
            : this._notify('onBeforeProviderCall', name, args);
    }

    protected _resolveCallback(moduleName: string): Function | undefined {
        const callbackFunction = loadSync(moduleName);
        if (!callbackFunction) {
            logger.info(
                `${this._moduleName}::callbacks.beforeProviderCall: resolved empty module ${this._beforeProviderCallCallback}`
            );
            return;
        }
        if (!(typeof callbackFunction === 'function')) {
            logger.info(
                `${this._moduleName}::callbacks.beforeProviderCall: resolved callback should type of function`
            );
            return;
        }
        return callbackFunction;
    }

    // region SerializableMixin

    static fromJSON<T = Remote, K = IOptions>(data: ISerializableSignature<K>): T {
        return Base.fromJSON.call(this, data) as T;
    }

    _getSerializableState(state: IDefaultSerializableState): ISerializableState {
        return {
            ...SerializableMixin.prototype._getSerializableState.call(this, state),
            _beforeProviderCallCallback: this._beforeProviderCallCallback,
        };
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function (this: Remote): void {
            fromSerializableMixin.call(this);
            this._beforeProviderCallCallback = state._beforeProviderCallCallback;
        };
    }
    // endregion

    static es5Constructor(options?: IOptions): void {
        // @ts-ignore
        Base.es5Constructor.call(this, EndpointMixin._validateOptions(options));

        // TypesScript в компиляции вставляет в конструктор присвоение значений по умолчанию для полей.
        // Придётся прописать инцилизацию в ручную в нашем самопальном конструкторе.
        // @ts-ignore
        this['[Types/_source/ICrud]'] = true;
        // @ts-ignore
        this['[Types/_source/ICrudPlus]'] = true;
        // @ts-ignore
        this['[Types/_source/IProvider]'] = true;

        Remote.prototype.initRemote.call(this, options);
    }
}

Object.assign(
    Remote.prototype,
    /** @lends Types/_source/Remote.prototype */ {
        '[Types/_source/Remote]': true,
        _moduleName: 'Types/source:Remote',
        _provider: null,
        _$provider: null,
        _$callHandlers: null,

        _$passing: getMergeableProperty<IPassing>({
            create: passCreate,
            read: passRead,
            update: passUpdate,
            destroy: passDestroy,
            query: passQuery,
            copy: passCopy,
            merge: passMerge,
            move: passMove,
        }),

        _$options: getMergeableProperty<IOptionsOption>(
            OptionsMixin.addOptions<IOptionsOption>(Base, {
                updateOnlyChanged: false,
                navigationType: NavigationTypes.PAGE,
            })
        ),
    }
);

// FIXME: backward compatibility for SbisFile/Source/BL
(Remote.prototype as any)._prepareArgumentsForCall = (
    Remote.prototype as any
)._prepareProviderArguments;

// FIXME: backward compatibility for SBIS3.Plugin/Source/LocalService
(adapter.Abstract.prototype as any).serialize = jsonize;
