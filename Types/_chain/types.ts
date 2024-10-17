/**
 *
 */
export type EnumeratorIndex = string | number;

/**
 *
 */
export type CallbackFunc = (item: any, index: EnumeratorIndex) => boolean;

/**
 *
 */
export type MapFunc = (item: any, index: EnumeratorIndex) => any;

/**
 *
 */
export type EnumeratorMap<T, U> = [U, T?][];
