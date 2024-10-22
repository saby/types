/**
 *
 */
export type TCallbackFunction<TValue, TResult = TValue> = (value: TValue) => TResult | Promise<TResult>;
/**
 *
 */
export type TErrBackFunction<TValue, TResult = TValue> = (
    reason: Error
) => Error | Promise<Error> | Promise<TResult> | void;

/**
 *
 */
export type TCallback<TValue, TResult = TValue> = TCallbackFunction<TValue, TResult> | null;

/**
 *
 */
export type TErrBack<TValue, TResult = TValue> = TErrBackFunction<TValue, TResult> | null;
