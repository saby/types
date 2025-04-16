import { IObservable as IBindCollection, RecordSet } from 'Types/collection';
import { AdapterDescriptor, IModelProperty as IProperty, Model, Record } from 'Types/entity';
import { DateTime } from 'Types/_entity/applied';
import { Track } from 'Types/_entity/functor';
import fieldsFactory, { IDeclaration } from 'Types/_entity/format/fieldsFactory';
import JsonAdapter from 'Types/_entity/adapter/Json';
import SbisAdapter from 'Types/_entity/adapter/Sbis';
import CowAdapter from 'Types/_entity/adapter/Cow';
import { ITableFormat } from 'Types/_entity/adapter/SbisFormatMixin';
import { IHashMap } from 'Types/declarations';
import { Serializer } from 'UI/State';
import { IMetaDataMore } from 'Types/_collection/RecordSet';

const RecordState = Record.RecordState;

interface IItem {
    id: number;
    name: string;
}

describe('Types/_collection/RecordSet', () => {
    function getItems(): IItem[] {
        return [
            {
                id: 1,
                name: 'Ivanoff',
            },
            {
                id: 2,
                name: 'Petroff',
            },
            {
                id: 3,
                name: 'Sidoroff',
            },
            {
                id: 4,
                name: 'Puhoff',
            },
            {
                id: 5,
                name: 'Molotsoff',
            },
            {
                id: 6,
                name: 'Hangryoff',
            },
            {
                id: 7,
                name: 'Arbuzznoff',
            },
            {
                id: 8,
                name: 'Arbuzznoff',
            },
        ];
    }

    function getSomeItem(): IItem {
        return {
            id: 999,
            name: 'Test',
        };
    }

    function getSbisItems(): ITableFormat {
        return {
            d: [
                [1, 'Ivanoff'],
                [2, 'Petroff'],
                [3, 'Sidoroff'],
                [4, 'Puhoff'],
                [5, 'Molotsoff'],
                [6, 'Hangryoff'],
                [7, 'Arbuzznoff'],
                [8, 'Arbuzznoff'],
            ],
            s: [
                {
                    n: 'id',
                    t: 'Число целое',
                },
                {
                    n: 'name',
                    t: 'Строка',
                },
            ],
        };
    }

    function getItemsFormat(): IDeclaration[] {
        return [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'string' },
        ];
    }

    function getSbisFormat(): ITableFormat {
        return {
            d: [],
            s: [
                {
                    n: 'id',
                    t: 'Число целое',
                },
                {
                    n: 'name',
                    t: 'Строка',
                },
            ],
        };
    }

    let rs: RecordSet;
    let items: IItem[];

    beforeEach(() => {
        items = getItems();
        rs = new RecordSet({
            rawData: getItems(),
            keyProperty: 'id',
        });
    });

    afterEach(() => {
        rs.destroy();
    });

    describe('.constructor()', () => {
        test('should pass keyProperty to the record', () => {
            expect(rs.at(1).get('id')).toEqual(2);
        });
    });

    describe('.getEnumerator()', () => {
        test('should return records', () => {
            const enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBeInstanceOf(Record);
            }
        });

        test('should return all records', () => {
            const enumerator = rs.getEnumerator();
            let foundCount = 0;
            while (enumerator.moveNext()) {
                foundCount++;
            }
            expect(rs.getCount()).toEqual(foundCount);
        });

        test('should return records owned by itself', () => {
            const enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()?.getOwner()).toBe(rs);
            }
        });

        test('should return records with state "Unchanged"', () => {
            const enumerator = rs.getEnumerator();
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()?.getState()).toBe(RecordState.UNCHANGED);
            }
        });

        test('should return only records with state "Unchanged"', () => {
            const enumerator = rs.getEnumerator(RecordState.UNCHANGED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()?.getState()).toBe(RecordState.UNCHANGED);
                foundCount++;
            }
            expect(rs.getCount()).toEqual(foundCount);
        });

        test('should return no records with state "Changed"', () => {
            const enumerator = rs.getEnumerator(RecordState.CHANGED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            expect(found).toBe(false);
        });

        test('should return only records with state "Changed"', () => {
            rs.at(1).set('id', 'test');
            const enumerator = rs.getEnumerator(RecordState.CHANGED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()?.getState()).toBe(RecordState.CHANGED);
                foundCount++;
            }
            expect(foundCount).toEqual(1);
        });

        test('should return no records with state "Added"', () => {
            const enumerator = rs.getEnumerator(RecordState.ADDED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            expect(found).toBe(false);
        });

        test('should return only records with state "Added"', () => {
            rs.add(new Model());
            const enumerator = rs.getEnumerator(RecordState.ADDED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()?.getState()).toBe(RecordState.ADDED);
                foundCount++;
            }
            expect(foundCount).toEqual(1);
        });

        test('should return no records with state "Deleted"', () => {
            const enumerator = rs.getEnumerator(RecordState.DELETED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            expect(found).toBe(false);
        });

        test('should return only records with state "Deleted"', () => {
            rs.at(2).setState(RecordState.DELETED);
            const enumerator = rs.getEnumerator(RecordState.DELETED);
            let foundCount = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()?.getState()).toBe(RecordState.DELETED);
                foundCount++;
            }
            expect(foundCount).toEqual(1);
        });

        test('should return no records with state "Detached"', () => {
            const enumerator = rs.getEnumerator(RecordState.DETACHED);
            let found = false;
            while (enumerator.moveNext()) {
                found = true;
            }
            expect(found).toBe(false);
        });
    });

    describe('.each()', () => {
        test('should return records', () => {
            rs.each((record) => {
                expect(record).toBeInstanceOf(Record);
            });
        });

        test('should return all records', () => {
            let foundCount = 0;
            rs.each(() => {
                return foundCount++;
            });
            expect(rs.getCount()).toEqual(foundCount);
        });

        test('should return record indexes', () => {
            let expected = 0;
            //@ts-ignore
            rs.each((record, index) => {
                expect(index).toEqual(expected);
                expected++;
            });
        });

        test('should make call in self context', () => {
            rs.each(function (): void {
                //@ts-ignore
                expect(this).toBe(rs as any);
            });
        });

        test('should make call in given context if state is skipped', () => {
            const context = {};
            rs.each(function (): void {
                //@ts-ignore
                expect(this).toBe(context);
            }, context);
        });

        test('should make call in given context if state is used', () => {
            const context = {};
            rs.each(
                function (): void {
                    //@ts-ignore
                    expect(this).toBe(context);
                },
                RecordState.UNCHANGED,
                context
            );
        });

        test('should return records owned by itself', () => {
            rs.each((record) => {
                expect(record.getOwner()).toBe(rs);
            });
        });

        test('should return read only records from read only recordset', () => {
            const rs = new RecordSet({
                rawData: getItems(),
                writable: false,
            });
            rs.each((record) => {
                expect(record.writable).toBe(false);
            });
        });

        test('should return records with state "Unchanged"', () => {
            rs.each((record) => {
                expect(record.getState()).toBe(RecordState.UNCHANGED);
            });
        });

        test('should return only records with state "Unchanged"', () => {
            let foundCount = 0;
            rs.each((record) => {
                expect(record.getState()).toBe(RecordState.UNCHANGED);
                foundCount++;
            }, RecordState.UNCHANGED);
            expect(rs.getCount()).toEqual(foundCount);
        });

        test('should return no records with state "Changed"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.CHANGED);
            expect(found).toBe(false);
        });

        test('should return only records with state "Changed"', () => {
            rs.at(1).set('id', 'test');
            let foundCount = 0;
            rs.each((record) => {
                expect(record.getState()).toBe(RecordState.CHANGED);
                foundCount++;
            }, RecordState.CHANGED);
            expect(foundCount).toEqual(1);
        });

        test('should return no records with state "Added"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.ADDED);
            expect(found).toBe(false);
        });

        test('should return only records with state "Added"', () => {
            rs.add(new Model());
            let foundCount = 0;
            rs.each((record) => {
                expect(record.getState()).toBe(RecordState.ADDED);
                foundCount++;
            }, RecordState.ADDED);
            expect(foundCount).toEqual(1);
        });

        test('should return no records with state "Deleted"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.DELETED);
            expect(found).toBe(false);
        });

        test('should return only records with state "Deleted"', () => {
            rs.at(2).setState(RecordState.DELETED);
            let foundCount = 0;
            rs.each((record) => {
                expect(record.getState()).toBe(RecordState.DELETED);
                foundCount++;
            }, RecordState.DELETED);
            expect(foundCount).toEqual(1);
        });

        test('should return no records with state "Detached"', () => {
            let found = false;
            rs.each(() => {
                found = true;
            }, RecordState.DETACHED);
            expect(found).toBe(false);
        });
    });

    describe('.isEqual()', () => {
        test('should accept an invalid argument', () => {
            const rs = new RecordSet();
            expect(rs.isEqual(undefined)).toBe(false);
            expect(rs.isEqual(null)).toBe(false);
            expect(rs.isEqual(false)).toBe(false);
            expect(rs.isEqual(true)).toBe(false);
            expect(rs.isEqual(0)).toBe(false);
            expect(rs.isEqual(1)).toBe(false);
            expect(rs.isEqual({})).toBe(false);
            expect(rs.isEqual([])).toBe(false);
        });

        test('should return true for the same RecordSet', () => {
            const same = new RecordSet({
                rawData: getItems(),
            });
            expect(rs.isEqual(same)).toBe(true);
        });

        test('should return true for itself', () => {
            expect(rs.isEqual(rs)).toBe(true);
        });

        test('should return true for the clone', () => {
            expect(rs.isEqual(rs.clone())).toBe(true);
        });

        test('should return true for empties', () => {
            const rs = new RecordSet();
            expect(rs.isEqual(new RecordSet())).toBe(true);
        });

        test('should return false if record added', () => {
            const same = new RecordSet({
                rawData: getItems(),
            });
            same.add(rs.at(0).clone());
            expect(rs.isEqual(same)).toBe(false);
        });

        test('should return true if same record replaced', () => {
            const same = new RecordSet({
                rawData: getItems(),
            });
            same.replace(rs.at(0).clone(), 0);
            expect(rs.isEqual(same)).toBe(true);
        });

        test('should return false if not same record replaced', () => {
            const same = new RecordSet({
                rawData: getItems(),
            });
            same.replace(rs.at(1).clone(), 0);
            expect(rs.isEqual(same)).toBe(false);
        });

        test('should return false if record removed', () => {
            const same = new RecordSet({
                rawData: getItems(),
            });
            same.removeAt(0);
            expect(rs.isEqual(same)).toBe(false);
        });

        test('should return false if record updated', () => {
            const same = new RecordSet({
                rawData: getItems(),
            });
            same.at(0).set('name', 'Aaa');
            expect(rs.isEqual(same)).toBe(false);
        });
    });

    describe('.getRawData()', () => {
        test('should return the value that was passed to the constructor', () => {
            const data = [{}];
            const rs = new RecordSet({
                rawData: data,
            });
            expect(rs.getRawData()).toEqual(data);
        });

        test('should return the changed value after add a new record', () => {
            const rs = new RecordSet();
            const data = { a: 1 };
            rs.add(
                new Model({
                    rawData: data,
                })
            );
            expect(rs.getRawData()[0]).toEqual(data);
        });
    });

    describe('.setRawData()', () => {
        test('should return elem by index', () => {
            const rs = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            rs.setRawData([
                {
                    id: 1000,
                    name: 'Foo',
                },
                {
                    id: 1001,
                    name: 'Bar',
                },
            ]);
            expect(rs.getIndex(rs.at(1))).toEqual(1);
        });

        test('should replace a record', () => {
            const oldRec = rs.at(0);

            rs.setRawData([
                {
                    id: 1,
                    name: 'Foo',
                },
            ]);
            const newRec = rs.at(0);

            expect(oldRec).not.toEqual(newRec);
        });

        test('should change state of replaced record to "Detached"', () => {
            const oldRec = rs.at(0);

            rs.setRawData([
                {
                    id: 1,
                    name: 'Foo',
                },
            ]);

            expect(oldRec.getState()).toEqual(RecordState.DETACHED);
        });

        test('should trigger an event with valid arguments', () => {
            const given: any = {};
            let firesCount = 0;
            const handler = (
                //@ts-ignore
                event,
                //@ts-ignore
                action,
                //@ts-ignore
                newItems,
                //@ts-ignore
                newItemsIndex,
                //@ts-ignore
                oldItems,
                //@ts-ignore
                oldItemsIndex,
                //@ts-ignore
                reason
            ) => {
                given.action = action;
                given.newItems = newItems;
                given.newItemsIndex = newItemsIndex;
                given.oldItems = oldItems;
                given.oldItemsIndex = oldItemsIndex;
                given.reason = reason;
                firesCount++;
            };
            const oldCount = rs.getCount();

            rs.subscribe('onCollectionChange', handler);
            rs.setRawData([
                {
                    id: 1,
                    name: 'Ivanoff',
                },
                {
                    id: 2,
                    name: 'Petroff',
                },
                {
                    id: 13,
                    name: 'Sidoroff',
                },
            ]);
            rs.unsubscribe('onCollectionChange', handler);

            expect(firesCount).toBe(1);
            expect(given.action).toBe(IBindCollection.ACTION_RESET);
            expect(given.newItems.length).toBe(rs.getCount());
            expect(given.newItemsIndex).toBe(0);
            expect(given.oldItems.length).toBe(oldCount);
            expect(given.oldItemsIndex).toBe(0);
            expect(given.reason).toBe('setRawData');
        });
    });

    describe('.getFormat()', () => {
        test('should build the format from json raw data', () => {
            const format = rs.getFormat();
            expect(format.getCount()).toBe(2);
            expect(format.at(0).getName()).toBe('id');
            expect(format.at(1).getName()).toBe('name');
        });

        test('should return empty format for empty raw data', () => {
            const rs = new RecordSet();
            expect(rs.getFormat().getCount()).toBe(0);
        });

        test('should build the format from sbis raw data', () => {
            const data = getSbisItems();
            const rs = new RecordSet({
                rawData: data,
                adapter: 'Types/entity:adapter.Sbis',
            });
            const format = rs.getFormat();

            expect(format.getCount()).toBe(data.s.length);
            format.each((item, index) => {
                expect(item.getName()).toBe(data.s[index].n);
            });
        });

        test('should build the record format from declarative option', () => {
            const declaration = [
                {
                    name: 'id',
                    type: 'integer',
                },
                {
                    name: 'title',
                    type: 'string',
                },
                {
                    name: 'max',
                    type: 'integer',
                },
                {
                    name: 'main',
                    type: 'boolean',
                },
            ];
            const rs = new RecordSet({
                format: declaration,
                rawData: items,
            });
            const format = rs.getFormat();

            expect(format.getCount()).toBe(declaration.length);
            format.each((item, index) => {
                expect(item.getName()).toBe(declaration[index].name);
                expect(String(item.getType()).toLowerCase()).toBe(declaration[index].type);
            });
        });

        test("should build the format by Model's format if don't have it's own", () => {
            class Foo extends Model {
                // Nothing
            }
            Object.assign(Foo.prototype, {
                _$format: {
                    bar: Number,
                },
            });

            const rs = new RecordSet({
                model: Foo,
            });
            const format = rs.getFormat();

            expect(format.at(0).getName()).toBe('bar');
            expect(format.at(0).getType()).toBe(Number);
        });

        test('should return data for linked format', () => {
            const rs = new RecordSet({
                rawData: {
                    s: [
                        {
                            n: 'foo',
                            t: 'Запись',
                        },
                    ],
                    d: [
                        [
                            {
                                f: 1,
                                s: [{ n: 'First name', t: 'Строка' }],
                                d: ['John'],
                                t: 'Запись',
                            },
                        ],
                        [
                            {
                                f: 1,
                                d: ['Mike'],
                                t: 'Запись',
                            },
                        ],
                    ],
                    t: 'recordset',
                },
                adapter: 'Types/entity:adapter.Sbis',
            });

            expect(rs.at(1).get('foo').get('First name')).toBe('Mike');
        });
    });

    describe('.getTypeName()', () => {
        test('should return type name from adapter', () => {
            const rawData = getSbisItems();
            rawData.tp = 'User';

            const rs = new RecordSet({
                rawData,
                adapter: 'adapter.sbis',
            });

            const typeName = rs.getTypeName();

            expect(typeName).toBe('User');
        });
    });

    describe('.isTyped()', () => {
        test('should return true for typed record', () => {
            const rawData = getSbisItems();
            rawData.tp = 'User';

            const rs = new RecordSet({
                rawData,
                adapter: 'adapter.sbis',
            });

            expect(rs.isTyped()).toBe(true);
        });

        test('should return false for non-typed record', () => {
            const rs = new RecordSet({
                rawData: getSbisItems(),
                adapter: 'adapter.sbis',
            });

            expect(rs.isTyped()).toBe(false);
        });

        test('should return false for JSON-based record', () => {
            const rs = new RecordSet({
                rawData: getItems(),
            });

            expect(rs.isTyped()).toBe(false);
        });
    });

    describe('.addField()', () => {
        test('should add the field from the declaration for JSON adapter', () => {
            const keyProperty = 'id';
            const fieldName = 'login';
            const fieldDefault = 'user';
            const index = 0;

            rs = new RecordSet({
                rawData: getItems(),
                keyProperty,
            });

            // Force create indices
            rs.each((record) => {
                record.get(keyProperty);
            });

            rs.addField(
                {
                    name: fieldName,
                    type: 'string',
                    defaultValue: fieldDefault,
                },
                index
            );

            const format = rs.getFormat();
            expect(format.at(index).getName()).toBe(fieldName);
            expect(format.at(index).getDefaultValue()).toBe(fieldDefault);

            rs.each((record) => {
                const format = record.getFormat();
                expect(format.at(index).getName()).toBe(fieldName);
                expect(format.at(index).getDefaultValue()).toBe(fieldDefault);

                expect(record.get(fieldName)).toBe(fieldDefault);
            });
        });

        test('should add the field from the declaration for SBIS adapter', () => {
            const keyProperty = 'id';
            const index = 0;
            const fieldName = 'login';
            const fieldDefault = 'user';

            const rs = new RecordSet({
                rawData: getSbisItems(),
                adapter: 'Types/entity:adapter.Sbis',
                keyProperty,
            });

            // Force create indices
            rs.each((record) => {
                record.get(keyProperty);
            });

            rs.addField(
                {
                    name: fieldName,
                    type: 'string',
                    defaultValue: fieldDefault,
                },
                index
            );

            const format = rs.getFormat();
            expect(format.at(index).getName()).toBe(fieldName);
            expect(format.at(index).getDefaultValue()).toBe(fieldDefault);

            rs.each((record) => {
                const format = record.getFormat();
                expect(format.at(index).getName()).toBe(fieldName);
                expect(format.at(index).getDefaultValue()).toBe(fieldDefault);

                expect(record.get(fieldName)).toBe(fieldDefault);
            });
        });

        test('should set the field value for record with different format the use SBIS adapter', () => {
            const rs = new RecordSet<object, Record>({
                rawData: getSbisItems(),
                adapter: 'Types/entity:adapter.Sbis',
            });
            const recordS = rs.getRawData().s;
            const fieldName = 'name';

            recordS.pop();
            const record = new Record({
                rawData: {
                    d: [111],
                    s: recordS,
                },
                adapter: 'Types/entity:adapter.Sbis',
            });

            // Force create indices
            record.get(fieldName);

            const addedRecord = rs.add(record);

            addedRecord.set(fieldName, 'bar');
            expect(addedRecord.get(fieldName)).toBe('bar');
        });

        test('should add the field and set it value for the added record use SBIS adapter', () => {
            const keyProperty = 'id';
            const rs = new RecordSet<object, Record>({
                rawData: getSbisItems(),
                adapter: 'Types/entity:adapter.Sbis',
                keyProperty,
            });
            const record = new Record({
                rawData: {
                    d: [111, 'foo'],
                    s: rs.getRawData().s,
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const index = 0;
            const fieldName = 'login';
            const fieldDefault = 'user';

            // Force create indices
            record.get(keyProperty);

            rs.addField(
                {
                    name: fieldName,
                    type: 'string',
                    defaultValue: fieldDefault,
                },
                index
            );

            const addedRecord = rs.add(record);
            addedRecord.set(fieldName, 'bar');

            expect(addedRecord.get(fieldName)).toBe('bar');
        });

        test('should add the field from the instance', () => {
            const fieldName = 'login';
            const fieldDefault = 'username';

            rs.addField(
                fieldsFactory({
                    name: fieldName,
                    type: 'string',
                    defaultValue: fieldDefault,
                })
            );
            const index = rs.getFormat().getCount() - 1;

            expect(rs.getFormat().at(index).getName()).toBe(fieldName);
            expect(rs.getFormat().at(index).getDefaultValue()).toBe(fieldDefault);
            rs.each((record) => {
                expect(record.get(fieldName)).toBe(fieldDefault);
                expect(record.getRawData()[fieldName]).toBe(fieldDefault);
            });
        });

        test('should define format evidently', () => {
            const index = 0;
            const fieldName = 'login';
            const fieldDefault = 'user';
            rs.addField(
                {
                    name: fieldName,
                    type: 'string',
                    defaultValue: fieldDefault,
                },
                index
            );
            rs.assign([]);
            expect(rs.getFormat().at(index).getName()).toBe(fieldName);
            expect(rs.getFormat().at(index).getDefaultValue()).toBe(fieldDefault);
        });

        test('should add the field with the value', () => {
            const fieldName = 'login';
            const fieldValue = 'root';
            rs.addField({ name: fieldName, type: 'string', defaultValue: 'user' }, 0, fieldValue);

            rs.each((record) => {
                expect(record.get(fieldName)).toBe(fieldValue);
                expect(record.getRawData()[fieldName]).toBe(fieldValue);
            });
        });

        test('should throw an error if the field is already defined', () => {
            const format = getItemsFormat();
            const rs = new RecordSet({ format });

            expect(() => {
                rs.addField({ name: 'name', type: 'string' });
            }).toThrow();
        });

        test('should throw an error if add the field twice', () => {
            rs.addField({ name: 'new', type: 'string' });
            expect(() => {
                rs.addField({ name: 'new', type: 'string' });
            }).toThrow();
        });

        test('should add field if it has sbis adapter and its has copied data', () => {
            const rs = new RecordSet({
                rawData: getSbisItems(),
                adapter: new CowAdapter(new SbisAdapter()),
            });
            rs.at(0).set('name', 'Foo');
            rs.addField({ name: 'new', type: 'string' });
            expect(() => {
                rs.at(0).set('new', '12');
            }).not.toThrow();
        });
    });

    describe('.removeField()', () => {
        test('should remove the exists field', () => {
            const format = getItemsFormat();
            const fieldName = 'name';
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                format,
                rawData: getSbisItems(),
            });

            rs.removeField(fieldName);

            expect(rs.getFormat().getFieldIndex(fieldName)).toBe(-1);
            expect(rs.getRawData().s.length).toBe(1);
            rs.each((record) => {
                expect(record.has(fieldName)).toBe(false);
                expect(record.get(fieldName)).not.toBeDefined();
                expect(record.getRawData().s.length).toBe(1);
            });
        });

        test("should throw an error if adapter doesn't support fields detection", () => {
            const rs = new RecordSet();
            const fieldName = 'name';
            expect(() => {
                rs.removeField(fieldName);
            }).toThrow();
        });

        test('should throw an error for not defined field', () => {
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                rawData: getSbisItems(),
            });
            expect(() => {
                rs.removeField('some');
            }).toThrow();
        });

        test('should throw an error if remove the field twice', () => {
            const format = getItemsFormat();
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                format,
                rawData: getSbisItems(),
            });

            rs.removeField('name');
            expect(() => {
                rs.removeField('name');
            }).toThrow();
        });

        test('should remove field from original data', () => {
            const data = getSbisItems();
            const rs = new RecordSet({
                rawData: data,
                adapter: new SbisAdapter(),
            });

            expect(data.s.length).toEqual(2);
            rs.removeField('name');
            expect(data.s.length).toEqual(1);
        });
    });

    describe('.removeFieldAt()', () => {
        test("should throw an error if adapter doesn't support fields indexes", () => {
            const format = getItemsFormat();
            const rs = new RecordSet({
                format,
                rawData: getItems(),
            });

            expect(() => {
                rs.removeFieldAt(0);
            }).toThrow();
        });

        test('should remove the exists field', () => {
            const format = getItemsFormat();
            const fieldIndex = 1;
            const fieldName = format[fieldIndex].name;
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                format,
                rawData: getSbisItems(),
            });

            rs.removeFieldAt(fieldIndex);

            expect(rs.getFormat().at(fieldIndex)).not.toBeDefined();
            expect(rs.getRawData().s.length).toBe(1);
            rs.each((record) => {
                expect(record.has(fieldName)).toBe(false);
                expect(record.get(fieldName)).not.toBeDefined();
                expect(record.getRawData().s.length).toBe(1);
            });
        });

        test('should throw an error for not exists index', () => {
            expect(() => {
                const rs = new Record({
                    adapter: 'Types/entity:adapter.Sbis',
                });
                rs.removeFieldAt(0);
            }).toThrow();
        });
    });

    describe('.append()', () => {
        test('should return added items', () => {
            const rd = [
                {
                    id: 50,
                    name: '50',
                },
                {
                    id: 51,
                    name: '51',
                },
            ];

            const added = rs.append([
                new Model({
                    rawData: rd[0],
                }),
                new Model({
                    rawData: rd[1],
                }),
            ]);

            expect(added.length).toEqual(rd.length);
            expect(added[0].getRawData()).toEqual(rd[0]);
            expect(added[1].getRawData()).toEqual(rd[1]);
        });

        test('should change raw data', () => {
            const rd = [
                {
                    id: 50,
                    name: '50',
                },
                {
                    id: 51,
                    name: '51',
                },
            ];
            rs.append(
                new RecordSet({
                    rawData: rd,
                })
            );
            Array.prototype.push.apply(items, rd);
            expect(rs.getRawData()).toEqual(items);
            expect(rs.getCount()).toEqual(items.length);
            items.forEach((item, i) => {
                expect(rs.at(i).getRawData()).toEqual(item);
            });
        });

        test('should take format from first record to clear recordSet', () => {
            const rs = new RecordSet<object, Record>({
                rawData: [{ id: 1, name: 'John' }],
            });
            const recs = [
                new Record({
                    rawData: { id: 1, count: 3, name: 'John' },
                }),
            ];

            expect(rs.getFormat().getCount()).toEqual(2);
            rs.clear();
            rs.append(recs);
            expect(rs.getFormat().getCount()).toEqual(3);
        });

        test('should keep foreign records owner', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.append(records);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getOwner()).toBeNull();
            }
        });

        test('should set the new records owner to itself', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = rs.getCount();
            const finish = start + records.length;

            rs.append(records);
            for (let i = start; i < finish; i++) {
                expect(rs.at(i).getOwner()).toBe(rs);
            }
        });

        test('should keep foreign records state', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.append(records);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getState()).toBe(RecordState.DETACHED);
            }
        });

        test('should set the new records state to "Added"', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = rs.getCount();
            const finish = start + records.length;

            rs.append(records);
            for (let i = start; i < finish; i++) {
                expect(rs.at(i).getState()).toBe(RecordState.ADDED);
            }
        });

        test("should don't change source record raw data if result record changed", () => {
            const source = new Model({
                rawData: { foo: 'bar' },
            });
            const at = rs.getCount();

            rs.append([source]);

            const result = rs.at(at);
            result.set('foo', 'baz');

            expect(source.getRawData().foo).toEqual('bar');
            expect(result.getRawData().foo).toEqual('baz');
        });

        test('should update raw data if record changed', () => {
            const source = new Model({
                rawData: { foo: 'bar' },
            });
            const at = rs.getCount();

            rs.append([source]);

            const result = rs.at(at);
            result.set('foo', 'baz');

            expect(rs.getRawData()[at].foo).toEqual('baz');
        });

        test('should throw an error for not a Record', () => {
            const data4 = { id: 4 };
            const data5 = { id: 5 };
            expect(() => {
                rs.append([
                    new Model({
                        rawData: data4,
                    }),
                    data5 as any,
                ]);
            }).toThrow();
        });

        test('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis',
            });
            expect(() => {
                rs.append([record]);
            }).toThrow();
        });

        test('should trigger "onCollectionChange" with valid arguments', () => {
            const newRs = new RecordSet({
                rawData: [
                    {
                        id: 13,
                        name: 'Foo',
                    },
                ],
            });
            const oldCount = rs.getCount();
            const expected: any[] = [
                {
                    action: IBindCollection.ACTION_ADD,
                    oldItems: [],
                    oldItemsIndex: 0,
                },
            ];
            const given: any[] = [];
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex,
                });
            };

            rs.subscribe('onCollectionChange', handler);
            rs.append(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(oldCount)];
            expected[0].newItemsIndex = oldCount;

            expect(given).toEqual(expected);
        });

        test('should add two models', () => {
            const rd = [
                {
                    id: 1,
                    rec: {},
                },
                {
                    id: 51,
                    rec: {},
                },
            ];

            const format = [
                {
                    name: 'id',
                    type: 'integer',
                },
                {
                    name: 'rec',
                    type: 'record',
                },
            ];
            const recordSet = new RecordSet();

            recordSet.append([
                new Model({
                    rawData: rd[0],
                    format,
                }),
                new Model({
                    rawData: rd[1],
                    format,
                }),
            ]);

            expect(recordSet.at(0).getRawData()).toEqual(rd[0]);
            expect(recordSet.at(1).getRawData()).toEqual(rd[1]);
        });

        test('should add model with the same format as external model has', () => {
            const record = new Model({
                rawData: {
                    rec: {},
                },
                format: [
                    {
                        name: 'rec',
                        type: 'record',
                    },
                ],
            });

            const recordSet = new RecordSet();

            recordSet.append([record]);

            expect(recordSet.at(0).getFormat().isEqual(record.getFormat())).toBe(true);
        });
    });

    describe('.prepend', () => {
        test('should return added items', () => {
            const rd = [
                {
                    id: 50,
                    name: '50',
                },
                {
                    id: 51,
                    name: '51',
                },
            ];

            const added = rs.prepend([
                new Model({
                    rawData: rd[0],
                }),
                new Model({
                    rawData: rd[1],
                }),
            ]);

            expect(added.length).toEqual(rd.length);
            expect(added[0].getRawData()).toEqual(rd[0]);
            expect(added[1].getRawData()).toEqual(rd[1]);
        });

        test('should change raw data', () => {
            const rd: any[] = [
                {
                    id: 50,
                    name: '50',
                },
                {
                    id: 51,
                    name: '51',
                },
            ];
            rs.prepend(
                new RecordSet({
                    rawData: rd,
                })
            );
            //@ts-ignore
            Array.prototype.splice.apply(items, [0, 0].concat(rd));

            expect(rs.getRawData()).toEqual(items);
            expect(rs.getCount()).toEqual(items.length);
            items.forEach((item, i) => {
                expect(rs.at(i).getRawData()).toEqual(item);
            });
        });

        test('should keep foreign records owner', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.prepend(records);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getOwner()).toBeNull();
            }
        });

        test('should set the new records owner to itself', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.prepend(records);
            for (let i = start; i < finish; i++) {
                expect(rs.at(i).getOwner()).toBe(rs);
            }
        });

        test('should keep foreign records state', () => {
            const records = [new Model(), new Model(), new Model()];
            rs.prepend(records);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getState()).toBe(RecordState.DETACHED);
            }
        });

        test('should set the new records state to "Added"', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.prepend(records);
            for (let i = start; i < finish; i++) {
                expect(rs.at(i).getState()).toBe(RecordState.ADDED);
            }
        });

        test('should throw an error', () => {
            const data4 = { id: 4 };
            const data5 = { id: 5 };
            expect(() => {
                rs.prepend([
                    new Model({
                        rawData: data4,
                    }),
                    data5 as any,
                ]);
            }).toThrow();
        });

        test('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis',
            });
            expect(() => {
                rs.prepend([record]);
            }).toThrow();
        });

        test('should trigger "onCollectionChange" with valid arguments', () => {
            const newRs = new RecordSet({
                rawData: [
                    {
                        id: 13,
                        name: 'Foo',
                    },
                ],
            });
            const expected: any[] = [
                {
                    action: IBindCollection.ACTION_ADD,
                    oldItems: [],
                    oldItemsIndex: 0,
                },
            ];
            const given: any[] = [];
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex,
                });
            };

            rs.subscribe('onCollectionChange', handler);
            rs.prepend(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(0)];
            expected[0].newItemsIndex = 0;

            expect(given).toEqual(expected);
        });
    });

    describe('.assign()', () => {
        test('should have no effect with itself', () => {
            const oldCount = rs.getCount();
            const oldRawData = rs.getRawData(true);

            rs.assign(rs);

            expect(rs.getCount()).toBe(oldCount);
            expect(rs.getRawData(true)).toBe(oldRawData);
        });

        test('should return added items', () => {
            const rs = new RecordSet({
                rawData: [{ id: 1 }, { id: 2 }, { id: 3 }],
            });
            const data4 = { id: 4 };
            const data5 = { id: 5 };

            const added = rs.assign([
                new Model({
                    rawData: data4,
                }),
                new Model({
                    rawData: data5,
                }),
            ]);

            expect(added.length).toEqual(2);
            expect(added[0].getRawData()).toEqual(data4);
            expect(added[1].getRawData()).toEqual(data5);
        });

        test('should return empty added items if RecordSet given', () => {
            const source = new RecordSet({
                rawData: [{ foo: 'bar' }],
            });

            const added = rs.assign(source);

            expect(added.length).toEqual(source.getCount());
            expect(added[0]).not.toBeDefined();
        });

        test('should change raw data and count', () => {
            const rs = new RecordSet({
                rawData: [{ id: 1 }, { id: 2 }, { id: 3 }],
            });
            const data4 = { id: 4 };
            const data5 = { id: 5 };

            rs.assign([
                new Model({
                    rawData: data4,
                }),
                new Model({
                    rawData: data5,
                }),
            ]);

            expect(rs.getRawData()[0]).toEqual(data4);
            expect(rs.getRawData()[1]).toEqual(data5);
            expect(rs.at(0).getRawData()).toEqual(data4);
            expect(rs.at(1).getRawData()).toEqual(data5);
            expect(rs.getCount()).toBe(2);
        });

        test('should keep raw data format for SBIS adapter after become empty', () => {
            const adapter = new SbisAdapter();
            const format = [{ n: 'foo', t: 'Строка' }];
            const rawData = {
                _type: 'recordset',
                d: [['bar']],
                s: format,
            };
            const rs = new RecordSet({ adapter, rawData });

            rs.assign([]);

            const resultData = rs.getRawData();
            expect(resultData).toEqual({
                _type: 'recordset',
                d: [],
                s: format,
            });
        });

        test('should keep foreign records owner', () => {
            const records = [new Model(), new Model(), new Model()];

            rs.assign(records);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getOwner()).toBeNull();
            }
        });

        test('should set the new records owner to itself', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.assign(records);
            for (let i = start; i < finish; i++) {
                expect(rs.at(i).getOwner()).toBe(rs);
            }
        });

        test('should keep foreign records state', () => {
            const records = [new Model(), new Model(), new Model()];

            rs.assign(records);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getState()).toBe(RecordState.DETACHED);
            }
        });

        test('should set the new records state to "Added"', () => {
            const records = [new Model(), new Model(), new Model()];
            const start = 0;
            const finish = records.length;

            rs.assign(records);
            for (let i = start; i < finish; i++) {
                expect(rs.at(i).getState()).toBe(RecordState.ADDED);
            }
        });

        test('should reset the old records owner', () => {
            const records: Model[] = [];
            rs.each((record) => {
                records.push(record);
            });

            rs.assign([]);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getOwner()).toBeNull();
            }
        });

        test('should set the old records state to "Detached"', () => {
            const records: Model[] = [];
            rs.each((record) => {
                records.push(record);
            });

            rs.assign([]);
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getState()).toBe(RecordState.DETACHED);
            }
        });

        test('should take adapter from assigning RecordSet', () => {
            const rs1 = new RecordSet({
                adapter: new JsonAdapter(),
            });
            const rs2 = new RecordSet({
                adapter: new SbisAdapter(),
            });

            expect(rs1.getAdapter()).toBeInstanceOf(JsonAdapter);
            expect(rs2.getAdapter()).toBeInstanceOf(SbisAdapter);
            rs1.assign(rs2);
            expect(rs1.getAdapter() === rs2.getAdapter()).toBeTruthy();
        });

        test('should take adapter from the first record of assigning Array', () => {
            const rs = new RecordSet<object, Record>({
                adapter: new JsonAdapter(),
            });
            const arr = [new Record({ adapter: 'Types/entity:adapter.Sbis' })];

            expect(rs.getAdapter()).toBeInstanceOf(JsonAdapter);
            expect(arr[0].getAdapter()).toBeInstanceOf(SbisAdapter);
            rs.assign(arr);
            expect(rs.getAdapter() === arr[0].getAdapter()).toBeTruthy();
        });

        test('should take raw data format from assigning RecordSet', () => {
            const s1 = [
                { n: 'Id', t: 'Число целое' },
                { n: 'Name', t: 'Строка' },
            ];
            const s2 = [
                { n: 'Id', t: 'Число целое' },
                { n: 'Count', t: 'Число целое' },
                { n: 'Name', t: 'Строка' },
            ];
            const rs1 = new RecordSet({
                rawData: {
                    d: [[7, 'John']],
                    s: s1,
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const rs2 = new RecordSet({
                rawData: {
                    d: [[7, 4, 'Bill']],
                    s: s2,
                },
                adapter: 'Types/entity:adapter.Sbis',
            });

            expect(rs1.getRawData().s).toEqual(s1);
            rs1.assign(rs2);
            expect(rs1.getRawData().s).toEqual(s2);
        });

        test('should take format from assigning RecordSet', () => {
            const data1 = [{ id: 1, name: 'John' }];
            const data2 = [{ id: 1, count: 3, name: 'John' }];
            const rs1 = new RecordSet({
                rawData: data1,
            });
            const rs2 = new RecordSet({
                rawData: data2,
            });

            expect(rs1.getFormat().getCount()).toEqual(2);
            rs1.assign(rs2);
            expect(rs1.getFormat().getCount()).toEqual(3);
        });

        test('should apply its own format to the external item', () => {
            const data1 = [{ id: 1, count: 3, name: 'John' }];
            const data2 = [{ id: 2, name: 'Jim' }];
            const rs1 = new RecordSet({
                rawData: data1,
                format: {
                    id: Number,
                    count: Number,
                    name: String,
                },
            });
            const rs2 = new RecordSet({
                rawData: data2,
            });

            rs1.assign(rs2);
            expect(rs1.getCount()).toEqual(1);
            expect(+rs1.at(0).get('id')).toEqual(2);
            expect(rs1.at(0).get('count')).not.toBeDefined();
            expect(rs1.at(0).get('name') + '').toEqual('Jim');
        });

        test("should don't change source record raw data if result record changed", () => {
            const source = new RecordSet({
                rawData: [{ foo: 'bar' }],
            });

            rs.assign(source);

            const result = rs.at(0);
            result.set('foo', 'baz');

            expect(source.getRawData()[0].foo).toEqual('bar');
            expect(result.getRawData().foo).toEqual('baz');
        });

        test('should update raw data if record changed', () => {
            const source = new RecordSet({
                rawData: [{ foo: 'bar' }],
            });

            rs.assign(source);

            const result = rs.at(0);
            result.set('foo', 'baz');

            expect(rs.getRawData()[0].foo).toEqual('baz');
        });

        test('should throw an error if pass not a record', () => {
            const data4 = { id: 4 };
            const data5 = { id: 5 };
            expect(() => {
                rs.assign([
                    new Model({
                        rawData: data4,
                    }),
                    data5 as any,
                ]);
            }).toThrow();
        });

        test('should throw an TypeError for incompatible adapter', () => {
            const validRecord = new Model({
                adapter: 'Types/entity:adapter.Sbis',
            });
            const invalidRecord = new Model({
                adapter: 'Types/entity:adapter.Json',
            });
            expect(() => {
                rs.assign([validRecord, invalidRecord]);
            }).toThrow();
        });

        test("should don't throw an TypeError for incompatible adapter", () => {
            const validRecord = new Model({
                adapter: 'Types/entity:adapter.Sbis',
            });
            rs.assign([validRecord, validRecord]);
        });

        test('should change format with new one', () => {
            const rs = new RecordSet({
                rawData: {
                    d: [[7]],
                    s: [{ n: 'id', t: 'Число целое' }],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            const rs2 = new RecordSet({
                rawData: {
                    d: [['Arbuzznoff']],
                    s: [{ n: 'name', t: 'Строка' }],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            rs.assign(rs2);
            expect(rs.getRawData().s).toEqual([{ n: 'name', t: 'Строка' }]);
        });

        test("should don't throw an error if format is defined directly", () => {
            const rs = new RecordSet({
                rawData: {
                    d: [[7]],
                    s: [{ n: 'id', t: 'Число целое' }],
                },
                adapter: 'Types/entity:adapter.Sbis',
                format: [{ name: 'id', type: 'Integer' }],
            });
            const rs2 = new RecordSet({
                rawData: {
                    d: [['Arbuzznoff']],
                    s: [{ n: 'name', t: 'Строка' }],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            rs.addField({ name: 'login', type: 'string' });
            rs.assign(rs2);
        });

        test('should chnage raw data after relation change', () => {
            const rs = new RecordSet();

            rs.assign([
                new Model({
                    rawData: { id: 1 },
                }),
            ]);

            expect(rs.getRawData()[0].id).toEqual(1);
            rs.at(0).set('id', 2);
            expect(rs.getRawData()[0].id).toEqual(2);
        });

        test('should assign empty recordset if it has a format', () => {
            const rs = new RecordSet({
                rawData: [[1]],
                format: [{ name: 'id', type: 'Integer' }],
            });
            const rs2 = new RecordSet({
                rawData: [],
                format: [{ name: 'id', type: 'Integer' }],
            });
            rs.assign(rs2);
            expect(rs.getCount()).toEqual(0);
        });

        test('should trigger "onCollectionChange" with valid arguments', () => {
            const items = [{ id: 1 }, { id: 2 }];
            const rs = new RecordSet({
                rawData: items,
            });
            const newItems = [{ id: 3 }];
            const newRs = new RecordSet({
                rawData: newItems,
            });
            const expected: any[] = [
                {
                    action: IBindCollection.ACTION_RESET,
                    oldItems: [rs.at(0), rs.at(1)],
                    oldItemsIndex: 0,
                },
            ];
            const given: any[] = [];
            //@ts-ignore
            const handler = (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) => {
                given.push({
                    action,
                    newItems,
                    newItemsIndex,
                    oldItems,
                    oldItemsIndex,
                });
            };

            rs.subscribe('onCollectionChange', handler);
            rs.assign(newRs);
            rs.unsubscribe('onCollectionChange', handler);

            expected[0].newItems = [rs.at(0)];
            expected[0].newItemsIndex = 0;

            expect(given).toEqual(expected);
        });
    });

    describe('.clear()', () => {
        test('should reset the records owner', () => {
            const rs = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const records: Model[] = [];

            rs.each((record) => {
                records.push(record);
            });

            rs.clear();
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getOwner()).toBeNull();
            }
        });

        test('should set the records state to "Detached"', () => {
            const records: Model[] = [];
            rs.each((record) => {
                records.push(record);
            });
            rs.clear();
            for (let i = 0; i < records.length; i++) {
                expect(records[i].getState()).toEqual(RecordState.DETACHED);
            }
        });

        test('should clear the raw data', () => {
            rs.clear();
            expect(rs.getRawData()).toEqual([]);
        });

        test('should clear the format', () => {
            rs.clear();
            expect(rs.getFormat().getCount()).toEqual(0);
        });

        test('should clear the format even it was extrected before', () => {
            expect(rs.getFormat().getCount()).toEqual(2);
            rs.clear();
            expect(rs.getFormat().getCount()).toEqual(0);
        });
    });

    describe('.clone()', () => {
        test('should not be same as original', () => {
            expect(rs.clone()).toBeInstanceOf(RecordSet);
            expect(rs.clone(true)).toBeInstanceOf(RecordSet);
            expect(rs.clone()).not.toEqual(rs);
            expect(rs.clone(true)).not.toEqual(rs);
        });

        test('should not be same as previous clone', () => {
            expect(rs.clone() !== rs.clone()).toBeTruthy();
            expect(rs.clone(true) !== rs.clone(true)).toBeTruthy();
        });

        test('should clone rawData', () => {
            const clone = rs.clone();
            expect(rs.getRawData() !== clone.getRawData()).toBeTruthy();
            expect(rs.getRawData()).toEqual(clone.getRawData());
        });

        test('should make raw data unlinked from original', () => {
            const cloneA = rs.clone();
            expect(cloneA.getRawData()).toEqual(rs.getRawData());
            cloneA.removeAt(0);
            expect(cloneA.getRawData()).not.toEqual(rs.getRawData());

            const cloneB = rs.clone();
            expect(cloneB.getRawData()).toEqual(rs.getRawData());
            cloneB.at(0).set('name', 'test');
            expect(cloneB.getRawData()).not.toEqual(rs.getRawData());
        });

        test('should make object-like options linked to original if shallow', () => {
            const clone: any = rs.clone(true);
            expect(clone._$format).toBe((rs as any)._$format);
        });

        test('should make array-like options unlinked from original if shallow', () => {
            const clone: any = rs.clone(true);
            expect(clone._$rawData !== (rs as any)._$rawData).toBeTruthy();
            expect(clone._$rawData).toEqual((rs as any)._$rawData);
        });

        test('should return records owned by itself', () => {
            const clone = rs.clone();
            clone.each((record) => {
                expect(clone).toBe(record.getOwner());
            });
        });

        test('should make items unlinked from original', () => {
            const clone = rs.clone();
            clone.each((item, index) => {
                expect(item !== rs.at(index)).toBeTruthy();
            });
        });

        test('should make items linked to original if shallow', () => {
            // Force create record instances
            rs.each(() => {
                // Nothing
            });

            const clone = rs.clone(true);
            clone.each((item, index) => {
                expect(item).toBe(rs.at(index));
            });
        });
    });

    describe('.add()', () => {
        test('should keep foreign record owner', () => {
            const record = new Model({
                rawData: getSomeItem(),
            });
            rs.add(record);
            expect(record.getOwner()).toBeNull();
        });

        test('should set the new record owner to itself', () => {
            const record = new Model({
                rawData: getSomeItem(),
            });
            rs.add(record);
            expect(rs.at(rs.getCount() - 1).getOwner()).toBe(rs);
        });

        test('should keep foreign record state', () => {
            const record = new Model({
                rawData: getSomeItem(),
            });
            rs.add(record);
            expect(record.getState()).toBe(RecordState.DETACHED);
        });

        test('should keep foreign record instance state', () => {
            class Foo extends Model {
                _foo: string;
            }

            const record = new Foo({
                //@ts-ignore
                properties: {
                    foo: {
                        //@ts-ignore
                        get: Track.create(function (): string {
                            return (this._foo = 'bar');
                        }, '_foo'),
                    },
                } as IHashMap<IProperty<Foo>>,
            });

            expect(record.get('foo')).toEqual('bar');

            const result: any = rs.add(record, 0);
            expect(result._foo).toEqual('bar');
        });

        test('should set the new record state to "Added"', () => {
            const record = new Model({
                rawData: getSomeItem(),
            });
            rs.add(record);
            expect(rs.at(rs.getCount() - 1).getState()).toBe(RecordState.ADDED);
        });

        test('should create result with format equals to recordset', () => {
            const rs = new RecordSet({
                rawData: [
                    { id: 1, title: 'foo', count: 0 },
                    { id: 2, title: 'bar', count: 2 },
                ],
            });
            const record = new Model({
                rawData: { id: 3, name: 'Baz', title: 'bar' },
            });

            const result = rs.add(record);
            const data = result.getRawData(true);
            expect(Object.keys(data)).toEqual(['id', 'title', 'count']);
        });

        test('should change raw data', () => {
            const rd = getSomeItem();
            const record = new Model({
                rawData: rd,
            });

            rs.add(record);
            items.push(rd);
            expect(rs.getRawData()).toEqual(items);
        });

        test("should don't change source record raw data if result record changed", () => {
            const source = new Model({
                rawData: { foo: 'bar' },
            });
            const result = rs.add(source, 0);

            result.set('foo', 'baz');

            expect(source.getRawData().foo).toEqual('bar');
            expect(result.getRawData().foo).toEqual('baz');
        });

        test('should update raw data if record changed', () => {
            const data = { foo: 'bar' };
            const source = new Model({
                rawData: data,
            });

            const result = rs.add(source, 0);
            result.set('foo', 'baz');

            expect(rs.getRawData()[0].foo).toEqual('baz');
        });

        test('should add records with different formats', () => {
            rs.add(
                new Model({
                    format: [{ name: 'id', type: 'integer' }],
                })
            );
        });

        test('should allow to set raw data after add to empty RecordSet', () => {
            const rs = new RecordSet();
            rs.add(
                new Model({
                    rawData: { id: 1 },
                })
            );
            rs.setRawData([{ id: 2 }]);
        });

        test('should throw an Error for not a record', () => {
            const rd: any = getSomeItem();
            expect(() => {
                rs.add(rd);
            }).toThrow();
        });

        test('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis',
            });
            expect(() => {
                rs.add(record);
            }).toThrow();
        });

        test('should add record with recovered data', () => {
            const acceptor = new RecordSet({
                adapter: new SbisAdapter(),
                rawData: {
                    f: 0,
                    d: [
                        [
                            3,
                            {
                                f: 1,
                                d: ['Sivov'],
                                s: [
                                    {
                                        n: 'name',
                                        t: 'Строка',
                                    },
                                ],
                            },
                        ],
                    ],
                    s: [
                        {
                            n: 'id',
                            t: 'Число целое',
                        },
                        {
                            n: 'human',
                            t: 'Запись',
                        },
                    ],
                },
            });

            const donor = new RecordSet({
                adapter: new SbisAdapter(),
                rawData: {
                    f: 0,
                    d: [
                        [
                            {
                                f: 1,
                                d: ['Ivanov'],
                                s: [
                                    {
                                        n: 'name',
                                        t: 'Строка',
                                    },
                                ],
                            },
                            1,
                        ],
                        [
                            {
                                f: 1,
                                d: ['Petroff'],
                            },
                            2,
                        ],
                    ],
                    s: [
                        {
                            n: 'human',
                            t: 'Запись',
                        },
                        {
                            n: 'id',
                            t: 'Число целое',
                        },
                    ],
                },
            });

            acceptor.add(donor.at(1));

            expect(acceptor.at(1).getRawData().d).toEqual([
                2,
                {
                    d: ['Petroff'],
                    s: [
                        {
                            n: 'name',
                            t: 'Строка',
                        },
                    ],
                },
            ]);
        });

        test('should add record to empty recordset and update own format', () => {
            const source = new Model({
                rawData: {
                    d: ['bar'],
                    s: [
                        {
                            n: 'foo',
                            t: 'Строка',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });

            const rawFormatData = getSbisFormat();
            const recordset = new RecordSet({
                rawData: rawFormatData,
                adapter: 'Types/entity:adapter.Sbis',
            });

            const result = recordset.add(source);

            expect(result.get('foo')).toEqual('bar');
            expect(recordset.getFormat().getCount()).toEqual(1);
        });

        test('should add record to empty recordset and keep own format', () => {
            const source = new Model({
                rawData: {
                    d: ['bar'],
                    s: [
                        {
                            n: 'foo',
                            t: 'Строка',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });

            const rawFormatData = getSbisFormat();
            const recordset = new RecordSet({
                rawData: rawFormatData,
                adapter: 'Types/entity:adapter.Sbis',
            });

            expect(recordset.hasDeclaredFormat()).toBe(false);

            recordset.createDeclaredFormat();

            expect(recordset.hasDeclaredFormat()).toBe(true);

            const result = recordset.add(source, 0);

            expect(result.get('foo')).not.toBeDefined();
            expect(recordset.getFormat().getCount()).toEqual(rawFormatData.s.length);
        });
    });

    describe('.remove()', () => {
        test('should remove the record', () => {
            const record = rs.at(0);
            rs.remove(record);
            expect(rs.getIndex(record)).toBe(-1);
        });

        test('should change raw data', () => {
            const record = rs.at(0);
            rs.remove(record);
            expect(rs.getRawData()).toEqual(items.slice(1));
        });

        test('should reset the record owner', () => {
            const record = rs.at(0);
            expect(record.getOwner()).toBe(rs);
            rs.remove(record);
            expect(record.getOwner()).toBeNull();
        });

        test('should set the record state to "Detached"', () => {
            const record = rs.at(0);
            rs.remove(record);
            expect(record.getState()).toBe(RecordState.DETACHED);
        });

        test('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis',
            });
            expect(() => {
                rs.remove(record);
            }).toThrow();
        });
    });

    describe('.removeAt()', () => {
        test('should change raw data', () => {
            rs.removeAt(0);
            expect(rs.getRawData()).toEqual(items.slice(1));
        });

        test('should reset the record owner', () => {
            const record = rs.at(0);
            expect(record.getOwner()).toBe(rs);
            rs.removeAt(0);
            expect(record.getOwner()).toBeNull();
        });

        test('should set the record state to "Detached"', () => {
            const record = rs.at(0);
            rs.removeAt(0);
            expect(record.getState()).toBe(RecordState.DETACHED);
        });
    });

    describe('.replace()', () => {
        test('should return added record', () => {
            const rd = {
                id: 50,
                name: 'qwe',
            };
            const newItem = new Model({ rawData: rd });

            const addedItem = rs.replace(newItem, 0);
            expect(newItem).not.toEqual(addedItem);
            expect(addedItem.getRawData()).toEqual(rd);
        });

        test('should change raw data', () => {
            const rd = {
                id: 50,
                name: '50',
            };
            const newItem = new Model({ rawData: rd });

            rs.replace(newItem, 0);
            expect(rs.getRawData()[0]).toEqual(rd);
        });

        test('should keep foreign record owner', () => {
            const record = new Model();
            rs.replace(record, 0);
            expect(record.getOwner()).toBeNull();
        });

        test('should set the new record owner to itself', () => {
            const record = new Model();
            rs.replace(record, 0);
            expect(rs.at(0).getOwner()).toBe(rs);
        });

        test('should keep foreign record state', () => {
            const record = new Model();
            rs.replace(record, 0);
            expect(record.getState()).toBe(RecordState.DETACHED);
        });

        test('should set the new record state to "Changed"', () => {
            const record = new Model();
            rs.replace(record, 0);
            expect(rs.at(0).getState()).toBe(RecordState.CHANGED);
        });

        test('should reset the old record owner', () => {
            const record = rs.at(0);
            rs.replace(new Model(), 0);
            expect(record.getOwner()).toBeNull();
        });

        test('should set the old record state to "Detached"', () => {
            const record = rs.at(0);
            rs.replace(new Model(), 0);
            expect(record.getState()).toBe(RecordState.DETACHED);
        });

        test('should throw an error for not a record', () => {
            expect(() => {
                rs.replace({} as any, 0);
            }).toThrow();
        });

        test('should throw an TypeError for incompatible adapter', () => {
            const record = new Model({
                adapter: 'Types/entity:adapter.Sbis',
            });
            expect(() => {
                rs.replace(record, 0);
            }).toThrow();
        });
    });

    describe('.move()', () => {
        test('should change raw data', () => {
            rs.move(0, 1);
            const data = rs.getRawData();
            expect(data[0]).toEqual(items[1]);
            expect(data[1]).toEqual(items[0]);
            expect(data[2]).toEqual(items[2]);
        });

        test('should get record by id after move', () => {
            rs.getRecordById(1);
            rs.move(0, 1);
            expect(rs.getRecordById(1).getKey()).toEqual(1);
            expect(rs.getRecordById(2).getKey()).toEqual(2);
        });
    });

    describe('.getIndex()', () => {
        test('should return an index of given item', () => {
            for (let i = 0; i < items.length; i++) {
                expect(i).toEqual(rs.getIndex(rs.at(i)));
            }
        });
    });

    describe('.relationChanged()', () => {
        test('should return affected "which"', () => {
            const items = [{ id: 1 }];
            const rs = new RecordSet({
                rawData: items,
            });
            const target = rs.at(0);
            const which = {
                data: { foo: 'bar' },
                target,
            };
            const route = [undefined];

            //@ts-ignore
            const result = rs.relationChanged(which, route);
            expect(result.target).toBe(target);
            expect(result.data).toEqual({ 0: target });
        });
    });

    describe('.acceptChanges()', () => {
        test('should make the records unchanged', () => {
            rs.each((record, index) => {
                record.set('id', 'new-' + index);
            });
            rs.acceptChanges();
            rs.each((record) => {
                expect(record.getChanged().length).toBe(0);
            });
        });

        test('should set the records state to "Unchanged"', () => {
            rs.each((record, index) => {
                record.set('id', 'new-' + index);
            });
            rs.acceptChanges();
            rs.each((record) => {
                expect(record.getState()).toBe(RecordState.UNCHANGED);
            });
        });

        test('should set the added record state to "Unchanged"', () => {
            const record = new Model({
                rawData: {
                    id: 100,
                    name: 'Test',
                },
            });
            rs.add(record);
            expect(rs.at(rs.getCount() - 1).getState()).toBe(RecordState.ADDED);
            rs.acceptChanges();
            expect(rs.at(rs.getCount() - 1).getState()).toBe(RecordState.UNCHANGED);
        });

        test('should force getChanged() of parent record return an array with record field', () => {
            const format = {
                id: 'integer',
                items: 'recordset',
            };
            const record = new Record({
                format,
                rawData: {
                    id: 1,
                    items: [
                        {
                            id: 'foo',
                        },
                        {
                            id: 'bar',
                        },
                    ],
                },
            });
            const items = record.get('items');

            items.removeAt(0);
            expect(record.getChanged().indexOf('items')).toBeGreaterThan(-1);

            items.acceptChanges();
            expect(record.getChanged().indexOf('items')).toBeGreaterThan(-1);
        });

        test('should force getChanged() of parent record return an array without record field', () => {
            const format = {
                id: 'integer',
                items: 'recordset',
            };
            const record = new Record({
                format,
                rawData: {
                    id: 1,
                    items: [
                        {
                            id: 'foo',
                        },
                        {
                            id: 'bar',
                        },
                    ],
                },
            });
            const items = record.get('items');

            items.removeAt(0);
            expect(record.getChanged().indexOf('items')).toBeGreaterThan(-1);

            items.acceptChanges(true);
            expect(record.getChanged().indexOf('items')).toEqual(-1);
        });
    });

    describe('.rejectChanges()', () => {
        test('should make the records unchanged', () => {
            rs.each((record, index) => {
                record.set('id', 'new-' + index);
            });
            rs.rejectChanges();
            rs.each((record) => {
                expect(record.getChanged().length).toBe(0);
            });
        });

        test('should set the records state to "Unchanged"', () => {
            rs.each((record, index) => {
                record.set('id', 'new-' + index);
            });
            rs.rejectChanges();
            rs.each((record) => {
                expect(record.getState()).toBe(RecordState.UNCHANGED);
            });
        });

        test('should remove record with state "Added"', () => {
            const record = new Model({
                rawData: {
                    id: 100,
                    name: 'Test',
                },
            });
            rs.add(record);
            expect(rs.at(rs.getCount() - 1).getState()).toBe(RecordState.ADDED);
            const count = rs.getCount();
            rs.rejectChanges();

            expect(rs.getCount() < count).toBe(true);
        });

        test('should keep removed record with state "Added" and deleted after', () => {
            const record = new Model({
                rawData: {
                    id: 100,
                    name: 'Test',
                },
            });
            const count = rs.getCount();
            rs.add(record);
            expect(rs.at(rs.getCount() - 1).getState()).toBe(RecordState.ADDED);
            rs.remove(record);
            rs.rejectChanges();

            expect(rs.getCount()).toEqual(count);
        });

        test('should restore record with state "Detached"', () => {
            const initCount = rs.getCount();
            const item = rs.at(0);

            rs.removeAt(0);

            rs.rejectChanges();
            expect(rs.getCount()).toEqual(initCount);
            expect(rs.at(0).isEqual(item)).toBe(true);
        });

        test('should restore multiple record with state "Detached" and keep same index', () => {
            const initCount = rs.getCount();
            const detachedItems: { [key: number]: Model } = {};

            for (let i = initCount - 1; i >= 0; i -= 2) {
                detachedItems[i] = rs.at(i);
                rs.removeAt(i);
            }

            rs.rejectChanges();

            for (const [key, value] of Object.entries(detachedItems)) {
                const target = rs.at(key as any);
                expect(target.isEqual(value)).toBe(true);
            }

            expect(rs.getCount()).toEqual(initCount);
        });
    });

    describe('.merge()', () => {
        test('should merge two recordsets with default params', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 1000,
                        name: 'Bar',
                    },
                    {
                        id: 2,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });
            const record = rs1.getRecordById(2);

            rs1.merge(rs2);

            expect(rs1.getCount()).toEqual(2);
            expect(rs1.getRecordById(2)).not.toEqual(record);
            expect(rs1.getRecordById(2).get('name')).toEqual('Foo');
            expect(rs1.getRecordById(1000).get('name')).toEqual('Bar');
        });

        test('should merge two recordsets without remove', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 2,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });

            rs1.merge(rs2, { remove: false });
            expect(getItems().length).toEqual(rs1.getCount());
            expect(rs1.getRecordById(2).get('name')).toEqual('Foo');
        });

        test('should merge two recordsets without merge', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 2,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });

            rs1.merge(rs2, { replace: false });
            expect(rs1.getRecordById(2).get('name')).not.toEqual('Foo');
        });

        test('should merge two recordsets without add', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 1000,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });

            rs1.merge(rs2, { add: false });
            expect(rs1.getRecordById(1000)).not.toBeDefined();
        });

        test('should merge two recordsets with inject', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 2,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });
            const record = rs1.getRecordById(2);

            rs1.merge(rs2, { inject: true });
            expect(rs1.getRecordById(2)).toBe(record);
            expect(rs1.getRecordById(2).get('name')).toEqual('Foo');
        });

        test('should merge two recordsets with prepend (prepend new record)', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 9,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });
            const record = rs2.at(0);

            rs1.merge(rs2, { add: false, prepend: true });
            expect(rs1.at(0).get('id')).toEqual(record.get('id'));
        });

        test('should merge two recordsets with add (append new record)', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 9,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });
            const initLength = rs1.getCount();
            rs1.merge(rs2, { add: true, remove: false });
            expect(rs1.getCount() > initLength).toBe(true);
            expect(rs1.at(initLength).get('id')).toEqual(rs2.at(0).get('id'));
        });

        test('should throw if add and prepend specified', () => {
            const rs1 = new RecordSet({
                rawData: getItems(),
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 2,
                        name: 'Foo',
                    },
                ],
                keyProperty: 'id',
            });

            expect(() => {
                rs1.merge(rs2, { add: true, prepend: true });
            }).toThrow();
        });

        test('should normalize raw data on inject', () => {
            const rs1 = new RecordSet({
                rawData: [
                    {
                        id: 1,
                        title: 'foo',
                    },
                    {
                        id: 2,
                        title: 'bar',
                    },
                ],
                keyProperty: 'id',
            });
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 1,
                        name: 'Foo1',
                        title: 'foo1',
                    },
                ],
                keyProperty: 'id',
            });

            rs1.merge(rs2, { inject: true });
            expect(rs1.at(0).getRawData()).toEqual({
                id: 1,
                title: 'foo1',
            });
        });
    });

    describe('.toJSON()', () => {
        test('should serialize a RecordSet', () => {
            const json = rs.toJSON();
            const options = (rs as any)._getOptions();
            delete options.items;
            expect(json.module).toBe('Types/collection:RecordSet');
            expect(typeof json.id).toBe('number');
            expect(json.id > 0).toBe(true);
            expect(json.state.$options).toEqual(options);
        });

        test('should serialize an instance id', () => {
            const json: any = rs.toJSON();
            expect(json.state._instanceId).toBe(rs.getInstanceId());
        });

        test('should serialize metaData injected by setter', () => {
            const metaData = { foo: 'bar' };
            rs.setMetaData(metaData);

            const json = rs.toJSON();
            expect(json.state.$options?.metaData).toBe(metaData);
        });
    });

    describe('.fromJSON()', () => {
        test('should restore an instance id', () => {
            const json = rs.toJSON();
            const clone = RecordSet.fromJSON(json);

            expect((json.state as any)._instanceId).toBe(clone.getInstanceId());
        });

        test('should restore model constructor', () => {
            const serializer = new Serializer();
            const rs = new RecordSet({
                adapter: new SbisAdapter(),
                model: Record,
                rawData: {
                    _type: 'recordset',
                    s: [1],
                    d: [2],
                },
            });
            const json = JSON.stringify(rs, serializer.serialize);
            const clone = JSON.parse(json, serializer.deserialize);

            expect(clone.getModel()).toBe(Record);
        });
    });

    describe('.getModel()', () => {
        test('should return a given model', () => {
            const rs = new RecordSet({
                model: Model,
            });
            expect(rs.getModel()).toBe(Model);
        });

        test('should return "entity.model"', () => {
            expect(rs.getModel()).toBe('Types/entity:Model');
        });
    });

    describe('.getKeyProperty()', () => {
        test('should return id property', () => {
            expect('id').toEqual(rs.getKeyProperty());
        });

        test('should return false', () => {
            const rs2 = new RecordSet({
                rawData: [
                    {
                        id: 1000,
                        name: 'Foo',
                    },
                ],
            });
            expect(!rs2.getKeyProperty()).toBe(true);
        });

        test('should detect keyProperty automatically', () => {
            const rs = new RecordSet({
                rawData: {
                    d: [],
                    s: [
                        {
                            n: 'id',
                            t: 'Число целое',
                        },
                        {
                            n: '@name',
                            t: 'Идентификатор',
                        },
                    ],
                },
                adapter: 'Types/entity:adapter.Sbis',
            });
            expect(rs.getKeyProperty()).toBe('@name');
        });
    });

    describe('.setKeyProperty()', () => {
        test('should set id property', () => {
            rs.setKeyProperty('name');
            expect('name').toEqual(rs.getKeyProperty());
        });

        test('shouldnt set id property', () => {
            rs.setKeyProperty('Лицо');
            expect('Лицо').toEqual(rs.getKeyProperty());
        });

        test('should set id property for all models if not defined yet', () => {
            const rs = new RecordSet({
                rawData: getItems(),
            });
            rs.setKeyProperty('id');
            rs.each((record) => {
                expect('id').toEqual(record.getKeyProperty());
            });
        });

        test('should trigger "onPropertyChange" if name changed', () => {
            let given;
            //@ts-ignore
            const handler = (e, data) => {
                given = data;
            };

            rs.subscribe('onPropertyChange', handler);
            rs.setKeyProperty('name');
            rs.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(given.keyProperty).toBe('name');
        });

        test('should don\'t trigger "onPropertyChange" if name don\'t changed', () => {
            let called = false;
            const handler = () => {
                called = true;
            };

            rs.setKeyProperty('name');
            rs.subscribe('onPropertyChange', handler);
            rs.setKeyProperty('name');
            rs.unsubscribe('onPropertyChange', handler);

            expect(called).toBe(false);
        });
    });

    describe('.getRecordById()', () => {
        test('should return record by id', () => {
            expect(rs.getRecordById(2).get('name')).toEqual('Petroff');
            expect(rs.getRecordById(3).get('name')).toEqual('Sidoroff');
        });
    });

    describe('.getIndexByValue()', () => {
        test('should work with default models', () => {
            const data = getItems();
            const rs = new RecordSet({
                rawData: data,
            });

            for (let i = 0; i < data.length; i++) {
                expect(rs.getIndexByValue('id', data[i].id)).toEqual(i);
            }
        });

        test('should work with custom models', () => {
            class Foo extends Model {
                // Nothing
            }
            const data = getItems();
            const rs = new RecordSet({
                rawData: data,
                model: Foo,
            });

            for (let i = 0; i < data.length; i++) {
                expect(rs.getIndexByValue('id', data[i].id)).toEqual(i);
            }
        });

        test('should return records index from recordset by value', () => {
            const data = getSbisItems();
            const rs = new RecordSet({
                rawData: data,
                adapter: 'Types/entity:adapter.Sbis',
            });

            for (let i = data.d.length; i <= 0; i--) {
                expect(rs.getIndexByValue('name', data.d[i][1])).toEqual(i);
            }
        });
    });

    describe('.getAdapter()', () => {
        test('should return adapter', () => {
            expect(rs.getAdapter()).toBeInstanceOf(JsonAdapter);
        });
    });

    describe('.getMetaData()', () => {
        test('should return meta data injected through the constructor', () => {
            const metaData = { foo: 'bar' };
            const rs = new RecordSet({ metaData });

            expect(rs.getMetaData()).toEqual(metaData);
        });

        test('should return meta data from recordset injected through the constructor', () => {
            const meta = new RecordSet();
            const rs = new RecordSet({
                // @ts-ignore старое апи для совместимости, нет смысла описывать это в основном типе
                metaData: meta,
            });
            expect(rs.getMetaData()).toBe(meta);
        });

        test('should return meta data injected through the constructor with compatible option name', () => {
            const meta = { foo: 'bar' };
            const rs = new RecordSet({ meta });
            expect(rs.getMetaData()).toEqual(meta);
        });

        test('should return meta data with given value type', () => {
            const rs = new RecordSet({
                metaData: { foo: '2001-09-11' },
                metaFormat: {
                    foo: Date,
                },
            });
            expect(rs.getMetaData().foo).toBeInstanceOf(Date);
        });

        describe('if adapter supports IMetaData interface', () => {
            test('should return meta data with value from DateTime field', () => {
                const rawData = {
                    m: {
                        d: ['2020-09-04 10:59:04.352440+03'],
                        s: [{ n: 'foo', t: 'Дата и время' }],
                    },
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                });
                const meta = rs.getMetaData();

                expect(meta.foo).toBeInstanceOf(DateTime);
                expect(meta.foo.getTime()).toBe(1599206344352);
            });

            test('should return meta data with total from Number', () => {
                const rawData = {
                    n: 1,
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                });
                const meta = rs.getMetaData();
                expect(meta.total).toBe(1);
                expect(meta.more).toBe(1);
            });

            test('should return meta data with total from Boolean', () => {
                const rawData = {
                    n: true,
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                });
                const meta = rs.getMetaData();
                expect(meta.total).toBe(true);
                expect(meta.more).toBe(true);
            });

            test('should return meta data with total from Object', () => {
                const rawData = {
                    n: {
                        after: false,
                        before: true,
                    },
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                });
                const meta = rs.getMetaData();
                expect((meta.more as IMetaDataMore)?.after).toBe(false);
                expect((meta.more as IMetaDataMore)?.before).toBe(true);
            });

            test('should return meta data with results', () => {
                const rawData = {
                    r: {
                        d: [1],
                        s: [{ n: 'id', t: 'Число целое' }],
                    },
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                });
                const meta = rs.getMetaData();

                expect(meta.results?.get('id')).toBe(1);
            });

            test('should return meta data with results of given type', () => {
                class Foo extends Model {
                    // Nothing
                }

                const rawData = {
                    r: {
                        d: [],
                        s: [],
                    },
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                    metaFormat: {
                        results: Foo,
                    },
                });

                const meta = rs.getMetaData();
                expect(meta.results).toBeInstanceOf(Foo);
            });

            test('should return meta data with path', () => {
                const rawData = {
                    p: {
                        d: [[1], [2], [5]],
                        s: [{ n: 'id', t: 'Число целое' }],
                    },
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                });
                const meta = rs.getMetaData();

                expect(meta.path?.getCount()).toBe(3);
                expect(meta.path?.at(0).get('id')).toBe(1);
                expect(meta.path?.at(1).get('id')).toBe(2);
                expect(meta.path?.at(2).get('id')).toBe(5);
            });

            test('should inherit keyProperty in path', () => {
                const rawData = {
                    p: {
                        d: [],
                        s: [
                            { n: 'id', t: 'Число целое' },
                            { n: 'title', t: 'Строка' },
                        ],
                    },
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    keyProperty: 'title',
                    rawData,
                });
                const meta = rs.getMetaData();

                expect(meta.path?.getKeyProperty()).toBe('title');
            });

            test('should return pure meta data', () => {
                const rawData = {
                    m: {
                        d: [1, 'baz'],
                        s: [
                            { n: 'foo', t: 'Число целое' },
                            { n: 'bar', t: 'Строка' },
                        ],
                    },
                };
                const rs = new RecordSet({
                    adapter: 'Types/entity:adapter.Sbis',
                    rawData,
                });
                const meta = rs.getMetaData();

                expect(meta.foo).toBe(1);
                expect(meta.bar).toBe('baz');
            });
        });
    });

    describe('.setMetaData()', () => {
        test('should set new meta', () => {
            const meta = { foo: 'bar' };
            rs.setMetaData(meta);
            expect(rs.getMetaData()).toBe(meta);
        });

        test('should trigger "onPropertyChange"', () => {
            let given;
            //@ts-ignore
            const handler = (e, data) => {
                given = data;
            };

            rs.subscribe('onPropertyChange', handler);
            const meta = { foo: 'bar' };
            rs.setMetaData(meta);
            rs.unsubscribe('onPropertyChange', handler);

            //@ts-ignore
            expect(given.metaData).toBe(meta);
        });

        test('should update existing metadata in rawData', () => {
            const rawData = {
                d: [],
                s: [
                    {
                        n: 'id',
                        t: 'Число целое',
                    },
                    {
                        n: '@name',
                        t: 'Идентификатор',
                    },
                ],
                r: {
                    d: [],
                    s: [{ n: 'id', t: 'Число целое' }],
                },
            };
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                rawData,
            });

            const meta = {
                results: new Model({
                    rawData: {
                        d: [1],
                        s: [{ n: 'id', t: 'Число целое' }],
                    },
                    adapter: 'Types/entity:adapter.Sbis',
                }),
            };
            rs.setMetaData(meta, true);
            expect(rs.getRawData().r.d[0]).toEqual(meta.results.get('id'));
        });

        test('should extend existing metadata in rawData', () => {
            const rawData = {
                d: [],
                s: [
                    {
                        n: 'id',
                        t: 'Число целое',
                    },
                    {
                        n: '@name',
                        t: 'Идентификатор',
                    },
                ],
            };
            const rs = new RecordSet({
                adapter: 'Types/entity:adapter.Sbis',
                rawData,
            });

            const meta = {
                more: true,
                path: new RecordSet({
                    rawData: {
                        d: [[1], [2], [5]],
                        s: [{ n: 'id', t: 'Число целое' }],
                    },
                    adapter: 'Types/entity:adapter.Sbis',
                }),
            };
            rs.setMetaData(meta, true);

            const resultRawData = rs.getRawData();
            expect(resultRawData.n).toBeDefined();
            expect(resultRawData.n).toEqual(meta.more);
            expect(resultRawData.p).toBeDefined();
            expect(resultRawData.p.d[0][0]).toEqual(1);
            expect(resultRawData.p.d[1][0]).toEqual(2);
            expect(resultRawData.p.d[2][0]).toEqual(5);
        });
    });

    describe('.produceInstance()', () => {
        test('should return an instance with the given raw data', () => {
            const rawData: unknown[] = [];
            const instance = RecordSet.produceInstance(rawData);

            expect(instance).toBeInstanceOf(RecordSet);
            expect(instance.getRawData(true)).toBe(rawData);
        });

        test('should return an instance with the given adapter', () => {
            const adapter = new SbisAdapter();
            const instance = RecordSet.produceInstance(null, { adapter });

            expect(instance).toBeInstanceOf(RecordSet);
            expect(instance.getAdapter()).toBe(adapter);
        });

        test('should return an instance with inherited adapter', () => {
            const adapter = new SbisAdapter();

            class Foo extends RecordSet {
                _$adapter: AdapterDescriptor = adapter;
            }

            const instance = Foo.produceInstance(null);
            expect(instance).toBeInstanceOf(Foo);
            expect(instance.getAdapter()).toBe(adapter);
        });

        test('should return an instance with the given model', () => {
            const instance = RecordSet.produceInstance([], {
                model: 'fooModel',
            });

            expect(instance).toBeInstanceOf(RecordSet);
            expect(instance.getModel()).toEqual('fooModel');
        });

        test('should return an instance with inherited model', () => {
            class Foo extends RecordSet {
                _$model: string = 'fooModel';
            }
            const instance = Foo.produceInstance([]);

            expect(instance).toBeInstanceOf(Foo);
            expect(instance.getModel()).toEqual('fooModel');
        });

        test('should return an instance with the given keyProperty', () => {
            const instance = RecordSet.produceInstance(null, {
                keyProperty: 'foo',
            });
            expect(instance.getKeyProperty()).toBe('foo');
        });
    });

    describe('.getVersion()', () => {
        test('should change version when raw data has been changed', () => {
            const version = rs.getVersion();
            rs.setRawData({
                id: 1,
                name: null,
            });
            expect(rs.getVersion()).not.toEqual(version);
        });

        test('should change version when inner model has been changed', () => {
            const version = rs.getVersion();
            rs.at(0).set('name', 'foo');
            expect(rs.getVersion()).not.toEqual(version);
        });

        test('should change version if field has been added in the format', () => {
            const version = rs.getVersion();
            rs.addField({ name: 'foo', type: 'string' });
            expect(rs.getVersion()).not.toEqual(version);
        });

        test('should change version if field has been removed from the format', () => {
            const format = getItemsFormat();
            const rs = new RecordSet({
                format,
                rawData: items,
            });

            const version = rs.getVersion();
            rs.removeField('name');
            expect(rs.getVersion()).not.toEqual(version);
        });
    });

    describe('.patch()', () => {
        function addRecord(rs: RecordSet<object, Record>, data: object): void {
            const record = new Record({
                format: rs.getFormat(),
                adapter: rs.getAdapter(),
            });
            record.set(data);
            rs.add(record);
        }

        const format = [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'string' },
        ];

        test('should return changed records', () => {
            const rs = new RecordSet({ format });

            //@ts-ignore
            addRecord(rs, { id: 1, name: 'foo' });
            //@ts-ignore
            addRecord(rs, { id: 2, name: 'bar' });
            rs.acceptChanges();

            rs.at(0).set('name', 'baz');
            const changed = RecordSet.patch(rs).get('changed');

            expect(changed.getCount()).toEqual(1);
            expect(changed.at(0).get('name')).toEqual('baz');
        });

        test('should return added records', () => {
            const rs = new RecordSet({ format });

            //@ts-ignore
            addRecord(rs, { id: 1, name: 'foo' });
            rs.acceptChanges();
            //@ts-ignore
            addRecord(rs, { id: 2, name: 'bar' });

            const added = RecordSet.patch(rs).get('added');
            expect(added.getCount()).toEqual(1);
            expect(added.at(0).get('name')).toEqual('bar');
        });

        test('should return removed records id', () => {
            const rs = new RecordSet({ format, keyProperty: 'id' });

            //@ts-ignore
            addRecord(rs, { id: 1, name: 'foo' });
            //@ts-ignore
            addRecord(rs, { id: 2, name: 'bar' });
            rs.acceptChanges();
            rs.at(0).setState(RecordState.DELETED);

            const removed = RecordSet.patch(rs).get('removed');
            expect(removed.length).toEqual(1);
            expect(removed[0]).toEqual(1);
        });

        test('should return result if no changes', () => {
            const rs = new RecordSet();
            const patch = RecordSet.patch(rs);

            expect(patch.get('changed').getCount()).toEqual(0);
            expect(patch.get('added').getCount()).toEqual(0);
            expect(patch.get('removed').length).toEqual(0);
        });
    });

    describe('.setEventRaising()', () => {
        function addRecord(rs: RecordSet<object, Record>, data: object): void {
            const record = new Record({
                format: rs.getFormat(),
                adapter: rs.getAdapter(),
            });
            record.set(data);
            rs.add(record);
        }

        const format = [
            { name: 'id', type: 'integer' },
            { name: 'name', type: 'string' },
        ];

        const rs = new RecordSet({ format });

        test('should disable and then enable onAfterCollectionChange', () => {
            let fired;
            const handler = () => {
                return (fired = true);
            };

            rs.subscribe('onAfterCollectionChange', handler);
            rs.setEventRaising(false, false);
            fired = false;

            //@ts-ignore
            addRecord(rs, { id: 1, name: 'foo' });
            expect(fired).toBe(false);

            rs.setEventRaising(true, false);
            fired = false;

            //@ts-ignore
            addRecord(rs, { id: 2, name: 'bar' });
            expect(fired).toBe(true);

            rs.unsubscribe('onAfterCollectionChange', handler);
        });

        test('should trigger onAfterCollectionChange once in session', () => {
            const readSpy = jest.fn();

            rs.subscribe('onAfterCollectionChange', readSpy);

            rs.setEventRaising(false, false);
            //@ts-ignore
            addRecord(rs, { id: 1, name: 'foo' });

            rs.setEventRaising(true, false);
            //@ts-ignore
            addRecord(rs, { id: 2, name: 'bar' });

            expect(readSpy).toHaveBeenCalled();
            rs.unsubscribe('onAfterCollectionChange', readSpy);
        });

        test('should trigger onAfterCollectionChange once in session with analyze', () => {
            const readSpy = jest.fn();

            rs.subscribe('onAfterCollectionChange', readSpy);

            rs.setEventRaising(false, true);
            //@ts-ignore
            addRecord(rs, { id: 1, name: 'foo' });
            rs.setEventRaising(true, true);

            expect(readSpy).toHaveBeenCalled();
            rs.unsubscribe('onAfterCollectionChange', readSpy);
        });

        test('should trigger onAfterCollectionChange after onCollectionChange', () => {
            const expected = ['onCollectionChange', 'onAfterCollectionChange'];
            const result: unknown[] = [];

            const handlerOn = () => {
                result.push(expected[0]);
            };
            const handlerAfter = () => {
                result.push(expected[1]);
            };

            rs.subscribe('onCollectionChange', handlerOn);
            rs.subscribe('onAfterCollectionChange', handlerAfter);

            //@ts-ignore
            addRecord(rs, { id: 1, name: 'foo' });

            expect(result).toEqual(expected);
            rs.unsubscribe('onCollectionChange', handlerOn);
            rs.unsubscribe('onAfterCollectionChange', handlerAfter);
        });
    });
});
