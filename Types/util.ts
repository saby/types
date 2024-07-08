/**
 * Библиотека утилит.
 * @library Types/util
 * @includes logger Types/_util/logger
 * @includes object Types/_util/object
 * @includes mixin Types/_util/mixin
 * @includes protect Types/_util/protect
 * @includes splitTemplateString Types/_util/splitTemplateString
 * @public
 */

const globalEnv = globalThis;
export { globalEnv as global };

export { default as logger, ILogger } from './_util/logger';
export { mixin, applyMixins } from './_util/mixin';

import * as object from './_util/object';
export { object };

export { default as protect } from './_util/protect';
export { default as deprecateExtend } from './_util/deprecateExtend';

export { default as splitTemplateString } from './_util/splitTemplateString';
