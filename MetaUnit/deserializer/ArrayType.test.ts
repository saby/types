import { deserialize, ArrayMeta, ObjectMeta } from 'Meta/types';
import { buildServiceResponse, TServiceResponse } from 'MetaUnit/utils/buildServiceResponse';
import { arrayDesc } from 'MetaUnit/sampleData/array.sample';

describe('Десериализация ArrayType', () => {
    let meta: ArrayMeta<any>;
    beforeAll(() => {
        // @ts-ignore нужно исправить тип функции deserialize
        const metas = deserialize<TServiceResponse>(
            buildServiceResponse(arrayDesc),
            true
        ) as unknown as ObjectMeta<any>[];
        meta = metas[0].getProperties().Value as unknown as ArrayMeta<any>;
    });

    it('Десериализовался инстанс класса ArrayMeta', () => {
        expect(meta).toBeInstanceOf(ArrayMeta);
    });

    it('Сгенерировался идентификатор типа на основе внутреннего типа ArrayMeta', () => {
        expect(meta.getId()).toEqual('ArrayOf_TableInfo');
    });

    it('Десериализовалась иерархия наследования типа', () => {
        expect(meta.getInherits()).toEqual(['array', 'ArrayOf_TableInfo']);
    });
});
