/**
 * Библиотека, улучшающая работу с функциями.
 * @library
 * @public
 * @module
 */

export { default as debounce } from './_function/debounce';
export { default as debounceCancellable, ICancellable } from './_function/debounceCancellable';
export { default as delay } from './_function/delay';
export { default as memoize } from './_function/memoize';
export { default as once, InnerFunction as OnceInnerFunction } from './_function/once';
export { default as throttle } from './_function/throttle';
export { IDebounceStates, InnerFunction } from './_function/interface';
