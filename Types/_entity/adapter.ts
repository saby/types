/**
 * Библиотека адаптеров.
 * @library
 * @public
 * @module
 */

export { default as Abstract } from './adapter/Abstract';
export { default as Cow } from './adapter/Cow';
export { default as Json } from './adapter/Json';
export { default as JsonTable } from './adapter/JsonTable';
export { default as JsonRecord } from './adapter/JsonRecord';
export { default as IAdapter } from './adapter/IAdapter';
export { default as IDataHolder } from './adapter/IDataHolder';
export { default as IDecorator, isDecorator } from './adapter/IDecorator';
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
export {
    IFieldFormat as ISbisFieldFormat,
    IFieldType as ISbisFieldType,
    IRecordMarkedFormat as ISbisRecordMarkedFormat,
    ITableMarkedFormat as ISbisTableMarkedFormat,
    ITableFormat as ISbisTableFormat,
    IRecordFormat as ISbisRecordFormat
} from './adapter/SbisFormatMixin';

// FIXME: deprecated implementation for externals
import GenericFormatMixinOrig from './adapter/GenericFormatMixin';

/**
 *
 */
export const GenericFormatMixin = GenericFormatMixinOrig.prototype;
