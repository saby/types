import { RecordSet } from 'Types/collection';
import { Record as TypesRecord, adapter, format } from 'Types/entity';

import {
    ITypeDesc,
    ITypeDescRecord,
    IMetaAttributeDesc,
    IMetaAttributeRecordDesc,
    IPropertyDesc,
    IPropertyRecordDesc,
    IComplexTypeDesc,
    IComplexTypeRecordDesc,
} from 'MetaUnit/sampleData/ServiceFormat';

import { hasComplexTypeDesc } from 'MetaUnit/utils/typeGuards';

type TServiceResponse = RecordSet<ITypeDescRecord, TypesRecord<ITypeDescRecord>>;

function buildServiceResponse(desc: ITypeDesc): TServiceResponse {
    const result = new RecordSet<ITypeDescRecord, TypesRecord<ITypeDescRecord>>({
        format: typeDescFormat,
        adapter: new adapter.Sbis(),
    });

    result.add(buildTypeDescRecord(desc));

    return result;
}

function buildTypeDescRecord(desc: ITypeDesc | IComplexTypeDesc): TypesRecord<ITypeDescRecord> {
    const typeRec = new TypesRecord<ITypeDescRecord>({
        format: typeDescFormat,
        adapter: new adapter.Sbis(),
    });

    typeRec.set('Id', desc.Id);
    typeRec.set('TypeId', desc.TypeId);
    typeRec.set('MetaType', desc.MetaType);
    typeRec.set('Version', desc.Version);
    typeRec.set('Inherits', desc.Inherits);
    typeRec.set('InheritsHierarchy', desc.InheritsHierarchy);
    typeRec.set('HasOverrides', desc.HasOverrides);

    if (desc.Elements) {
        typeRec.set('Elements', desc.Elements);
    }

    if (desc.MetaAttributes) {
        typeRec.set('MetaAttributes', buildMetaAttributesRs(desc.MetaAttributes));
    }

    if (desc.Properties) {
        typeRec.set('Properties', buildPropertiesRs(desc.Properties));
    }

    if (hasComplexTypeDesc(desc)) {
        typeRec.set('ComplexTypes', buildComplexTypesRs(desc.ComplexTypes));
    }

    return typeRec;
}

function buildMetaAttributesRs(
    metaAttributes: IMetaAttributeDesc[]
): RecordSet<IMetaAttributeRecordDesc, TypesRecord<IMetaAttributeRecordDesc>> {
    const metaAttriburesRs = new RecordSet<
        IMetaAttributeRecordDesc,
        TypesRecord<IMetaAttributeRecordDesc>
    >({
        format: metaAttributesFormat,
        adapter: new adapter.Sbis(),
    });

    metaAttributes.forEach((metaAttribute) => {
        const metaAttrRec = new TypesRecord<IMetaAttributeRecordDesc>({
            format: metaAttributesFormat,
            adapter: new adapter.Sbis(),
        });

        metaAttrRec.set('Name', metaAttribute.Name);
        metaAttrRec.set('Type', metaAttribute.Type);

        switch (metaAttribute.Type) {
            case 'complexeditors':
                metaAttrRec.set(
                    'Value',
                    new TypesRecord({
                        format: {
                            value: { type: 'object', defaultValue: metaAttribute.Value.value },
                        },
                        adapter: new adapter.Sbis(),
                    })
                );
                break;
            default:
                metaAttrRec.set(
                    'Value',
                    TypesRecord.fromObject(metaAttribute.Value, new adapter.Sbis())
                );
                break;
        }

        metaAttriburesRs.add(metaAttrRec);
    });

    return metaAttriburesRs;
}

function buildPropertiesRs(
    properties: IPropertyDesc[]
): RecordSet<IPropertyRecordDesc, TypesRecord<IPropertyRecordDesc>> {
    const propertiesRs = new RecordSet<IPropertyRecordDesc, TypesRecord<IPropertyRecordDesc>>({
        format: propertiesFormat,
        adapter: new adapter.Sbis(),
    });

    properties.forEach((property) => {
        const propertyRec = new TypesRecord<IPropertyRecordDesc>({
            format: propertiesFormat,
            adapter: new adapter.Sbis(),
        });

        propertyRec.set('Id', property.Id);
        propertyRec.set('Name', property.Name);
        propertyRec.set('Type', property.Type);
        propertyRec.set('MetaType', property.MetaType);
        propertyRec.set('IsArray', property.IsArray);

        propertyRec.set('MetaAttributes', buildMetaAttributesRs(property.MetaAttributes));

        propertiesRs.add(propertyRec);
    });

    return propertiesRs;
}

function buildComplexTypesRs(
    types: IComplexTypeDesc[] = []
): RecordSet<IComplexTypeRecordDesc, TypesRecord<IComplexTypeRecordDesc>> {
    const typesRs = new RecordSet<IComplexTypeRecordDesc, TypesRecord<IComplexTypeRecordDesc>>({
        format: typeDescFormat,
        adapter: new adapter.Sbis(),
    });

    types.forEach((type) => {
        typesRs.add(buildTypeDescRecord(type));
    });

    return typesRs;
}

const typeDescFormat: Record<string, format.IShortDeclaration> = {
    Id: { type: 'uuid' },
    TypeId: { type: 'string' },
    MetaType: { type: 'string' },
    Version: { type: 'string' },
    Inherits: { type: 'array', kind: 'string' },
    InheritsHierarchy: { type: 'array', kind: 'string' },
    HasOverrides: { type: 'boolean' },
    MetaAttributes: { type: 'recordset' },
    Properties: { type: 'recordset' },
    ComplexTypes: { type: 'recordset' },
    Elements: { type: 'object' },
};

const metaAttributesFormat: Record<string, format.IShortDeclaration> = {
    Name: { type: 'string' },
    Type: { type: 'string' },
    Value: { type: 'record' },
};

const propertiesFormat: Record<string, format.IShortDeclaration> = {
    Id: { type: 'uuid' },
    Name: { type: 'string' },
    Type: { type: 'string' },
    MetaType: { type: 'string' },
    IsArray: { type: 'boolean' },
    MetaAttributes: { type: 'recordset' },
};

export { buildServiceResponse, TServiceResponse };
