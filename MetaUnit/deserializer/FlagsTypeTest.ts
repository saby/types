import { deserialize, FlagsMeta, Meta } from 'Meta/types';
import { buildServiceResponse, TServiceResponse } from 'MetaUnit/utils/buildServiceResponse';
import { enumDesc } from 'MetaUnit/sampleData/flags.sample';

describe('Десериализация FlagsType', () => {
    let meta: FlagsMeta<any>;
    beforeAll(() => {
        // @ts-ignore нужно исправить тип функции deserialize
        const metas = deserialize<TServiceResponse>(
            buildServiceResponse(enumDesc),
            true
        ) as unknown as FlagsMeta<any>[];
        meta = metas[0];
    });

    it('Десериализовался инстанс класса FlagsType', () => {
        expect(meta).toBeInstanceOf(FlagsMeta);
    });

    it('Десериализовался идентификатор типа', () => {
        expect(meta.getId()).toEqual('DayOfWeek');
    });

    describe('Десериализация элементов флага', () => {
        it('Есть все элементы', () => {
            expect(meta.getElements()).toHaveLength(7);

            const expectedIds = [
                'MONDAY',
                'TUESDAY',
                'WEDNESDAY',
                'THURSDAY',
                'FRIDAY',
                'SATURDAY',
                'SUNDAY',
            ];

            expect(meta.getElements().map((meta) => meta.getId())).toEqual(expectedIds);
        });

        it('Все элементы являются экземпляром класса Meta', () => {
            for (const elementMeta of meta.getElements()) {
                expect(elementMeta).toBeInstanceOf(Meta);
            }
        });

        it('Указано название у элементов', () => {
            expect(meta.getElements()).toHaveLength(7);

            const expectedIds = [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
            ];

            expect(meta.getElements().map((meta) => meta.getTitle())).toEqual(expectedIds);
        });

        it('Указано описание у элементов', () => {
            expect(meta.getElements()).toHaveLength(7);

            const expectedIds = [
                'Monday desc',
                'Tuesday desc',
                'Wednesday desc',
                'Thursday desc',
                'Friday desc',
                'Saturday desc',
                'Sunday desc',
            ];

            expect(meta.getElements().map((meta) => meta.getDescription())).toEqual(expectedIds);
        });

        it('Указана группа у элементов', () => {
            for (const elementMeta of meta.getElements()) {
                expect(elementMeta.getGroup()).toEqual({
                    name: 'Weeks',
                    uid: 'Weeks',
                });
            }
        });
    });
});
