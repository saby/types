import JsonAdapter from 'Types/_entity/adapter/Json';
import JsonTable from 'Types/_entity/adapter/JsonTable';
import JsonRecord from 'Types/_entity/adapter/JsonRecord';

interface IData {
    id: number;
    lastname: string;
}

describe('Types/_entity/adapter/Json', () => {
    let data: IData[];
    let adapter: JsonAdapter;

    beforeEach(() => {
        data = [
            {
                id: 1,
                lastname: 'Smith',
            },
            {
                id: 2,
                lastname: 'Green',
            },
            {
                id: 3,
                lastname: 'Geller',
            },
            {
                id: 4,
                lastname: 'Bing',
            },
            {
                id: 5,
                lastname: 'Tribbiani',
            },
            {
                id: 6,
                lastname: 'Buffay',
            },
            {
                id: 7,
                lastname: 'Tyler',
            },
        ];

        adapter = new JsonAdapter();
    });

    describe('.forTable()', () => {
        test('should return table adapter', () => {
            expect(adapter.forTable()).toBeInstanceOf(JsonTable);
        });

        test('should pass data to the table adapter', () => {
            const data = [{ a: 1 }, { b: 2 }];
            expect(adapter.forTable(data).getData()).toBe(data);
        });
    });

    describe('.forRecord()', () => {
        test('should return record adapter', () => {
            expect(adapter.forRecord()).toBeInstanceOf(JsonRecord);
        });

        test('should pass data to the record adapter', () => {
            const data = { a: 1 };
            expect(adapter.forRecord(data).getData()).toBe(data);
        });
    });

    describe('.getKeyField()', () => {
        test('should return undefined', () => {
            expect(adapter.getKeyField(data)).not.toBeDefined();
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
                        employees: {
                            items: data,
                            total: 456,
                        },
                    },
                    'employees.total'
                )
            );

            expect(
                adapter.getProperty(
                    {
                        items: data,
                    },
                    'total'
                )
            ).not.toBeDefined();

            expect(
                adapter.getProperty(
                    {
                        items: data,
                    },
                    //@ts-ignore
                    undefined
                )
            ).not.toBeDefined();
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
            const dataA = {
                items: data,
                total: 123,
            };
            adapter.setProperty(dataA, 'total', 456);

            expect(456).toBe(dataA.total);
            expect(1).toBe(dataA.items[0].id);
            expect(5).toBe(dataA.items[4].id);
            expect('Buffay').toBe(dataA.items[5].lastname);

            const dataB = {
                employees: {
                    items: data,
                    total: 789,
                },
            };
            adapter.setProperty(dataB, 'employees.total', 987);
            expect(987).toBe(dataB.employees.total);
            expect(1).toBe(dataB.employees.items[0].id);
            expect(5).toBe(dataB.employees.items[4].id);
            expect('Buffay').toBe(dataB.employees.items[5].lastname);

            const dataC = {
                a: 1,
                b: 2,
            };
            adapter.setProperty(dataC, 'c.d.e.f', 'g');
            expect('g').toBe((dataC as any).c.d.e.f);
            expect(1).toBe(dataC.a);
            expect(2).toBe(dataC.b);
        });
    });
});
