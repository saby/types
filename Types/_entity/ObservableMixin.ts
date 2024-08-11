/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 * @module
 * @public
 */
import { Bus as EventBus, Channel as EventCannel, Object as EventObject } from 'Env/Event';

/**
 * Интерфейс опций конструктора ObservableMixin
 * @public
 */
export interface IOptions {
    /**
     * Обработчики событий
     */
    handlers?: Record<string, Function>;
    /**
     *
     */
    eventChannelConfig?: IChannelConfig;
}

/**
 *
 */
export interface IChannelConfig {
    convertName: boolean;
}

/**
 * @public
 */
export interface IEventsQueue<T> extends Array<T> {
    /**
     *
     */
    running?: boolean;
}

/**
 * Примесь, позволяющая сущности возможность узнавать об изменении состояния объекта через события.
 * @public
 */
export default abstract class ObservableMixin {
    /**
     * После изменения набора свойств объекта.
     * @category Event
     * @param event Дескриптор события.
     * @param Названия и новые значения изменившихся свойств.
     * @example
     * <pre>
     *     var human = new Record({
     *         rawData: {
     *             firstName: 'Laurence',
     *             lastName: 'Wachowski',
     *             born: 'June 21, 1965',
     *             gender: 'Male'
     *         }
     *     });
     *
     *     human.subscribe('onPropertyChange', function(event, properties) {
     *         if ('gender' in properties) {
     *             Di.resolve('the.big.brother').getRegistry('Transgenders').add(event.getTarget());
     *         }
     *     });
     *
     *     human.set({
     *         firstName: 'Lana',
     *         gender: 'Female'
     *     })
     * </pre>
     */
    onPropertyChange?: (event: EventObject, properties: object) => void;

    /**
     * Канал событий
     */
    protected _eventBusChannel: EventCannel;

    /**
     * Очередь событий
     */
    protected _eventsQueue: any[][];

    /**
     * Декларированные события
     */
    protected _publishedEvents: string[];

    protected _destroyed: boolean;

    protected eventBusOptions: IChannelConfig;

    /**
     *
     * @param options
     */
    constructor(options?: IOptions) {
        ObservableMixin.initMixin(this, options);
    }

    static initMixin(instance: any, options?: IOptions) {
        const handlers = options && options.handlers;
        if (handlers instanceof Object) {
            for (const event in handlers) {
                if (handlers.hasOwnProperty(event)) {
                    instance.subscribe(event, handlers[event]);
                }
            }
        }
    }

    // This method calls implicitly when mixing in a row with DestroyableMixin
    destroy(): void {
        if (this._eventBusChannel) {
            this._eventBusChannel.unsubscribeAll();
            this._eventBusChannel.destroy();
            //@ts-ignore;
            this._eventBusChannel = null;
        }
    }

    /**
     * Добавляет подписку на событие
     * @param event Имя события, на которое подписывается обработчик
     * @param handler Обработчик события.
     * @param ctx Контекст выполнения
     * @example
     * Подпишемся на событие OnSomethingChanged:
     * <pre>
     *     const instance = new Entity();
     *     instance.subscribe('onSomethingHappened', (event, eventArg1) => {
     *         // Do something
     *     });
     * </pre>
     */
    subscribe(event: string, handler: Function, ctx?: object): void {
        if (this._destroyed) {
            return;
        }

        if (!this._eventBusChannel) {
            this._eventBusChannel = EventBus.channel(
                this.eventBusOptions || { convertName: false }
            );

            if (this._publishedEvents) {
                for (let i = 0; i < this._publishedEvents.length; i++) {
                    this._eventBusChannel.publish(this._publishedEvents[i]);
                }
            }
        }

        if (ctx === undefined) {
            ctx = this;
        }
        this._eventBusChannel.subscribe(event, handler, ctx);
    }

    /**
     * Отменяет подписку на событие
     * @param event Имя события, на которое подписывается обработчик
     * @param handler Обработчик события.
     * @param ctx Контекст выполнения
     * @example
     * Подпишемся на событие OnSomethingChanged и обработаем его только один раз:
     * <pre>
     *     const instance = new Entity();
     *     const handler = (event, eventArg1) => {
     *         instance.unsubscribe(handler);
     *         // Do something
     *     };
     *     instance.subscribe('onSomethingHappened', handler);
     * </pre>
     */
    unsubscribe(event: string, handler: Function, ctx?: object): void {
        if (this._eventBusChannel) {
            if (ctx === undefined) {
                ctx = this;
            }
            this._eventBusChannel.unsubscribe(event, handler, ctx);
        }
    }

    /**
     * Возвращет массив подписчиков на событие
     * @param event Имя события
     * @example
     * Посмотрим, сколько подписчиков у события OnSomethingChanged
     * <pre>
     *     const handlersCount = instance.getEventHandlers().length;
     * </pre>
     */
    getEventHandlers(event: string): Function[] {
        return this._eventBusChannel ? this._eventBusChannel.getEventHandlers(event) : [];
    }

    /**
     * Проверяет наличие подписки на событие
     * @param event Имя события
     * @example
     * Посмотрим, есть ли подписчики у события 'onSomethingChanged'
     * <pre>
     *     const hasHandlers = instance.hasEventHandlers('onSomethingChanged');
     * </pre>
     */
    hasEventHandlers(event: string): boolean {
        return this._eventBusChannel ? this._eventBusChannel.hasEventHandlers(event) : false;
    }

    /**
     * Декларирует наличие событий
     * @param events Имена событий
     */
    protected _publish(...events: string[]): void {
        this._publishedEvents = this._publishedEvents || [];
        let event;
        for (let i = 0; i < events.length; i++) {
            event = events[i];
            this._publishedEvents.push(event);
            if (this._eventBusChannel) {
                this._eventBusChannel.publish(event);
            }
        }
    }

    /**
     * Извещает о наступлении события. Если в процессе извещения приходит очередное событие, то извещение о нем будет отправлено после выполнения обработчиков предыдущего.
     * @param event Имя события
     * @param args Аргументы события
     * @return Результат обработки события (возвращается только в случае отсутствия очереди)
     */
    protected _notify(event: string, ...args: any[]): any {
        if (this._eventBusChannel) {
            this._notifyPushQueue.apply(this, [event, ...args]);
            return this._notifyQueue(this._eventsQueue)[0];
        }
    }

    /**
     * Ставит в очередь извещение о наступлении события.
     * @param event Имя события
     * @param args Аргументы события
     */
    protected _notifyLater(event: string, ...args: any[]): void {
        if (this._eventBusChannel) {
            this._notifyPushQueue.apply(this, [event, ...args]);
        }
    }

    /**
     * Добавляет извещение о событии в очередь.
     * @param event Имя события
     * @param args Аргументы события
     */
    protected _notifyPushQueue(event: string, ...args: any[]): void {
        this._eventsQueue = this._eventsQueue || [];
        this._eventsQueue.push([event, ...args]);
    }

    /**
     * Инициирует выполнение обработчиков из очереди событий
     * @param eventsQueue Очередь событий
     * @return Результаты обработки событий
     */
    protected _notifyQueue(eventsQueue: IEventsQueue<Function[]>): any[] {
        const results = [];

        if (!eventsQueue.running) {
            eventsQueue.running = true;
            let item;
            while ((item = eventsQueue[0])) {
                results.push(this._eventBusChannel._notifyWithTarget(item[0], this, item.slice(1)));
                eventsQueue.shift();
            }
            eventsQueue.running = false;
        }

        return results;
    }

    /**
     * Удаляет из очереди все обработчики указанного события
     * @param eventName Имя события
     */
    protected _removeFromQueue(eventName: string): void {
        if (!this._eventsQueue) {
            return;
        }

        for (let i = 1; i < this._eventsQueue.length; i++) {
            if (this._eventsQueue[i][0] === eventName) {
                this._eventsQueue.splice(i, 1);
                i--;
            }
        }
    }

    static setChannelOptions(instanse: any, options: IChannelConfig): void {
        instanse.eventBusOptions = options;
    }
}

Object.assign(ObservableMixin.prototype, {
    '[Types/_entity/ObservableMixin]': true,
    _eventBusChannel: null,
    _eventsQueue: null,
    _publishedEvents: null,
});
