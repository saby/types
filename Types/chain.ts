/**
 * @kaizen_zone 9c01798e-b1a1-4cd2-8916-d5852805ea82
 */
/**
 * Библиотека, которая обеспечивает цепные ленивые вычисления для различных видов коллекций.
 * @library Types/chain
 * @includes factory Types/_chain/factory
 * @includes Abstract Types/_chain/Abstract
 * @public
 */

/*
 * Library that provides chained lazy calculations over various kinds of collections.
 * @library Types/chain
 * @includes factory Types/_chain/factory
 * @includes Abstract Types/_chain/Abstract
 * @public
 * @author Буранов А.Р.
 */

import { default as factory, registerFactory } from './_chain/factory';
// registration on library level is needed for proper lazy library initialization.
registerFactory();
export { factory };
export { default as Abstract } from './_chain/Abstract';
export { default as Objectwise } from './_chain/Objectwise';
