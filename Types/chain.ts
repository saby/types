/**
 * Библиотека, которая обеспечивает цепные ленивые вычисления для различных видов коллекций.
 * @library
 * @public
 * @module
 */

import { default as factory, registerFactory } from './_chain/factory';
// registration on library level is needed for proper lazy library initialization.
registerFactory();
export { factory };
export { default as Abstract, ReduceFunc } from './_chain/Abstract';

export { default as Objectwise } from './_chain/Objectwise';
export { default as Zipped } from './_chain/Zipped';
export { default as Mapped } from './_chain/Mapped';
export { default as Concatenated } from './_chain/Concatenated';
export { default as Flattened } from './_chain/Flattened';
export {
    default as Grouped,
    TKey as GroupedTKey,
    GroupFunc,
    TValue as TGroupedValue,
    ValueFunc as GroupedValueFunc,
} from './_chain/Grouped';
export {
    default as Counted,
    KeyType as CountedKeyType,
    KeyFunc as CountedKeyFunc
} from './_chain/Counted';
export {
    default as Uniquely,
    ExtractFunc as UniquelyExtractFunc,
} from './_chain/Uniquely';
export { default as Filtered } from './_chain/Filtered';
export { default as Sliced } from './_chain/Sliced';
export { default as Reversed } from './_chain/Reversed';
export { default as Sorted } from './_chain/Sorted';
export {
    EnumeratorIndex,
    CallbackFunc,
    MapFunc,
    EnumeratorMap,
} from './_chain/types';
