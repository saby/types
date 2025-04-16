import { Record as TypesRecord } from 'Types/entity';
import { RecordSet } from 'Types/collection';

/**
 * Интерфейс описания типа
 * @private
 */
interface ITypeDesc {
    /**
     * Идентификатор записи типа в БД
     * Не используется на фронте
     */
    Id: string;
    /**
     * Системный идентификатор типа
     */
    TypeId: string;
    /**
     * Мета-тип (primitive, object, applicationObject)
     */
    MetaType: string;
    /**
     * Версия СДК типа
     */
    Version: string;
    /**
     * Наследуется от
     */
    Inherits?: string[];
    /**
     * Полная цепочка наследования
     */
    InheritsHierarchy?: string[];

    HasOverrides: boolean;
    /**
     * Мета-атрибуты типа
     */
    MetaAttributes?: IMetaAttributeDesc[];
    /**
     * Свойства объекта
     */
    Properties?: IPropertyDesc[];
    /**
     * Сложные типы, используемые внутри этого типа
     */
    ComplexTypes?: IComplexTypeDesc[];
    /**
     * Справочник возможных значений для вариативных типов, энамов и флагов
     */
    Elements?: ITypeElements[];
}

/**
 * Интерфейс описания элемента типа
 * @remark
 * Используется в вариативных типах, энамах и флагах
 * @private
 */
interface ITypeElements {
    display_group: string;
    display_name: string;
    id: string;
    metatype: string;
    tooltip: string;
    type: string;
}

/**
 * Интерфейс описания мета-атрибутов типа
 * @private
 */
type IMetaAttributeDesc = {
    Name: string;
} & TMetaAttributeValueForType;

/**
 * Интерфейс описания свойств объекта
 */
interface IPropertyDesc {
    Id: string;
    Name: string;
    Type: string;
    MetaType: string;
    IsArray: boolean;
    MetaAttributes: IMetaAttributeDesc[];
}

/**
 * Интерфейс описания сложных типов (не примитивы) в составе типа
 * @private
 */
type IComplexTypeDesc = Omit<ITypeDesc, 'ComplexTypes'>;

interface ITypeDescRecord {
    Id: string;
    TypeId: string;
    MetaType: string;
    Version: string;
    Inherits?: string[];
    InheritsHierarchy?: string[];
    HasOverrides: boolean;
    MetaAttributes?: RecordSet<IMetaAttributeRecordDesc, TypesRecord<IMetaAttributeRecordDesc>>;
    Properties?: RecordSet<IPropertyRecordDesc, TypesRecord<IPropertyRecordDesc>>;
    ComplexTypes?: RecordSet<IComplexTypeRecordDesc, TypesRecord<IComplexTypeRecordDesc>>;
    Elements?: ITypeElements[];
}

type TMetaValueType<T = unknown> = {
    value: T;
};

type TMetaAttributeValueForType =
    | { Type: 'title'; Value: TMetaValueType<string> }
    | { Type: 'description'; Value: TMetaValueType<string> }
    | { Type: 'readonly'; Value: TMetaValueType<boolean> }
    | { Type: 'category'; Value: TMetaValueType<string> }
    | { Type: 'hidden'; Value: TMetaValueType<boolean> }
    | { Type: 'validators'; Value: TMetaValueType<string[]> }
    | { Type: 'editor'; Value: TMetaValueType<string> }
    | { Type: 'editorProps'; Value: TMetaValueType<string> }
    | { Type: 'required'; Value: TMetaValueType<boolean> }
    | { Type: 'kaizen_zone'; Value: TMetaValueType<boolean> }
    | { Type: 'order'; Value: TMetaValueType<number> }
    | { Type: 'defaultValue'; Value: TMetaValueType<string> }
    | { Type: 'complexeditors'; Value: TMetaValueType<{ name: string; properties: string[] }[]> };

type IMetaAttributeRecordDesc = {
    Name: string;
    Type: string;
    Value: TypesRecord;
};

interface IPropertyRecordDesc {
    Id: string;
    Name: string;
    Type: string;
    MetaType: string;
    IsArray: boolean;
    MetaAttributes: RecordSet<IMetaAttributeRecordDesc, TypesRecord<IMetaAttributeRecordDesc>>;
}

type IComplexTypeRecordDesc = Omit<ITypeDescRecord, 'ComplexTypes'>;

export {
    ITypeDesc,
    ITypeDescRecord,
    IPropertyDesc,
    IMetaAttributeDesc,
    IMetaAttributeRecordDesc,
    IPropertyRecordDesc,
    IComplexTypeDesc,
    IComplexTypeRecordDesc,
};
