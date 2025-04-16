import JsonTable from 'Types/_entity/adapter/JsonTable';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';

interface IData {
    id: number;
    lastname: string;
}

describe('Types/_entity/adapter/JsonTable', () => {
    let data: IData[];
    let adapter: JsonTable;

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

        adapter = new JsonTable(data);
    });

    describe('.getFields()', () => {
        test('should return fields list', () => {
            expect(adapter.getFields()).toEqual(['id', 'lastname']);
        });

        test('should return fields use each row', () => {
            const data = [
                {
                    foo: 1,
                },
                {
                    foo: 2,
                    bar: 3,
                },
                {
                    baz: 4,
                },
            ];
            const adapter = new JsonTable(data);

            expect(adapter.getFields()).toEqual(['foo', 'bar', 'baz']);
        });

        test('should return an empty array for no data', () => {
            const adapter = new JsonTable();
            const fields = adapter.getFields();
            expect(fields).toBeInstanceOf(Array);
            expect(fields.length).toBe(0);
        });
    });

    describe('.getCount()', () => {
        test('should return records count', () => {
            expect(adapter.getCount()).toBe(7);

            expect(new JsonTable([]).getCount()).toBe(0);

            expect(new JsonTable({} as any).getCount()).toBe(0);

            expect(new JsonTable('' as any).getCount()).toBe(0);

            expect(new JsonTable(0 as any).getCount()).toBe(0);

            expect(new JsonTable().getCount()).toBe(0);
        });
    });

    describe('.add()', () => {
        test('should append a record', () => {
            adapter.add({
                id: 30,
            });

            expect(8).toBe(data.length);

            expect(30).toBe(data[data.length - 1].id);
        });

        test('should prepend a record', () => {
            adapter.add(
                {
                    id: 31,
                },
                0
            );

            expect(8).toBe(data.length);

            expect(31).toBe(data[0].id);
        });

        test('should insert a record', () => {
            adapter.add(
                {
                    id: 32,
                },
                2
            );

            expect(8).toBe(data.length);

            expect(32).toBe(data[2].id);
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                adapter.add(
                    {
                        id: 33,
                    },
                    100
                );
            }).toThrow();

            expect(() => {
                adapter.add(
                    {
                        id: 34,
                    },
                    -1
                );
            }).toThrow();
        });
    });

    describe('.at()', () => {
        test('should return valid record', () => {
            //@ts-ignore
            expect(1).toBe(adapter.at(0).id);

            //@ts-ignore
            expect(3).toBe(adapter.at(2).id);
        });

        test('should return undefined on invalid position', () => {
            expect(adapter.at(-1)).not.toBeDefined();

            expect(adapter.at(99)).not.toBeDefined();
        });

        test('should return undefined on invalid data', () => {
            //@ts-ignore
            expect(new JsonTable({} as any).at(undefined)).not.toBeDefined();

            //@ts-ignore
            expect(new JsonTable('' as any).at(undefined)).not.toBeDefined();

            //@ts-ignore
            expect(new JsonTable(0 as any).at(undefined)).not.toBeDefined();

            //@ts-ignore
            expect(new JsonTable().at(undefined)).not.toBeDefined();
        });
    });

    describe('.remove()', () => {
        test('should remove the record', () => {
            adapter.remove(0);
            expect(2).toBe(data[0].id);

            adapter.remove(2);
            expect(5).toBe(data[2].id);

            adapter.remove(5);
            expect(data[5]).not.toBeDefined();
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                adapter.remove(-1);
            }).toThrow();
            expect(() => {
                adapter.remove(99);
            }).toThrow();
        });
    });

    describe('.replace()', () => {
        test('should replace the record', () => {
            adapter.replace(
                {
                    id: 11,
                },
                0
            );
            expect(11).toBe(data[0].id);

            adapter.replace(
                {
                    id: 12,
                },
                4
            );
            expect(12).toBe(data[4].id);
        });

        test('should throw an error on invalid position', () => {
            expect(() => {
                adapter.replace({}, -1);
            }).toThrow();
            expect(() => {
                adapter.replace({}, 99);
            }).toThrow();
        });
    });

    describe('.move()', () => {
        test('should move Smith instead Geller', () => {
            adapter.move(0, 2);
            expect('Green').toBe(data[0].lastname);
            expect('Geller').toBe(data[1].lastname);
            expect('Smith').toBe(data[2].lastname);
        });

        test('should move Geller instead Smith', () => {
            adapter.move(2, 0);
            expect('Geller').toBe(data[0].lastname);
            expect('Smith').toBe(data[1].lastname);
            expect('Green').toBe(data[2].lastname);
        });

        test('should move Green to the end', () => {
            adapter.move(1, 6);
            expect('Green').toBe(data[6].lastname);
            expect('Tyler').toBe(data[5].lastname);
        });

        test('should not move Green', () => {
            adapter.move(1, 1);
            expect('Green').toBe(data[1].lastname);
            expect('Buffay').toBe(data[5].lastname);
        });
    });

    describe('.merge()', () => {
        test('should merge two records', () => {
            adapter.merge(0, 1, 'id');
            expect('Green').toBe(data[0].lastname);
        });
    });

    describe('.copy()', () => {
        test('should copy the record', () => {
            const copy = adapter.copy(1);
            expect(copy).toEqual(data[1]);
        });

        test('should insert a copy after the original', () => {
            const copy = adapter.copy(1);
            expect(copy).toBe(data[2]);
        });
    });

    describe('.clear()', () => {
        test('should return an empty table', () => {
            expect(data.length > 0).toBe(true);
            adapter.clear();
            expect(adapter.getData().length).toBe(0);
        });
        test('should return a same instance', () => {
            adapter.clear();
            expect(data).toBe(adapter.getData());
        });
    });

    describe('.getData()', () => {
        test('should return raw data', () => {
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.getFormat()', () => {
        test('should return exists field format', () => {
            const format = adapter.getFormat('id');
            expect(format.getName()).toBe('id');
        });

        test('should return field format for any record', () => {
            const data = [
                {
                    foo: 1,
                },
                {
                    bar: 2,
                },
                {
                    baz: 3,
                },
            ];
            const adapter = new JsonTable(data);

            expect(adapter.getFormat('foo').getName()).toBe('foo');
            expect(adapter.getFormat('bar').getName()).toBe('bar');
            expect(adapter.getFormat('baz').getName()).toBe('baz');
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.getFormat('Some');
            }).toThrow();
        });
    });

    describe('.getTypeName()', () => {
        test('should return default type name for recordset', () => {
            const typeName = adapter.getTypeName();
            expect(typeName).toBe('record');
        });
    });

    describe('.setTypeName()', () => {
        test('should set type name for recordset', () => {
            adapter.setTypeName('TestType');
            const typeName = adapter.getTypeName();
            expect(typeName).toBe('TestType');
        });
    });

    describe('.addField()', () => {
        test('should add a new field', () => {
            const fieldName = 'New';
            const field = fieldsFactory({
                type: 'string',
                name: fieldName,
            });
            adapter.addField(field, 0);
            expect(adapter.getFormat(fieldName).getName()).toBe(fieldName);
        });

        test('should use a field default value', () => {
            const fieldName = 'New';
            const def = 'abc';
            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: fieldName,
                    defaultValue: def,
                }),
                undefined
            );
            for (let i = 0; i < adapter.getCount(); i++) {
                //@ts-ignore
                expect(adapter.at(i)[fieldName]).toBe(def);
            }
        });

        test("should don't throw an error for already exists field", () => {
            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: 'id',
                }),
                undefined
            );
        });

        test('should throw an error for not a field', () => {
            expect(() => {
                //@ts-ignore
                adapter.addField(undefined, undefined);
            }).toThrow();

            expect(() => {
                //@ts-ignore
                adapter.addField(null, undefined);
            }).toThrow();

            expect(() => {
                adapter.addField(
                    {
                        type: 'string',
                        name: 'foo',
                    } as any,
                    undefined
                );
            }).toThrow();
        });
    });

    describe('.removeField()', () => {
        test('should remove exists field', () => {
            const name = 'id';
            adapter.removeField(name);
            for (let i = 0; i < adapter.getCount(); i++) {
                //@ts-ignore
                expect(adapter.at(i)[name]).not.toBeDefined();
            }
            expect(() => {
                adapter.getFormat(name);
            }).toThrow();
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.removeField('Some');
            }).toThrow();
        });
    });

    describe('.removeFieldAt()', () => {
        test('should throw an error', () => {
            expect(() => {
                adapter.removeFieldAt(0);
            }).toThrow();
        });
    });
});
