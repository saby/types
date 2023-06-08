export type TCallback<TValue, TResult = TValue> = (
    value: TValue
) => TResult | Promise<TResult>;
export type TErrBack<TValue, TResult = TValue> = (
    reason: Error
) => Error | Promise<Error> | Promise<TResult> | void;
