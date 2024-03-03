/**
 * @kaizen_zone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
/**
 * Библиотека, улучшающая работу с объектами.
 * @library Types/object
 * @includes isEqual Types/_object/isEqual
 * @includes merge Types/_object/merge
 * @includes merge Types/_object/clone
 * @includes isEmpty Types/_object/isEmpty
 * @includes isPlainObject Types/_object/isPlainObject
 * @public
 */

export { default as isEqual } from './_object/isEqual';
export { default as merge } from './_object/merge';
export { default as clone } from './_object/clone';
export { default as isEmpty } from './_object/isEmpty';
export { default as isPlainObject } from './_object/isPlainObject';
