import { TMetaJsonNewSingle } from 'Meta/_types/marshalling/format';

/**
 * Возвращает описание типа из сериализованного результата
 * @param serialized
 * @param typeName
 */
function findTypeInSerialized(
    serialized: TMetaJsonNewSingle[],
    typeName: string
): TMetaJsonNewSingle | undefined {
    return serialized.find((meta) => meta.id === typeName);
}

export { findTypeInSerialized };
