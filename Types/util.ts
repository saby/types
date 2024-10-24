/**
 * Библиотека утилит.
 * @library
 * @public
 * @module
 */

/**
 * Глобальный объект
 */
const globalEnv: Record<string, any> = globalThis;

export { globalEnv as global };

export { default as logger, ILogger } from './_util/logger';
export { mixin, applyMixins } from './_util/mixin';

import * as object from './_util/object';
export { object };

export { default as protect } from './_util/protect';
export { default as deprecateExtend } from './_util/deprecateExtend';

export { default as splitTemplateString } from './_util/splitTemplateString';
