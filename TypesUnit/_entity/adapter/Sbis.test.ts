import SbisAdapter from 'Types/_entity/adapter/Sbis';
import SbisTable from 'Types/_entity/adapter/SbisTable';
import SbisRecord from 'Types/_entity/adapter/SbisRecord';
import { ITableFormat } from 'Types/_entity/adapter/SbisFormatMixin';
import 'Core/Date';

describe('Types/_entity/adapter/Sbis', () => {
    let data: ITableFormat;
    let adapter: SbisAdapter;

    beforeEach(() => {
        data = {
            d: [
                [1, 'Smith'],
                [2, 'Green'],
                [3, 'Geller'],
                [4, 'Bing'],
                [5, 'Tribbiani'],
                [6, 'Buffay'],
                [7, 'Tyler'],
            ],
            s: [
                { n: 'id', t: 'Число целое' },
                { n: 'lastname', t: 'Строка' },
            ],
        };

        adapter = new SbisAdapter();
    });

    describe('.forTable()', () => {
        test('should return table adapter', () => {
            expect(adapter.forTable()).toBeInstanceOf(SbisTable);
        });

        test('should pass data to the table adapter', () => {
            const data = { d: [], s: [] };
            expect(adapter.forTable(data).getData()).toBe(data);
        });
    });

    describe('.forRecord()', () => {
        test('should return record adapter', () => {
            expect(adapter.forRecord()).toBeInstanceOf(SbisRecord);
        });

        test('should pass data to the record adapter', () => {
            const data = { d: [], s: [] };
            expect(adapter.forRecord(data).getData()).toBe(data);
        });
    });

    describe('.getKeyField()', () => {
        test('should return first field prefixed with "@"', () => {
            const data = {
                d: [],
                s: [
                    { n: 'id', t: 'Число целое' },
                    { n: '@lastname', t: 'Строка' },
                ],
            };
            expect(adapter.getKeyField(data)).toEqual('@lastname');
        });

        test('should return first field', () => {
            expect(adapter.getKeyField(data)).toEqual('id');
        });
    });

    describe('.getProperty()', () => {
        test('should return the property value', () => {
            expect(123).toBe(
                adapter.getProperty(
                    {
                        items: data,
                        total: 123,
                    },
                    'total'
                )
            );

            expect(456).toBe(
                adapter.getProperty(
                    {
                        d: data.d,
                        s: data.s,
                        n: 456,
                    },
                    'n'
                )
            );

            expect(789).toBe(
                adapter.getProperty(
                    {
                        employees: {
                            d: data.d,
                            s: data.s,
                            n: 789,
                        },
                    },
                    'employees.n'
                )
            );

            expect(adapter.getProperty(data, 'total')).not.toBeDefined();

            //@ts-ignore
            expect(adapter.getProperty(data, undefined)).not.toBeDefined();
        });

        test('should return undefined on invalid data', () => {
            //@ts-ignore
            expect(adapter.getProperty({}, undefined)).not.toBeDefined();
            //@ts-ignore
            expect(adapter.getProperty('', undefined)).not.toBeDefined();
            //@ts-ignore
            expect(adapter.getProperty(0, undefined)).not.toBeDefined();
            //@ts-ignore
            expect(adapter.getProperty(undefined, undefined)).not.toBeDefined();
        });
    });

    describe('.setProperty()', () => {
        test('should set the property value', () => {
            adapter.setProperty(data, 'n', 456);

            expect(456).toBe(data.n);
            expect(1).toBe(data.d[0][0]);
            expect(5).toBe(data.d[4][0]);
            expect('Buffay').toBe(data.d[5][1]);

            const moreData = {
                employees: {
                    items: data,
                    total: 789,
                },
            };
            adapter.setProperty(moreData, 'employees.total', 987);
            expect(987).toBe(moreData.employees.total);
            expect(1).toBe(moreData.employees.items.d[0][0]);
            expect(5).toBe(moreData.employees.items.d[4][0]);
            expect('Buffay').toBe(moreData.employees.items.d[5][1]);

            adapter.setProperty(data, 'c.d.e.f', 'g');
            expect('g').toBe((data as any).c.d.e.f);

            expect(1).toBe(moreData.employees.items.d[0][0]);
            expect(5).toBe(moreData.employees.items.d[4][0]);
            expect('Buffay').toBe(moreData.employees.items.d[5][1]);
        });
    });

    describe('::fromJSON()', () => {
        test('should return instance which could produce valid record adapter for normalized data', () => {
            const adapter = SbisAdapter.fromJSON({
                $serialized$: 'inst',
                module: 'Sbis',
                id: 1,
                state: {
                    $options: {},
                },
            });

            const getNestedFormat = () => {
                return [{ t: 'Строка', n: 'sub' }];
            };

            const getNestedRecord = (link: boolean = false) => {
                if (link) {
                    return { d: ['str'], f: 0 };
                }

                return { d: ['str'], s: getNestedFormat(), f: 0 };
            };

            const recordData = {
                d: [getNestedRecord(), getNestedRecord(true)],
                s: [
                    { t: 'Запись', n: 'foo' },
                    { t: 'Запись', n: 'bar' },
                ],
            };

            //@ts-ignore
            const recordAdapter = adapter.forRecord(recordData);

            expect(recordAdapter.get('foo').s).toEqual(getNestedFormat());

            expect(recordAdapter.get('bar').s).toEqual(getNestedFormat());
        });
    });
});
