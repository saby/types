/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 * @module
 * @public
 */
import SerializableMixin, {
    ISignature,
    IState as IDefaultSerializableState,
} from '../SerializableMixin';
import { register } from '../../di';

type DateConstructorArgumentsTuple =
    | [number | string | Date]
    | [number, number, number, number, number, number, number];

export const $withoutTimeZone = Symbol('withoutTimeZone');

const NOW = new Date();

export interface ISerializableState<T = number | string | Date>
    extends IDefaultSerializableState<T> {
    withoutTimeZone?: boolean;
}

export interface IDateSignature<T = number | string | Date> extends ISignature<T> {
    state: ISerializableState<T>;
}

interface IDateTimeConstructor {
    new (): Date & SerializableMixin;
    fromJSON(data: IDateSignature): DateTime;
}

function mixin(Base: unknown): IDateTimeConstructor {
    return Base as IDateTimeConstructor;
}

/**
 *
 * @param value
 */
export function isDateTime(value: any): value is DateTime {
    return value && value['[Types/_entity/applied/DateTime]'];
}

function normalizeArguments(
    ...args: (number | string | Date | boolean)[]
): [boolean, DateConstructorArgumentsTuple] {
    const withoutTimeZoneIndex = args.findIndex((item) => {
        return typeof item === 'boolean';
    });
    if (withoutTimeZoneIndex > -1) {
        return [
            args[withoutTimeZoneIndex] as boolean,
            args.slice(0, withoutTimeZoneIndex) as DateConstructorArgumentsTuple,
        ];
    }

    return [false, args as DateConstructorArgumentsTuple];
}

/**
 * Тип "Дата-время". Расширяет стандартный тип {@link Types/entity:applied.Date Date} для более точной работы с типами "Дата" и "Время".
 * @public
 */
export default class DateTime extends mixin(SerializableMixin) {
    protected get _proto(): object {
        return DateTime.prototype;
    }

    /**
     * Сериализовать значение без сохранения информации о временной зоне
     */
    get withoutTimeZone(): boolean {
        return Boolean(this[$withoutTimeZone]);
    }

    /**
     * Без указания временной зоны
     */
    protected [$withoutTimeZone]?: boolean;

    // @ts-ignore
    constructor(withoutTimeZone?: boolean);
    constructor(value?: number | string | Date | boolean, withoutTimeZone?: boolean);
    constructor(year: number, month: number, withoutTimeZone?: boolean);
    constructor(year: number, month: number, date?: number, withoutTimeZone?: boolean);
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        minutes?: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        minutes?: number,
        seconds?: number,
        withoutTimeZone?: boolean
    );
    constructor(
        year: number,
        month: number,
        date?: number,
        hours?: number,
        minutes?: number,
        seconds?: number,
        millisecond?: number,
        withoutTimeZone?: boolean
    );
    constructor(...args: (number | string | Date | boolean)[]) {
        super();

        const [withoutTimeZone, normalizedArgs]: [boolean, DateConstructorArgumentsTuple] =
            normalizeArguments(...args);
        const instance = new Date(...(normalizedArgs as [string | number | Date]));

        // Unfortunately we can't simply extend from Date because it's not a regular object. Here are some details
        // about this issue: https://stackoverflow.com/questions/6075231/how-to-extend-the-javascript-date-object
        Object.setPrototypeOf(instance, this._proto);

        if (withoutTimeZone === true) {
            // @ts-ignore
            instance[$withoutTimeZone] = true;
        }

        return instance as unknown as DateTime;
    }

    // region SerializableMixin

    _getSerializableState(state: ISerializableState): ISerializableState {
        state.$options = this.getTime();
        if (this[$withoutTimeZone]) {
            state.withoutTimeZone = this[$withoutTimeZone];
        }

        return state;
    }

    _setSerializableState(state: ISerializableState): Function {
        const fromSerializableMixin = SerializableMixin.prototype._setSerializableState(state);
        return function (this: DateTime): void {
            fromSerializableMixin.call(this);
            if (state.withoutTimeZone) {
                this[$withoutTimeZone] = state.withoutTimeZone;
            }
        };
    }

    toJSON(): IDateSignature;
    toJSON(key?: unknown): string;
    toJSON(): IDateSignature | string {
        // @ts-ignore
        return SerializableMixin.prototype.toJSON.call(this);
    }

    // endregion

    // region Statics

    /**
     * Возвращает смещение часового пояса клиента, взятое из cookie с именем 'tz'.
     * Аналог {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset getTimezoneOffset}, но его можно использовать в SSR для синхронизации отображаемых значений даты/времени с часовым поясом клиента.
     * @example
     * Выведем текущее время в часовом поясе клиента:
     * <pre>
     *     import {date as format} from 'Types/formatter';
     *     import {DateTime} from 'Types/entity';
     *     const date = new Date();
     *     console.log(format(date, format.SHORT_TIME, DateTime.getClientTimezoneOffset()));
     * </pre>
     */
    static getClientTimezoneOffset(): number {
        //@ts-ignore
        const clientTimeZoneStr = globalThis.process?.domain?.req?.cookies?.tz;
        if (clientTimeZoneStr) {
            return parseInt(clientTimeZoneStr, 10);
        }

        return NOW.getTimezoneOffset();
    }

    // endregion
}

// Deal with not natural prototype of Date by including its prototype into the chain of prototypes like this:
// DateTime -> Interlayer[SerializableMixin -> Date]
function Interlayer(): void {
    /* Just carrier*/
}
// Use spread operator to break off shared link because polyfill of setPrototypeOf() for IE spoils the prototype of
// SerializableMixin
const prototypeDateTime = Object.getPrototypeOf(DateTime.prototype);

for (const name of Object.getOwnPropertyNames(prototypeDateTime)) {
    if (name !== 'constructor') {
        Interlayer.prototype[name] = prototypeDateTime[name];
    }
}
Object.setPrototypeOf(Interlayer.prototype, Date.prototype);
Object.setPrototypeOf(DateTime.prototype, Interlayer.prototype);

Object.assign(DateTime.prototype, {
    '[Types/_entity/applied/DateTime]': true,
    _moduleName: 'Types/entity:DateTime',
});

register('Types/entity:DateTime', DateTime, { instantiate: false });
