/**
 * Библиотека, которая предоставляет различные виды коллекций.
 * @library
 * @public
 * @module
 */

import { register } from './di';

export {
    default as enumerableComparator,
    ISession as IEnumerableComparatorSession,
} from './_collection/enumerableComparator';
import { default as Enum } from './_collection/Enum';
import * as factory from './_collection/factory';
import * as format from './_collection/format';
import { default as Flags, IIndex} from './_collection/Flags';
export { Enum, factory, format, Flags, IIndex as IFlagsIndex };
import * as enumerator from './_collection/enumerator';
export { enumerator };
export { default as EventRaisingMixin } from './_collection/EventRaisingMixin';
export { default as IEnum, IIndex as IEnumIndex, ISafeIndex as IEnumSafeIndex } from './_collection/IEnum';
export { default as IFlags, IValue as IFlagsValue } from './_collection/IFlags';
export {
    default as IEnumerable,
    EnumeratorIndex,
    EnumeratorCallback,
} from './_collection/IEnumerable';
export { default as IEnumerator } from './_collection/IEnumerator';
export { default as IList, IListConstructor } from './_collection/IList';
export { default as IndexedEnumeratorMixin } from './_collection/IndexedEnumeratorMixin';
export { default as IObservable, ChangeAction as ObservableChangeAction } from './_collection/IObservable';
import { default as List, IOptions as IListOptions, ListConstructor } from './_collection/List';
export { List, IListOptions, ListConstructor };
import { default as ObservableList } from './_collection/ObservableList';
export { ObservableList };
import {
    default as RecordSet,
    IMergeOptions as IRecordSetMergeOptions,
    IOptions as IRecordSetOptions,
    isRecordSet,
} from './_collection/RecordSet';
export { RecordSet, IRecordSetMergeOptions, IRecordSetOptions, isRecordSet };

register('Types/collection:format.Format', format.Format, {
    instantiate: false,
});
register('Types/collection:format.factory', format.factory, {
    instantiate: false,
});
register('Types/collection:Enum', Enum, { instantiate: false });
register('Types/collection:Flags', Flags, { instantiate: false });
register('Types/collection:List', List, { instantiate: false });
register('Types/collection:ObservableList', ObservableList, {
    instantiate: false,
});
register('Types/collection:RecordSet', RecordSet, { instantiate: false });
register('Types/collection:enumerator.Arraywise', enumerator.Arraywise, {
    instantiate: false,
});
