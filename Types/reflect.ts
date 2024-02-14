/**
 * Библиотека содержащая инструменты для работы с информацией о типах.
 *
 * @library Types/reflect
 * @public
 */

export { typeDescriptor, TypeDescriptor } from './_reflect/TypeDescriptor';
export {
    IType,
    IProperty,
    ISourceArguments,
    ITypeSource,
    ITypeDescription,
    IPropertyArrayItem,
} from './_reflect/IType';

export {
    findConvertableTypes,
    convertValueOfMeta,
    isEqual,
    isMetaConvertable,
    getRequiredAttrs,
    isTrivialConvertable,
    isDeepConvertable,
    findContentAttributes,
    implementsInterface,
    isContentMetaType,
    isInjectable,
} from './_reflect/conversion/base';
