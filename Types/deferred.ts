/**
 * Библиотека для работы с дефиридом.
 * @library
 * @public
 * @module
 * @author Буранов А.Р.
 * @deprecated Используйте {@link https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise Promise}.
 */

export {
    default as Deferred,
    TRes as TDeferredRes,
    IOptions as IDeferredOptions,
    INearestResult as IDeferredNearestResult,
    ILogger as IDeferredLogger,
} from './_deferred/Deferred';
export { DeferredCanceledError } from './_deferred/DeferredCanceledError';
export { TCallback, TErrBack, TErrBackFunction, TCallbackFunction } from './_deferred/DeferredAddons';
