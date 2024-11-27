/**
 * Библиотека энумераторов.
 * @library
 * @public
 * @module
 */

export {
    default as Arraywise,
    ResolveFunc as ArraywiseResolveFunc,
    FilterFunc as ArraywiseFilterFunc
} from './enumerator/Arraywise';
export { default as Mapwise } from './enumerator/Mapwise';
export { default as Objectwise } from './enumerator/Objectwise';
