import { IObjectKey, IHashMap } from 'Types/declarations';

/**
 * Интерфейс сущности, реализующей интерфейс отслеживания изменений сессии
 * @public
 */
export interface IObserveSessionInstance {
    startObserveSession(): void;
    endObserveSession(callback: TCallback): Function;
}

/**
 * Функция проверяет, реализует ли сущность механизм отслеживания изменений сессии.
 * @param value
 * @public
 */
function isObservableMixin(value: any): value is IObserveSessionInstance {
    return value && value['[Types/_entity/ObserveSessionMixin]'];
}

/**
 * Ключ записи
 * @private
 */
type TKey = keyof any;

/**
 * Колбек обратного вызова при изменениях в текущей сессии
 * @public
 */
export type TCallback = (props: Record<IObjectKey, unknown>) => void;

/**
 * Интерфейс описания сессии отслеживания изменений
 * @private
 */
interface IObservableSession {
    /**
     * Зависимости
     */
    dependencies: Set<TKey>;

    /**
     * Зависимые записи в иерархии
     */
    observableReferences: Set<IObserveSessionInstance>;
    /**
     * Колбек обратного вызова при изменениях в текущей сессии
     */
    callback?: TCallback;
}

/**
 * Примесь, позволяющая отслеживать изменения полей, используемых в рамках сессии
 * @example
 * Предположим, что у нас есть такой инстанс записи:
 * <pre>
 *     const record = new Record({
 *         rawData: {
 *             FirstName: 'Гарри',
 *             LastName: 'Поттер',
 *             Age: 30,
 *             Department: 'Отдел Магических Расследований',
 *         },
 *     });
 * </pre>
 *
 * Далее колбек, который будет вызываться при изменении полей:
 * <pre>
 *     const callback = (changes: Record<string, unknown>) => console.log(changes)};
 * </pre>
 *
 * После запуска сессии отслеживания изменений все последующие вызовы методов сохраняются в зависимости:
 * <pre>
 *     record.startObserveSession(); // запустили сессию отслеживания
 *     record.get('FirstName'); // обращаемся к полям записи
 *     record.get('Age');
 *     record.endObserveSession(callback); // передаем колбек
 * </pre>
 *
 * В дальнейшем при любых изменениях этих полей будет поджигаться колбек, переданный в {@link endObserveSession}
 * <pre>
 *     record.set('FirstName', 'Лили'); // произошел вызов колбека
 *     record.set('Age', 45'); // произошел вызов колбека
 *     record.set('Department', 'Отдел Защиты от Тёмных Искусств');
 *     // колбек НЕ вызвался, т.к. поле Deparment не использовался в рамках сессии
 * </pre>
 */
class ObserveSessionMixin implements IObserveSessionInstance {
    private _sessions: Map<TCallback, IObservableSession>;

    private _sessionGathering: IObservableSession | null;

    /**
     * Запускает сессию отслеживания изменений
     * @example
     * Предположим, что у нас есть такой инстанс записи:
     * <pre>
     *     const record = new Record({
     *         rawData: {
     *             FirstName: 'Гарри',
     *             LastName: 'Поттер',
     *             Age: 30,
     *             Department: 'Отдел Магических Расследований',
     *         },
     *     });
     * </pre>
     *
     * Далее колбек, который будет вызываться при изменении полей:
     * <pre>
     *     const callback = (changes: Record<string, unknown>) => console.log(changes)};
     * </pre>
     *
     * После запуска сессии отслеживания изменений все последующие вызовы методов сохраняются в зависимости:
     * <pre>
     *     record.startObserveSession(); // запустили сессию отслеживания
     *     record.get('FirstName'); // обращаемся к полям записи
     *     record.get('Age');
     *     record.endObserveSession(callback); // передаем колбек
     * </pre>
     *
     * В дальнейшем при любых изменениях этих полей будет поджигаться колбек, переданный в {@link endObserveSession}
     * <pre>
     *     record.set('FirstName', 'Лили'); // произошел вызов колбека
     *     record.set('Age', 45'); // произошел вызов колбека
     *     record.set('Department', 'Отдел Защиты от Тёмных Искусств');
     *     // колбек НЕ вызвался, т.к. поле Deparment не использовался в рамках сессии
     * </pre>
     */
    startObserveSession(): void {
        if (this._sessionGathering) {
            throw new Error(
                'Сначала завершите текущую сессию сбора зависимостей через .endObserveSession(), прежде чем запускать новую.'
            );
        }

        if (!this._sessionGathering) {
            this._sessionGathering = {
                dependencies: new Set(),
                observableReferences: new Set(),
            };
        }
    }

    /**
     * Завершает формирование сессии отслеживания изменений записи
     * @see startObserveSession
     * @param callback
     */
    endObserveSession(callback: TCallback): Function {
        if (!this._sessionGathering) {
            throw new Error(
                'Сначала запустите новую сессию сбора зависимостей через .startObserveSession(), прежде чем завершать её.'
            );
        }
        this._setSession(callback, this._sessionGathering);

        // завершаем сессию отслеживания во всех вложенных рекордах
        const innerCleanupFuncs: Function[] = [];
        for (const innerRec of this._sessionGathering.observableReferences) {
            innerCleanupFuncs.push(innerRec.endObserveSession(callback));
        }

        this._sessionGathering = null;

        return () => {
            innerCleanupFuncs.forEach((func) => func());
            this._sessions.delete(callback);
        };
    }

    destroy(_args?: any): any {
        // @ts-ignore
        this._sessions = null;
        this._sessionGathering = null;
    }

    protected _isSessionGathering(): boolean {
        return !!this._sessionGathering;
    }

    protected _pushSessionDependency(field: TKey): void {
        if (!this._sessionGathering) {
            return;
        }

        this._sessionGathering.dependencies.add(field);
    }

    /**
     * Запускает отслеживание изменений во вложенных рекордах и сохраняет в хранилище ссылку на него
     * @param rec
     * @private
     */
    protected _createObservableDependency(inst: IObserveSessionInstance): void {
        inst.startObserveSession();
        this._sessionGathering?.observableReferences.add(inst);
    }

    protected _triggerSessionDependency(changes: IHashMap<any> | null): void {
        if (!this._sessions) {
            return;
        }

        if (!changes) {
            return;
        }

        const keys = Object.keys(changes);

        for (const [callback, session] of this._sessions) {
            if (keys.some((key) => session.dependencies.has(key))) {
                callback(changes);
            }
        }
    }

    private _setSession(callback: TCallback, session: IObservableSession): void {
        if (!this._sessions) {
            this._sessions = new Map<TCallback, IObservableSession>();
        }

        this._sessions.set(callback, session);
    }
}

Object.assign(ObserveSessionMixin.prototype, {
    '[Types/_entity/ObserveSessionMixin]': true,
    _sessionGathering: null,
});

export { ObserveSessionMixin, isObservableMixin };
