import JsonRecord from 'Types/_entity/adapter/JsonRecord';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';

interface IData {
    id: number;
    lastname: string;
    firstname: string;
    middlename: string;
}

describe('Types/_entity/adapter/JsonRecord', () => {
    let data: IData;
    let adapter: JsonRecord;

    beforeEach(() => {
        data = {
            id: 1,
            lastname: 'Smith',
            firstname: 'John',
            middlename: 'Joshua',
        };

        adapter = new JsonRecord(data);
    });

    describe('.get()', () => {
        test('should return the property value', () => {
            expect(1).toBe(adapter.get('id'));

            expect('Smith').toBe(adapter.get('lastname'));

            expect(adapter.get('position')).not.toBeDefined();

            expect(new JsonRecord({}).get('position')).not.toBeDefined();

            //@ts-ignore
            expect(new JsonRecord().get(undefined)).not.toBeDefined();

            //@ts-ignore
            expect(new JsonRecord('' as any).get(undefined)).not.toBeDefined();

            //@ts-ignore
            expect(new JsonRecord(0 as any).get(undefined)).not.toBeDefined();

            //@ts-ignore
            expect(new JsonRecord().get(undefined)).not.toBeDefined();
        });
    });

    describe('.set()', () => {
        test('should set the property value', () => {
            adapter.set('id', 20);
            expect(20).toBe(data.id);

            adapter.set('foo', 5);
            expect(5).toBe((data as any).foo);

            adapter.set('bar', undefined);
            expect((data as any).bar).not.toBeDefined();
        });

        test('should throw an error on invalid data', () => {
            expect(() => {
                //@ts-ignore
                adapter.set(undefined, undefined);
            }).toThrow();
            expect(() => {
                adapter.set('', undefined);
            }).toThrow();
            expect(() => {
                adapter.set(0 as any, undefined);
            }).toThrow();
        });
    });

    describe('.clear()', () => {
        test('should return an empty record', () => {
            expect(Object.keys(data).length).not.toEqual(0);
            adapter.clear();
            expect(Object.keys(adapter.getData()).length).toEqual(0);
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

    describe('.getFields()', () => {
        test('should return fields list', () => {
            expect(adapter.getFields()).toEqual(['id', 'lastname', 'firstname', 'middlename']);
        });
    });

    describe('.getFormat()', () => {
        test('should return exists field format', () => {
            const format = adapter.getFormat('id');
            expect(format.getName()).toBe('id');
        });

        test('should throw an error for not exists field', () => {
            expect(() => {
                adapter.getFormat('Some');
            }).toThrow();
        });
    });

    describe('.getTypeName()', () => {
        test('should return default type name for record', () => {
            const typeName = adapter.getTypeName();
            expect(typeName).toBe('record');
        });
    });

    describe('.setTypeName()', () => {
        test('should set type name for record', () => {
            adapter.setTypeName('TestType');
            const typeName = adapter.getTypeName();
            expect(typeName).toBe('TestType');
        });
    });

    describe('.addField()', () => {
        test('should add a new field', () => {
            const fieldName = 'foo';
            const field = fieldsFactory({
                type: 'string',
                name: fieldName,
            });
            adapter.addField(field, 0);
            expect(adapter.getFormat(fieldName).getName()).toBe(fieldName);
        });

        test('should use a field default value', () => {
            const fieldName = 'foo';
            const def = 'abc';

            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: fieldName,
                    defaultValue: def,
                }),
                0
            );
            expect(adapter.get(fieldName)).toBe(def);
        });

        test('should set already exists field', () => {
            adapter.addField(
                fieldsFactory({
                    type: 'string',
                    name: 'id',
                }),
                0
            );
            expect(data.id).toBe(1);
        });

        test('should throw an error for not a field', () => {
            expect(() => {
                //@ts-ignore
                adapter.addField(undefined, 0);
            }).toThrow();

            expect(() => {
                //@ts-ignore
                adapter.addField(null, 0);
            }).toThrow();

            expect(() => {
                adapter.addField(
                    {
                        type: 'string',
                        name: 'foo',
                    } as any,
                    0
                );
            }).toThrow();
        });
    });

    describe('.removeField()', () => {
        test('should remove exists field', () => {
            const name = 'id';
            const oldFields = adapter.getFields();
            adapter.removeField(name);

            expect(adapter.get(name)).not.toBeDefined();
            expect(adapter.getFields().indexOf(name)).toBe(-1);
            expect(adapter.getFields().length).toBe(oldFields.length - 1);
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
