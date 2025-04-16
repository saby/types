import { ITypeDesc, IComplexTypeDesc } from 'MetaUnit/sampleData/ServiceFormat';

function hasComplexTypeDesc(desc: ITypeDesc | IComplexTypeDesc): desc is ITypeDesc {
    return 'ComplexTypes' in desc;
}

export { hasComplexTypeDesc };
