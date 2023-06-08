/**
 * Библиотека, улучшающая работу с функциями.
 * @library Types/function
 * @includes debounce Types/_function/debounce#debounce
 * @includes delay Types/_function/delay#delay
 * @includes memoize Types/_function/memoize#memoize
 * @includes once Types/_function/once#once
 * @includes throttle Types/_function/throttle#throttle
 * @public
 */

/*
 * Library that improves work with functions
 * @library Types/function
 * @includes debounce Types/_function/debounce#debounce
 * @includes delay Types/_function/delay#delay
 * @includes memoize Types/_function/memoize#memoize
 * @includes once Types/_function/once#once
 * @includes throttle Types/_function/throttle#throttle
 * @public
 * @author Буранов А.Р.
 */

export { default as debounce } from './_function/debounce';
export { default as delay } from './_function/delay';
export { default as memoize } from './_function/memoize';
export { default as once } from './_function/once';
export { default as throttle } from './_function/throttle';
