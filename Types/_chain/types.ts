type EnumeratorIndex = string | number;
type CallbackFunc = (item: any, index: EnumeratorIndex) => boolean;
type MapFunc = (item: any, index: EnumeratorIndex) => any;

type EnumeratorMap<T, U> = [U, T?][];

export { CallbackFunc, MapFunc, EnumeratorIndex, EnumeratorMap };
