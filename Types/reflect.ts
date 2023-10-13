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
    checkMetaConvertibility,
    getRequiredAttrs,
    isTrivialConvertable,
    isDeepConvertable,
    findContentAttributes,
    implementsInterface,
    isContentMetaType,
} from './_reflect/conversion/base';
