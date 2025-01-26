import CowAdapter from 'Types/_entity/adapter/Cow';
import CowTable from 'Types/_entity/adapter/CowTable';
import CowRecord from 'Types/_entity/adapter/CowRecord';
import IAdapter from 'Types/_entity/adapter/IAdapter';
import { EntityMarker } from 'Types/_declarations';

class Mock<T> implements IAdapter {
    readonly '[Types/_entity/adapter/IAdapter]': EntityMarker = true;

    forTable(data: T): any {
        return {
            getData: () => {
                return data;
            },
        };
    }

    forRecord(data: T): any {
        return {
            getData: () => {
                return data;
            },
        };
    }

    getKeyField(): string {
        return 'id';
    }

    getProperty(data: T, property: string): any {
        //@ts-ignore
        return data[property];
    }

    setProperty(data: T, property: string, value: any): void {
        //@ts-ignore
        data[property] = value;
    }

    serialize(): string {
        return '{}';
    }
}

describe('Types/_entity/adapter/Cow', () => {
    let original: IAdapter;
    let adapter: CowAdapter;

    beforeEach(() => {
        original = new Mock();
        adapter = new CowAdapter(original);
    });

    describe('.forTable()', () => {
        test('should return table adapter', () => {
            expect(adapter.forTable()).toBeInstanceOf(CowTable);
        });

        test('should pass data to the table adapter', () => {
            const data = [{ foo: 'bar' }];
            expect(adapter.forTable(data).getData()).toBe(data);
        });
    });

    describe('.forRecord()', () => {
        test('should return record adapter', () => {
            expect(adapter.forRecord()).toBeInstanceOf(CowRecord);
        });

        test('should pass data to the record adapter', () => {
            const data = { foo: 'bar' };
            expect(adapter.forRecord(data).getData()).toBe(data);
        });
    });

    describe('.getKeyField()', () => {
        test('should return "id"', () => {
            expect(adapter.getKeyField({})).toEqual('id');
        });
    });

    describe('.getProperty()', () => {
        test('should return the property value', () => {
            expect(adapter.getProperty({ foo: 'bar' }, 'foo')).toEqual('bar');
        });
    });

    describe('.setProperty()', () => {
        test('should set the property value', () => {
            const data = { foo: 'bar' };
            adapter.setProperty(data, 'foo', 'baz');
            expect(data.foo).toEqual('baz');
        });
    });

    describe('.getOriginal()', () => {
        test('should return original adapter', () => {
            expect(adapter.getOriginal()).toBe(original);
        });
    });

    describe('.toJSON()', () => {
        test('should serialize the adapter', () => {
            const json = adapter.toJSON();

            expect(json?.module).toBe('Types/entity:adapter.Cow');
        });
    });

    describe('.fromJSON()', () => {
        test('should restore the wrapped original', () => {
            const json = adapter.toJSON();
            const clone = (CowAdapter as any).fromJSON(json);

            expect(clone.getOriginal()).toBeInstanceOf(Mock);
        });
    });
});
