/* eslint-disable */
/* tslint:disable:no-var-requires */
/* tslint:disable:ban-types */
/**
 * На СП удаляется нативный промис, и при загрузке Deferred не удается найти промис
 * удалить после внедрения:
 * https://online.sbis.ru/opendoc.html?guid=896c4e6a-d4b9-49ad-b8bb-e11deb828871
 */
import 'optional!SbisUI/polyfill';
import { TCallback, TErrBack } from './DeferredAddons';
import { constants, IoC, coreDebug as cDebug } from 'Env/Env';
import { DeferredCanceledError } from './DeferredCanceledError';

const STATE = {
    WAITING: -1,
    SUCCESS: 0,
    FAILED: 1,
    CANCELED: 2,
};

const CHAIN_INDICES = [STATE.SUCCESS, STATE.FAILED, STATE.FAILED];

const STATE_NAMES = {};
STATE_NAMES[STATE.WAITING] = 'waiting';
STATE_NAMES[STATE.SUCCESS] = 'success';
STATE_NAMES[STATE.FAILED] = 'failed';
STATE_NAMES[STATE.CANCELED] = 'canceled';

const SKIP_CALLBACK_LOG =
    typeof Symbol === 'undefined'
        ? '$skipCallbackLog$'
        : Symbol('skipCallbackLog');

// tslint:disable-next-line
const global = (function (): any {
    // tslint:disable-next-line:ban-comma-operator
    return this || (0, eval)('this');
})();

global.DeferredCanceledError = DeferredCanceledError;

interface ILogger {
    log(tag: string, message?: string): void;

    error(tag: string, message?: string, err?: Error): void;
}

interface IOptions<T> {
    parentPromise?: Promise<T>;
    cancelCallback?: Function;
    logger?: ILogger;
    loggerAwait?: Function;
    silent?: boolean;
}

interface IExtPromise<T> extends Promise<T> {
    abort(): void;
}

interface INearestResult<T> {
    from: number;
    data: T;
}

/**
 * Returns current request's universally unique identifier
 */
function getRequestUUID(): string {
    const req = global.process?.domain?.req;
    return req && req.get ? req.get('X-RequestUUID') : null;
}

/**
 * Checks that Deferred instance was created in current request
 */
function checkThreadMatch(reqUUID: string, logger: ILogger): void {
    if (!reqUUID) {
        return;
    }

    const currentReqUUID = getRequestUUID();
    if (reqUUID === currentReqUUID) {
        return;
    }

    const err = new Error(
        `Deferred was created in "${reqUUID}" but interaction caused in "${currentReqUUID}".`
    );
    logger.error(
        'Deferred',
        'Trying to interact with Deferred instance created in another thread.',
        err
    );
}

function isCanceled<T>(dfr: Deferred<T>): boolean {
    return (dfr as any)._fired === STATE.CANCELED;
}

function isCancelValue(res: unknown): boolean {
    return res instanceof DeferredCanceledError;
}

function isErrorValue(res: unknown): res is Error {
    return res instanceof Error;
}

/**
 * Проверка принадлежности instance к типу DeferredLike
 */
function isDeferredLikeValue<T>(instance: unknown): instance is Deferred<T> {
    return Boolean(
        instance &&
            (instance as Deferred<T>).addCallback &&
            (instance as Deferred<T>).addErrback
    );
}

function resultToFired(res: unknown): number {
    return isCancelValue(res)
        ? STATE.CANCELED
        : isErrorValue(res)
        ? STATE.FAILED
        : STATE.SUCCESS;
}

/**
 * Реализация класса Deferred <br />
 * Абстрактное асинхронное событие, может либо произойти, может сгенерировать ошибку.
 * Подробное описание находится {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/architecture/deferred/ здесь}.
 * Частично приведено ниже:<br />
 * Deferred - объект, используемый для работы с асинхронными отложенными вычислениями.<br />
 * Ближайшим стандартным аналогом является {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise}.
 * К сожалению Deferred в WS не полностью соответствует стандартизованному Promise и не рекомендуются к использованию.
 * Имеются важные фундаментальные отличия.<br />
 * Любой Deferred может иметь три состояния:
 * <ol>
 *    <li>Не определено (в этом состоянии создается изначально любой Deferred).</li>
 *    <li>Завершён успешно.</li>
 *    <li>Завершён ошибкой.</li>
 * </ol>
 * Для перевода Deferred в одно из состояний используются методы:
 * <ul>
 *    <li>.callback(res) - для перевода в состояние "Завершён успешно";</li>
 *    <li>.errback(err) - для перевода в состояние "Завершён с ошибкой";</li>
 * </ul>
 * <b>ВАЖНО!</b> Если при вызове .callback() передать в качестве аргумента объект Error, то это будет равносильно вызову
 * .errback() с тем же аргументом.
 * <b>ВАЖНО!</b> Нельзя использовать методы .callback() и .errback() несколько раз на одном и том же Deferred.
 * При попытке вызвать данные методы повторно будет выброшено исключение. Как правило, повторный вызов свидетельствует
 * об ошибке в коде приложения.<br />
 * Для получения результата используются методы:
 * <ul>
 *    <li>.addCallback(f) - для получения успешного результата;</li>
 *    <li>.addErrback(f) - для получения ошибочного результата;</li>
 *    <li>.addCallbacks(f1, f2) - для получения в первую функцию успешного результата, а во вторую - ошибки;</li>
 *    <li>.addBoth(f) - для подписки на любой результат одной функицией.</li>
 * </ul>
 * Вызов .addBoth(f) эквивалентен .addCallbacks(f, f).
 * Вызов .addCallback(f) эквивалентен .addCallbacks(f, null).
 * Вызов .addErrback(f) эквивалентен .addCallbacks(null, f).<br />
 * Все вышеописанные методы возвращают тот же Deferred, на котором они были вызваны.<br />
 * Deferred позволяет "мутировать" результат в функциях-обработчиках. То, что вернёт функция обработчик, будет передано
 * на вход следующему подписчику.
 * <br />
 * Пример первый:
 * <pre>
 *    var def = new Deferred();
 *    def.callback(10);
 *    def.addCallback(function(res) {
 *       console.log(res);  // 10
 *       return 20;
 *    });
 *    def.addCallback(function(res) {
 *       console.log(res); // 20
 *    });
 * </pre>
 * Обратие внимание: несмотря на то, что обработчики добавлены после перевода Deferred в состояние "Завершён успешно",
 * они все равно выполняются. Deferred сохраняет свой последний результат и передаёт его всем вновь добавленным
 * подписчикам.<br />
 * <b>ВАЖНО!</b>
 * Обратите внимание на последний добавленный колбэк в примере выше. В нём нет return. Что равнозначно return undefined.
 * Это приводит к следующему побочному эффекту:
 * <br />
 * <pre>
 *     // продолжение первого примера...
 *     def.addCallback(function(res) {
 *        console.log(res); // undefined
 *     });
 * </pre>
 * Мутация значения возможна также в том случае, если обработчик выбросит исключение.
 * <br />
 * Пример второй:
 * <pre>
 *    var def = new Deferred();
 *    def.addCallback(function(res) {
 *       throw new Error(123);
 *    });
 *    def.addCallback(function(res) {
 *    // никогда не выполнится
 *    });
 *    def.addErrback(function(err) {
 *       console.log(err); // Error 123
 *    });
 *    def.callback();
 * </pre>
 * Deferred был переведён в состояние "Успешное завершение", но первая функция-обработчик сгенерировала исключение
 * (конечно же оно могло быть сгенерировано не только конструкцией new Error, но и любой некорректной JS-операцией) и
 * Deferred переключился в состояние "Ошибка". По этой причине следующий добавленный обработчик на успешное завершение
 * выполнен не был, а вот обработчик на ошибку уже выполнился и отобразил в консоли текст ошибки.<br />
 * Для переключения Deferred в состояние "ошибка" не обязательно "выбрасывать" исключение. Достаточно просто вернуть из
 * обработчика объект Error. Разница лишь в том, что "выброшенное" исключение будет залогировано в консоли,
 * а возвращенный объект - нет.<br />
 * Верно и обратное. Если в функции-обработчике ошибки вернуть не ошибочное значение, Deferred изменит свое состояние в
 * "завершён успешно". Данный паттерн удобно использовать, например, в следующем случае. Пусть нам надо вызвать метод
 * бизнес-логики и вернуть результат. Но в случае ошибки не нужно пробрасывать её дальше, нужно заменить ошибку
 * некоторым объектом-заглушкой.
 * <br />
 * Пример третий:
 * <pre>
 *     function fetchData(args) {
 *        var stub = {
 *           some: 'stub',
 *           data: true
 *        };
 *        return loadDataSomehow(args).addErrback(function(err) {
 *           return stub;
 *        });
 *     }
 * </pre>
 * Данный пример демонстрирует ещё один правильный паттерн использования Deferred. Если у вас есть некая функция,
 * которая возвращает асинхронный результат в виде Deferred, и вам нужно его как-то модифицировать - не надо создавать
 * новый Deferred и проводить операции с ним, нужно мутировать результат, возвращаемый исходной асинхронной функцией.
 * <br />
 * Пример четвёртый:
 * <pre>
 *    function fetchData(args) {
 *       var stub = {
 *          some: 'stub',
 *          data: true
 *       };
 *       return loadDataSomehow(args).addCallback(function(res) {
 *          return processData(res);
 *       });
 *    }
 * </pre>
 * При данном способе реализации исходная ошибка будет передана далее вызывающей стороне.
 * <br />
 * Одной важной возможностью Deferred является создание цепочек. Например, ваша функция должна вызвать два метода БЛ
 * один за другим. Причём для вызова второго требуется результат первого. Это очень легко сделать.
 * <br />
 * Пример пятый:
 * <pre>
 *    function fetchData(args) {
 *       return doFirstCall(args).addCallback(function(firstResponse) {
 *          return doSecondCall(firstResponse);
 *       });
 *    }
 * </pre>
 * Если из функции обработчика (любого, не важно успеха или ошибки) вернуть Deferred, то следующий обработчик:
 * <ul>
 *   <li>будет ждать результата асинхронной операции, которую "описывает" возвращенный Deferred;</li>
 *   <li>получит состояние, которое вернёт возвращенный Deferred;</li>
 * </ul>
 * <b>ВАЖНО!</b> Deferred, который вернули из обработчика (т.е. который стал частью цепочки) нельзя более
 * использовать для добавления обработчиков. Попытка добавить обработчик как на успешное завершение, так и
 * на ошибку приведёт к выбросу исключения. Проверить заблокировано ли добавление обработчиков можно с
 * помощью метода .isCallbacksLocked(). Если всё же требуется подписаться на результат Deferred, отдаваемый
 * в цепочку, воспользуйтесь следующим паттерном.
 * <br />
 * Пример шестой:
 * <pre>
 *    someDef.addCallback(function(res) {
 *       var def2 = getDeferredSomehow();
 *       var dependent = def2.createDependent();
 *       dependent.addCallback(someHandler);
 *       return def2;
 *    });
 * </pre>
 * Функция .createDependent() позволяет создать новый Deferred, результат которого будет зависеть от данного.<br />
 * Есть и "обратная" функция. def.dependOn(someDef) - позволяет сделать уже существующий Deferred зависимым от данного.
 * @class Types/Deferred
 * @deprecated Используйте {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise}.
 * @public
 */
export default class Deferred<T> extends Promise<T> {
    // "Extends" Deferred from Promise due to pass check via "instanceof Promise" for Deferred instances

    protected _reqUUID: string;
    protected _chained: boolean;
    protected _chain: Function[][];
    protected _fired: number;
    protected _paused: number;
    protected _results: [T, Error];
    protected _running: boolean;
    protected _parentPromise: IExtPromise<T>;
    protected _cancelCallback: Function;
    protected _hasErrback: boolean;
    protected _loggerAwait: Function;
    protected _logger: ILogger;

    protected get logger(): ILogger {
        return this._logger || IoC.resolve('ILogger');
    }

    /**
     * @param {Object} [options] Опции конструктора
     * @param {Object} [options.cancelCallback] Каллбэк, вызывающийся при отмене Deferred.
     * @example
     * <pre>
     *    var dfr;
     *    var timeoutId = setTimeout(function() {
     *      console.log('TIMEOUT');
     *      doSomething();
     *      dfr.callback();
     *    }, 1000);
     *    dfr = new Deferred({
     *      cancelCallback: function() {
     *         clearTimeout(timeoutId);
     *      }
     *    });
     *    dfr.cancel();//таймаут timeoutId отменится, его обработчик не выполнится (console.log, doSomething, и т.п.)
     * </pre>
     */
    // @ts-ignore
    constructor(options?: IOptions<T>) {
        // @ts-ignore
        const self = this;

        if (options) {
            if (options.cancelCallback) {
                self._cancelCallback = options.cancelCallback;
            }
            if (options.parentPromise) {
                self._parentPromise = options.parentPromise as IExtPromise<T>;
            }
        }

        self._reqUUID = getRequestUUID();
        self._chained = false;
        self._chain = [];
        self._fired = STATE.WAITING;
        self._paused = 0;
        self._results = [null, null];
        self._running = false;
        self._hasErrback = false;
        self._logger = options && options.logger;
        self._loggerAwait = (options && options.loggerAwait) || setTimeout;
    }

    /**
     * Отменяет Deferred. Отмена работает только тогда, когда он находится в состоянии ожидания (когда на нём ещё не
     * были вызваны методы callback/errback/cancel), иначе метод cancel не делает ничего.
     * Если в конструкторе в опции cancelCallback ему была передана функция отмены, то при первом вызове метода cancel
     * она вызовется (только если Deferred ещё не сработал и не отменён).
     */
    cancel(): this {
        checkThreadMatch(this._reqUUID, this.logger);

        if (this._fired === STATE.WAITING) {
            // Состояние CANCELED нужно выставить в самом начале, чтобы вызов методов callback/errback,
            // возможный из cancelCallback, срабатывал бы вхолостую, и не мешал бы выполняться обработчикам, вызванным
            // из _fire отмены
            this._fired = STATE.CANCELED;
            this._results[CHAIN_INDICES[this._fired]] =
                new DeferredCanceledError('Cancel');

            /** Если Deferred получен от Promise, вызываем abort у Promise;
             *  https://online.sbis.ru/opendoc.html?guid=b7d3305f-6805-46e8-8502-8e9ed46639bf
             */
            if (this._parentPromise && this._parentPromise.abort) {
                this._parentPromise.abort();
            }

            if (this._cancelCallback) {
                const cbk = this._cancelCallback;
                this._cancelCallback = null;
                try {
                    cbk();
                } catch (err) {
                    this.logger.error(
                        'Deferred',
                        `Cancel function throwing an error: ${err.message}`,
                        err
                    );
                }
            }

            this._fire();
        }
        return this;
    }

    /**
     * Запускает на выполнение цепочку коллбэков.
     * Метод должен вызываться только на несработавшем или отменённом объекте, иначе он выдаст ошибку.
     * На отменённом объекте (после вызова метода cancel) callback/errback можно вызывать сколько угодно -
     * ошибки не будет, метод отработает вхолостую.
     * @param [res] результат асинхронной операции, передаваемой в коллбэк.
     */
    callback(res?: T): this {
        checkThreadMatch(this._reqUUID, this.logger);

        if (!isCanceled(this)) {
            this._resback(this._check(res) as T);
        }
        return this;
    }

    /**
     * Запуск цепочки обработки err-бэков.
     * Метод должен вызываться только на несработавшем или отменённом объекте, иначе он выдаст ошибку.
     * На отменённом объекте (после вызова метода cancel) callback/errback можно вызывать сколько угодно -
     * ошибки не будет, метод отработает вхолостую.
     * @param [res] результат асинхронной операции.
     */
    errback(res?: T | Error | string | number): this {
        checkThreadMatch(this._reqUUID, this.logger);

        if (!isCanceled(this)) {
            this._resback(this._check(res as T, true) as T);
        }
        return this;
    }

    /**
     * Добавляет один коллбэк как на ошибку, так и на успех
     * @param fn общий коллбэк.
     */
    addBoth<TResult1 = T, TResult2 = never>(
        fn: TCallback<T, TResult1> | TErrBack<T, TResult1>
    ): Deferred<TResult1 | TResult2> {
        if (arguments.length !== 1) {
            throw new Error('No extra args supported');
        }
        return this.addCallbacks(
            fn as TCallback<T, TResult1>,
            fn as TErrBack<T, TResult1>
        );
    }

    /**
     * Добавляет колбэк на успех
     * @param fn коллбэк на успех.
     */
    addCallback<TResult1 = T, TResult2 = never>(
        fn: TCallback<T, TResult1>
    ): Deferred<TResult1 | TResult2> {
        if (arguments.length !== 1) {
            throw new Error('No extra args supported');
        }
        return this.addCallbacks(fn, null);
    }

    /**
     * Добавляет колбэк на ошибку
     * @param fn коллбэк на ошибку.
     */
    addErrback<TResult1 = T, TResult2 = never>(
        fn: TErrBack<T, TResult1>
    ): Deferred<TResult1 | TResult2> {
        if (arguments.length !== 1) {
            throw new Error('No extra args supported');
        }
        return this.addCallbacks(null, fn);
    }

    /**
     * Добавляет два коллбэка, один на успешный результат, другой на ошибку
     * @param cb коллбэк на успешный результат.
     * @param eb коллбэк на ошибку.
     */
    addCallbacks<TResult1 = T, TResult2 = never>(
        cb: TCallback<T, TResult1>,
        eb: TErrBack<T, TResult1>
    ): Deferred<TResult1 | TResult2> {
        checkThreadMatch(this._reqUUID, this.logger);

        if (this._chained) {
            throw new Error('Chained Deferreds can not be re-used');
        }

        if (
            (cb !== null && typeof cb !== 'function') ||
            (eb !== null && typeof eb !== 'function')
        ) {
            throw new Error('Both arguments required in addCallbacks');
        }

        if (eb) {
            this._hasErrback = true;
        }

        const fired = this._fired;
        const waiting =
            fired === STATE.WAITING || this._running || this._paused > 0;

        if (
            waiting ||
            (cb && fired === STATE.SUCCESS) ||
            (eb && (fired === STATE.FAILED || fired === STATE.CANCELED))
        ) {
            this._chain.push([cb, eb]);

            if (!waiting) {
                // не запускаем выполнение цепочки при добавлении нового элемента, если цепочка уже выполняется
                this._fire();
            }
        }

        return this as unknown as Deferred<TResult1 | TResult2>;
    }

    /**
     * Объявляет данный текущий Deferred зависимым от другого.
     * Колбэк/Еррбэк текущего Deferred будет вызван при соотвествтующем событии в "мастер"-Deferred.
     * @param master Deferred, от которого будет зависеть данный.
     */
    dependOn(master: Deferred<T>): this {
        checkThreadMatch(this._reqUUID, this.logger);

        master.addCallbacks(
            (v) => {
                this.callback(v);
                return v;
            },
            (e) => {
                this.errback(e);
                return e;
            }
        );

        return this;
    }

    /**
     * Создаёт новый Deferred, зависимый от этого.
     * Колбэк/Еррбэк этого Deferred-а будут вызваны при соотвествтующем событии исходного.
     */
    createDependent(): Deferred<T> {
        checkThreadMatch(this._reqUUID, this.logger);

        const dependent = new Deferred<T>();
        return dependent.dependOn(this);
    }

    /**
     * Проверяет возможность вызова методов callback/errback
     * @param [withChain=false] Проверять, отработала ли цепочка обработчиков.
     * @returns Готов или нет этот экземпляр (стрельнул с каким-то результатом)
     */
    isReady(withChain?: boolean): boolean {
        // Признак _paused тут учитывать не надо, потому что isReady говорит именно о наличии результата этого
        // Deferred-а (и возможности или невозможности вызывать методы callback/errback),
        // а не о состоянии цепочки его обработчиков.
        return (
            this._fired !== STATE.WAITING && (withChain ? !this._paused : true)
        );
    }

    /**
     * Показывает, не запрещено ли пользоваться методами, добавляющими обработчики:
     * addCallbacks/addCallback/addErrback/addBoth.
     * Не влияет на возможность вызова методов callback/errback.
     * @return true - добавлять обработчики запрещено, false - добавлять обработчики можно.
     */
    isCallbacksLocked(): boolean {
        checkThreadMatch(this._reqUUID, this.logger);

        return this._chained;
    }

    /**
     * Проверяет, завершился ли данный экземпляр успехом
     * @returns Завершился ли данный экземпляр успехом
     */
    isSuccessful(): boolean {
        checkThreadMatch(this._reqUUID, this.logger);

        return this._fired === STATE.SUCCESS;
    }

    /**
     * Возвращает текущее значение Deferred.
     * @returns Текущее значение Deferred
     * @throws {Error} Когда значения еще нет.
     */
    getResult(): T | Error {
        checkThreadMatch(this._reqUUID, this.logger);

        if (this.isReady()) {
            return this._results[CHAIN_INDICES[this._fired]];
        }
        throw new Error(
            'No result at this moment. Deferred is still not ready'
        );
    }

    // region Promise

    /**
     * Добавляет один коллбэк как на ошибку, так и на успех
     * @param onFinally функция-обработчик
     */
    finally(onFinally?: () => void): Promise<T> {
        let callback: (res: unknown) => unknown;
        let errback: (err: unknown) => unknown;

        // finally не поддерживается Node < 10
        const promise = new Promise<T>((resolve, reject) => {
            callback = resolve;
            errback = reject;
        }).then(
            (res) => {
                onFinally();
                return res;
            },
            (err) => {
                onFinally();
                throw err;
            }
        ) as unknown as Promise<T>;

        this.addCallbacks(
            (res) => {
                callback(res);
                return res;
            },
            (err) => {
                errback(err);
                return err;
            }
        );

        return promise;
    }

    /**
     * Добавляет обработчики на успех и на ошибку
     * @param onFulfilled функция-обработчик на успех
     * @param [onRejected] функция-обработчик на ошибку
     */
    then<TResult1 = T, TResult2 = never>(
        onFulfilled?:
            | ((value: T) => TResult1 | PromiseLike<TResult1>)
            | undefined
            | null,
        onRejected?:
            | ((reason: any) => TResult2 | PromiseLike<TResult2>)
            | undefined
            | null
    ): Promise<TResult1 | TResult2> {
        let callback: (res: any) => void;
        let errback: (err: Error) => void;

        const promise = new Promise<T>((resolve, reject) => {
            callback = resolve;
            errback = reject;
        }).then(onFulfilled, onRejected);

        this.addCallbacks(
            /** Результаты пробрасываются дальше в цепочку Deferred */
            Deferred.skipLogExecutionTime((res) => {
                callback(res);
                return res;
            }),
            Deferred.skipLogExecutionTime((err) => {
                errback(err);
                return err;
            })
        );

        return promise;
    }

    /**
     * Добавляет обработчик на ошибку
     * @param onRejected функция-обработчик на ошибку
     */
    catch(onRejected: (reason: Error) => any): Promise<T> {
        return this.then(null, onRejected);
    }

    // endregion

    // region Protected

    /**
     * Вся логика обработки результата.
     * Вызов коллбэков-еррбэков, поддержка вложенного Deferred
     */
    protected _fire(): void {
        const chain = this._chain;
        let fired = this._fired;
        let res = this._results[CHAIN_INDICES[fired]];
        let cb = null;

        while (chain.length > 0 && this._paused === 0) {
            const pair = chain.shift();
            const f = pair[CHAIN_INDICES[fired]];
            if (f === null) {
                continue;
            }

            try {
                // Признак того, что Deferred сейчас выполняет цепочку
                this._running = true;
                if (!f[SKIP_CALLBACK_LOG]) {
                    res = cDebug.methodExecutionTime(f, this, [res]);
                } else {
                    res = f(res);
                }
                fired = resultToFired(res);
                if (isDeferredLikeValue(res)) {
                    // We don't need to log this self-made callback
                    cb = Deferred.skipLogExecutionTime((cbRes) => {
                        this._paused--;
                        this._resback(cbRes);
                    });
                    this._paused++;
                }
            } catch (err) {
                fired = STATE.FAILED;
                res = isErrorValue(err) ? err : new Error(err);
                this.logger.error(
                    'Deferred',
                    `Callback function throwing an error: ${err.message}`,
                    err
                );
            } finally {
                this._running = false;
            }
        }
        this._fired = fired;
        this._results[CHAIN_INDICES[fired]] = res;

        if (cb && this._paused) {
            (res as unknown as Deferred<T>).addBoth(cb);
            (res as unknown as Deferred<T>)._chained = true;
        }
    }

    protected _resback(res: T): void {
        // после вызова callback/errback/cancel отмена работает вхолостую, поэтому функция отмены (cancelCallback) после
        // _resback точно не понадобится, и её можно обнулить, чтобы GC её мог собрать пораньше
        this._cancelCallback = null;

        this._fired = resultToFired(res);
        this._results[CHAIN_INDICES[this._fired]] = res;

        this._fire();
    }

    protected _check(res: T | Error, isError?: boolean): T | Error {
        let result: T | Error = res;
        if (this._fired !== STATE.WAITING) {
            throw new Error(
                `Deferred is already fired with state "${
                    STATE_NAMES[this._fired]
                }"`
            );
        }

        if (isDeferredLikeValue(result)) {
            throw new Error(
                'DeferredLike instances can only be chained if they are the result of a callback'
            );
        }

        if (isError) {
            if (!isErrorValue(result)) {
                result = new Error(String(result || ''));
            }

            if (!constants.isBrowserPlatform) {
                // Save call stack use Error instance
                const rejectionError = new Error(`"${result.message}"`);
                const rejectionAwait = this._loggerAwait;
                // Just wait for the next event loop because error handler can be attached after errback() call
                rejectionAwait(() => {
                    if (!this._hasErrback) {
                        this.logger.error(
                            'Deferred',
                            'There is no callbacks attached to handle error',
                            rejectionError
                        );
                        this.logger.error(
                            'Deferred',
                            'Unhandled error',
                            result as Error
                        );
                    }
                });
            }
        }

        return result;
    }

    // endregion

    // region Statics

    /**
     * Возвращает Deferred, который завершится успехом через указанное время.
     * @param delay Значение в миллисекундах.
     * @example
     * <pre>
     *    //выполнит обработчик через 5 секунд
     *    var def = Deferred.fromTimer(5000);
     *    def.addCallback(function(){
     *     //код обработчика
     *    });
     * </pre>
     */
    static fromTimer<T>(delay: number): Deferred<T> {
        const d = new Deferred<T>();
        setTimeout(d.callback.bind(d), delay);
        return d;
    }

    /**
     * Возвращает Deferred, завершившийся успехом.
     * @param [result] Результат выполнения.
     * @example
     * <pre>
     *    var def = Deferred.success('bar');
     *    //выполнит обработчик и передаст в него результат.
     *    def.addCallback(function(res) {
     *       // Выведет в консоль 'bar'
     *       console.log(res);
     *    });
     * </pre>
     */
    static success<T>(result: T): Deferred<T> {
        return new Deferred<T>().callback(result);
    }

    /**
     * Возвращает Deferred, завершившийся ошибкой.
     * @param result Результат выполнения.
     * @example
     * <pre>
     *    var def = Deferred.fail('Bug');
     *    // Выполнит обработчик и передаст в него результат.
     *    def.addErrback(function(err) {
     *       console.log(err.message); // Выведет в консоль 'Bug'
     *    });
     * </pre>
     */
    static fail(result: Error | string): Deferred<Error> {
        const err =
            result instanceof Error
                ? result
                : new Error(result ? String(result) : '');
        return new Deferred<Error>().errback(err);
    }

    /**
     * Возвращает Deferred, который завершится успехом или ошибкой, сразу же как завершится успехом или
     * ошибкой любой из переданных Deferred.
     * @param steps Набор из нескольких отложенных результатов.
     * @example
     * <pre>
     * var query = (new BLObject('Клиент')).call('Параметры');
     *
     * // Если запрос к БЛ займёт более 10 секунд, то Deferred завершится успехом, но вернёт undefined в результате.
     * var def = Deferred.nearestOf([Deferred.fromTimer(10000), query]);
     * def.addCallback(function(res){
     *    if (res.from === 0) {
     *
     *       // Обработка случая не завершённого запроса к БЛ, занимающего продолжительное время.
     *       helpers.alert('Ваш запрос обрабатывается слишком долго.');
     *    } else {
     *       var recordSet = res.data;
     *       // Логика обработки полученных данных.
     *    }
     * });
     * def.addErrback(function(res) {
     *   // В res.data придёт экземпляр ошибки, если один из запросов завершился ошибкой.
     * });
     * </pre>
     */
    static nearestOf<T>(steps: Deferred<T>[]): Deferred<INearestResult<T>> {
        const result = new Deferred<INearestResult<T>>();

        steps.forEach((step, index) => {
            step.addBoth((stepResult) => {
                if (!result.isReady()) {
                    if (stepResult instanceof Error) {
                        const res = new Error() as unknown as INearestResult<T>;
                        res.from = index;
                        res.data = stepResult as unknown as T;
                        result.errback(res);
                    } else {
                        result.callback({
                            from: index,
                            data: stepResult,
                        });
                    }
                }

                return stepResult;
            });
        });

        if (steps.length === 0) {
            result.callback();
        }

        return result;
    }

    /**
     * Если есть deferred, то дожидается его окончания и выполняет callback, иначе просто выполняет callback
     * @param deferred То, чего ждём.
     * @param callback То, что нужно выполнить.
     * @return Если есть деферред, то возвращает его, иначе - результат выполнения функции.
     */
    static callbackWrapper<T>(
        deferred: Deferred<T>,
        callback: (def: T | Deferred<T>) => T
    ): Deferred<T> | T {
        if (deferred && deferred instanceof Deferred) {
            return deferred.addCallback(callback);
        }
        return callback(deferred);
    }

    /**
     * Skips log execution time for this callback
     * @param callback Callback to execute
     * @return Callback to execute which wouldn't be logged
     */
    static skipLogExecutionTime<S = Function>(callback: S): S {
        callback[SKIP_CALLBACK_LOG] = true;
        return callback;
    }

    /**
     * Возвращаем Deferred который подхватывает результаты Promise
     * @param promise
     */
    static fromPromise<T>(promise: Promise<T>): Deferred<T> {
        /** Сохранить ссылку на Promise, чтобы в def.cancel() вызвать promise.abort();
         * https://online.sbis.ru/opendoc.html?guid=b7d3305f-6805-46e8-8502-8e9ed46639bf
         */
        const def = new Deferred<T>({
            parentPromise: promise,
        });
        promise
            .then((res) => {
                def.callback(res);
            })
            .catch((err) => {
                def.errback(err);
            });

        return def;
    }

    /**
     * Возвращает Promise из Deferred.
     * Не затрагивает цепочку переданного Deferred.
     * @param def
     */
    static toPromise<T>(def: Deferred<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            def.createDependent().addCallbacks(
                (res) => {
                    resolve(res);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    }

    // endregion
}
