/**
 * @kaizen_zone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
/**
 * Библиотека адаптеров.
 * @library Types/_entity/adapter
 * @includes Abstract Types/_entity/adapter/Abstract
 * @includes Cow Types/_entity/adapter/Cow
 * @includes Json Types/_entity/adapter/Json
 * @includes IAdapter Types/_entity/adapter/IAdapter
 * @includes IDataHolder Types/_entity/adapter/IDataHolder
 * @includes IDecorator Types/_entity/adapter/IDecorator
 * @includes IMetaData Types/_entity/adapter/IMetaData
 * @includes IRecord Types/_entity/adapter/IRecord
 * @includes ITable Types/_entity/adapter/ITable
 * @includes RecordSet Types/_entity/adapter/RecordSet
 * @includes Sbis Types/_entity/adapter/Sbis
 * @public
 */

/*
 * Adapters library.
 * @library Types/_entity/adapter
 * @includes Abstract Types/_entity/adapter/Abstract
 * @includes Cow Types/_entity/adapter/Cow
 * @includes Json Types/_entity/adapter/Json
 * @includes IAdapter Types/_entity/adapter/IAdapter
 * @includes IDataHolder Types/_entity/adapter/IDataHolder
 * @includes IDecorator Types/_entity/adapter/IDecorator
 * @includes IMetaData Types/_entity/adapter/IMetaData
 * @includes IRecord Types/_entity/adapter/IRecord
 * @includes ITable Types/_entity/adapter/ITable
 * @includes RecordSet Types/_entity/adapter/RecordSet
 * @includes Sbis Types/_entity/adapter/Sbis
 * @public
 * @author Буранов А.Р.
 */

export { default as Abstract } from './adapter/Abstract';
export { default as Cow } from './adapter/Cow';
export { default as Json } from './adapter/Json';
export { default as JsonTable } from './adapter/JsonTable';
export { default as JsonRecord } from './adapter/JsonRecord';
export { default as IAdapter } from './adapter/IAdapter';
export { default as IDataHolder } from './adapter/IDataHolder';
export { default as IDecorator } from './adapter/IDecorator';
export { default as IMetaData } from './adapter/IMetaData';
export { default as IRecord } from './adapter/IRecord';
export { default as ITable } from './adapter/ITable';
export { default as RecordSet } from './adapter/RecordSet';
export { default as RecordSetRecord } from './adapter/RecordSetRecord';
export { default as RecordSetTable } from './adapter/RecordSetTable';
export { default as Sbis } from './adapter/Sbis';
export { default as SbisFieldType } from './adapter/SbisFieldType';
export { default as SbisRecord } from './adapter/SbisRecord';
export { default as SbisTable } from './adapter/SbisTable';

// FIXME: deprecated implementation for externals
import GenericFormatMixinOrig from './adapter/GenericFormatMixin';
const GenericFormatMixin = GenericFormatMixinOrig.prototype;
export { GenericFormatMixin };
