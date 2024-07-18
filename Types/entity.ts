/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/**
 * Библиотека, которая предоставляет различные виды сущностей.
 * @library Types/entity
 * @includes adapter Types/_entity/adapter
 * @includes applied Types/_entity/applied
 * @includes compare Types/_entity/compare
 * @includes descriptor Types/_entity/descriptor
 * @includes factory Types/_entity/factory
 * @includes format Types/_entity/format
 * @includes functor Types/_entity/functor
 * @includes ICloneable Types/_entity/ICloneable
 * @includes IEquatable Types/_entity/IEquatable
 * @includes IInstantiable Types/_entity/IInstantiable
 * @includes IObject Types/_entity/IObject
 * @includes IObservableObject Types/_entity/IObservableObject
 * @includes IVersionable Types/_entity/IVersionable
 * @includes Model Types/_entity/Model
 * @includes Record Types/_entity/Record
 * @includes relation Types/_entity/relation
 * @includes Date Types/_entity/applied/Date
 * @includes DateTime Types/_entity/applied/DateTime
 * @includes Time Types/_entity/applied/Time
 * @public
 */

/*
 * Library that provides various kinds of entities.
 * @library Types/entity
 * @includes adapter Types/_entity/adapter
 * @includes applied Types/_entity/applied
 * @includes compare Types/_entity/compare
 * @includes descriptor Types/_entity/descriptor
 * @includes factory Types/_entity/factory
 * @includes format Types/_entity/format
 * @includes functor Types/_entity/functor
 * @includes ICloneable Types/_entity/ICloneable
 * @includes IEquatable Types/_entity/IEquatable
 * @includes IInstantiable Types/_entity/IInstantiable
 * @includes IObject Types/_entity/IObject
 * @includes IObservableObject Types/_entity/IObservableObject
 * @includes IVersionable Types/_entity/IVersionable
 * @includes Model Types/_entity/Model
 * @includes Record Types/_entity/Record
 * @includes relation Types/_entity/relation
 * @public
 * @author Буранов А.Р.
 */

// entity internal libs
import * as adapter from './_entity/adapter';
import * as applied from './_entity/applied';
import * as factory from './_entity/factory';
import * as compare from './_entity/compare';
import * as format from './_entity/format';
import * as functor from './_entity/functor';
import * as relation from './_entity/relation';
export { default as descriptor, DescriptorValidator } from './_entity/descriptor';

export { adapter, applied, factory, compare, format, functor, relation };

import { Date, DateTime, Identity, Time } from './_entity/applied';
export { Date, DateTime, Identity, Time };
export {
    CancelablePromise,
    Guid,
    Ulid,
    JSONML,
    IJSONML,
    PromiseCanceledError,
    ReactiveObject,
    TimeInterval,
} from './_entity/applied';

// mixins
export { default as DestroyableMixin } from './_entity/DestroyableMixin';
export { default as CloneableMixin } from './_entity/CloneableMixin';
export { default as ManyToManyMixin } from './_entity/ManyToManyMixin';
export {
    default as FormattableMixin,
    AdapterDescriptor,
    FormatDescriptor,
    IOptions as IFormattableOptions,
    ISerializableState as IFormattableSerializableState,
} from './_entity/FormattableMixin';
export {
    default as OptionsToPropertyMixin,
    getMergeableProperty,
} from './_entity/OptionsToPropertyMixin';
export {
    default as ObservableMixin,
    IOptions as IObservableMixinOptions,
} from './_entity/ObservableMixin';
export { default as EventRaisingMixin } from './_entity/EventRaisingMixin';
export {
    default as ReadWriteMixin,
    IOptions as IReadWriteMixinOptions,
} from './_entity/ReadWriteMixin';
export {
    default as SerializableMixin,
    ISerializableConstructor,
    ISignature as ISerializableSignature,
    IState as ISerializableState,
} from './_entity/SerializableMixin';
export {
    default as VersionableMixin,
    IOptions as IVersionableMixinOptions,
    VersionCallback as VersionableMixinVersionCallback,
} from './_entity/VersionableMixin';

// interfaces
export { default as ICloneable } from './_entity/ICloneable';
export { default as IEquatable } from './_entity/IEquatable';
export { default as IInstantiable } from './_entity/IInstantiable';
export { default as InstantiableMixin } from './_entity/InstantiableMixin';
export { default as IObject, IObjectConstructor } from './_entity/IObject';
export { default as IObservableObject } from './_entity/IObservableObject';
export { default as IProducible } from './_entity/IProducible';
export { default as ISerializable } from './_entity/ISerializable';
export { default as IVersionable } from './_entity/IVersionable';
export { default as IStateful } from './_entity/IStateful';

// Record & Model
import { default as Record } from './_entity/Record';
import { default as Model } from './_entity/Model';
export { Record, Model };

export {
    IProperty as IModelProperty,
    ModelConstructor,
    IOptions as IModelOptions,
} from './_entity/Model';

export { State as RecordState, IOptions as IRecordOptions, getValueType } from './_entity/Record';

// DI
import { register } from './di';
register('Types/entity:Model', Model, { instantiate: false });
register('Types/entity:Record', Record, { instantiate: false });
register('Types/entity:adapter.Cow', adapter.Cow, { instantiate: false });
register('Types/entity:adapter.Json', adapter.Json, { instantiate: false });
register('Types/entity:adapter.RecordSet', adapter.RecordSet, {
    instantiate: false,
});
register('Types/entity:adapter.Sbis', adapter.Sbis, { instantiate: false });
register('Types/entity:Date', applied.Date, { instantiate: false });
register('Types/entity:DateTime', applied.DateTime, { instantiate: false });
register('Types/entity:Identity', applied.Identity, { instantiate: false });
register('Types/entity:Time', applied.Time, { instantiate: false });
register('Types/entity:format.ArrayField', format.ArrayField, {
    instantiate: false,
});
register('Types/entity:format.BinaryField', format.BinaryField, {
    instantiate: false,
});
register('Types/entity:format.BooleanField', format.BooleanField, {
    instantiate: false,
});
register('Types/entity:format.DateField', format.DateField, {
    instantiate: false,
});
register('Types/entity:format.DateTimeField', format.DateTimeField, {
    instantiate: false,
});
register('Types/entity:format.DictionaryField', format.DictionaryField, {
    instantiate: false,
});
register('Types/entity:format.EnumField', format.EnumField, {
    instantiate: false,
});
register('Types/entity:format.FlagsField', format.FlagsField, {
    instantiate: false,
});
register('Types/entity:format.HierarchyField', format.HierarchyField, {
    instantiate: false,
});
register('Types/entity:format.IdentityField', format.IdentityField, {
    instantiate: false,
});
register('Types/entity:format.IntegerField', format.IntegerField, {
    instantiate: false,
});
register('Types/entity:format.LinkField', format.LinkField, {
    instantiate: false,
});
register('Types/entity:format.MoneyField', format.MoneyField, {
    instantiate: false,
});
register('Types/entity:format.ObjectField', format.ObjectField, {
    instantiate: false,
});
register('Types/entity:format.RealField', format.RealField, {
    instantiate: false,
});
register('Types/entity:format.RecordField', format.RecordField, {
    instantiate: false,
});
register('Types/entity:format.RecordSetField', format.RecordSetField, {
    instantiate: false,
});
register('Types/entity:format.RpcFileField', format.RpcFileField, {
    instantiate: false,
});
register('Types/entity:format.StringField', format.StringField, {
    instantiate: false,
});
register('Types/entity:format.TimeField', format.TimeField, {
    instantiate: false,
});
register('Types/entity:format.TimeIntervalField', format.TimeIntervalField, {
    instantiate: false,
});
register('Types/entity:format.UniversalField', format.UniversalField, {
    instantiate: false,
});
register('Types/entity:format.UuidField', format.UuidField, {
    instantiate: false,
});
register('Types/entity:format.XmlField', format.XmlField, {
    instantiate: false,
});

// FIXME: deprecated
register('entity.model', Model);
register('adapter.json', adapter.Json);
register('adapter.recordset', adapter.RecordSet, { instantiate: false });
register('adapter.sbis', adapter.Sbis);
