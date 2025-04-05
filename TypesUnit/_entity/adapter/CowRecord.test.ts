import CowRecordAdapter from 'Types/_entity/adapter/CowRecord';
import IAdapter from 'Types/_entity/adapter/IAdapter';
import ITable from 'Types/_entity/adapter/ITable';
import IRecord from 'Types/_entity/adapter/IRecord';
import { EntityMarker } from 'Types/_declarations';

//@ts-ignore
class MockRecord<T> implements IRecord {
    readonly '[Types/_entity/adapter/IRecord]': EntityMarker = true;
    isClone: boolean;
    protected data: T;

    constructor(data: T, cloneable?: boolean) {
        this.data = data;
        if (cloneable) {
            //@ts-ignore
            this['[Types/_entity/ICloneable]'] = true;
        }
    }

    has(): boolean {
        return true;
    }

    get(name: string): any {
        //@ts-ignore
        return this.data[name];
    }

    set(name: string, value: any): void {
        //@ts-ignore
        this.data[name] = value;
    }

    clear(): void {
        this.data = {} as T;
    }

    clone(): MockRecord<T> {
        const clone = new MockRecord(this.data);
        clone.isClone = true;
        return clone;
    }

    getData(): T {
        return this.data;
    }

    getFields(): string[] {
        return [];
    }

    getFormat(): any {
        return {};
    }

    getSharedFormat(): any {
        return {};
    }

    addField(): void {
        // Just do nothing
    }

    removeField(): void {
        // Just do nothing
    }

    removeFieldAt(): void {
        // Just do nothing
    }
}

class Mock<T> implements IAdapter {
    readonly '[Types/_entity/adapter/IAdapter]': EntityMarker = true;
    readonly isCloneable: boolean | undefined;
    lastRecordAdapter: MockRecord<T>;

    constructor(cloneable?: boolean) {
        this.isCloneable = cloneable;
    }

    forRecord(data: T): IRecord {
        this.lastRecordAdapter = new MockRecord(data, this.isCloneable);
        //@ts-ignore
        return this.lastRecordAdapter;
    }

    forTable(): ITable {
        //@ts-ignore
        return undefined;
    }

    getKeyField(): string {
        return '';
    }

    getProperty(): any {
        return;
    }

    serialize(): any {
        return;
    }

    setProperty(): void {
        // Just do nothing
    }
}

interface IData {
    foo: string;
}

describe('Types/_entity/adapter/CowRecord', () => {
    let data: IData;
    let original: IAdapter;
    let adapter: CowRecordAdapter;

    beforeEach(() => {
        data = { foo: 'bar' };
        original = new Mock();
        adapter = new CowRecordAdapter(data, original);
    });

    describe('.get()', () => {
        test('should return the property value from shared data', () => {
            expect(adapter.get('foo')).toEqual('bar');
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.set()', () => {
        test('should set the property value into the copy', () => {
            adapter.set('foo', 'baz');

            expect(adapter.getData()).not.toEqual(data);
            expect(data.foo).toEqual('bar');
            expect(adapter.getData().foo).toEqual('baz');
        });

        test('should copy the data once', () => {
            adapter.set('foo', 'baz');
            const data = adapter.getData();
            adapter.set('foo', 'bax');

            expect(adapter.getData()).toBe(data);
        });

        test('should use ICloneable interface if supported', () => {
            const original = new Mock(true);
            const adapter = new CowRecordAdapter(data, original);

            //@ts-ignore
            expect((adapter.getOriginal() as MockRecord<IData>).isClone).not.toBeDefined();
            adapter.set('foo', 'baz');
            //@ts-ignore
            expect((adapter.getOriginal() as MockRecord<IData>).isClone).toBe(true);
        });
    });

    describe('.clear()', () => {
        test('should clear copy of the data', () => {
            adapter.clear();
            expect(adapter.getData()).not.toEqual(data);
            expect(Object.keys(data).length).not.toEqual(0);
            expect(Object.keys(adapter.getData()).length).toEqual(0);
        });
    });

    describe('.getData()', () => {
        test('should return raw data', () => {
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.getFields()', () => {
        test('should return an empty array', () => {
            expect(adapter.getFields().length).toBe(0);
        });

        test('should leave data shared', () => {
            adapter.getFields();
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.getFormat()', () => {
        test('should return an empty Object', () => {
            expect(Object.keys(adapter.getFormat('foo')).length).toEqual(0);
        });

        test('should leave data shared', () => {
            adapter.getFormat('foo');
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.addField()', () => {
        test('should copy the data', () => {
            adapter.addField({} as any, 0);
            expect(adapter.getData()).toEqual(data);
            expect(adapter.getData() !== data).toBeTruthy();
        });
    });

    describe('.removeField()', () => {
        test('should copy the data', () => {
            adapter.removeField('foo');
            expect(adapter.getData()).toEqual(data);
            expect(adapter.getData() !== data).toBeTruthy();
        });
    });

    describe('.removeFieldAt()', () => {
        test('should copy the data', () => {
            adapter.removeFieldAt(0);
            expect(adapter.getData()).toEqual(data);
            expect(adapter.getData() !== data).toBeTruthy();
        });
    });

    describe('.getOriginal()', () => {
        test('should return the original adapter', () => {
            expect(adapter.getOriginal()).toBe((original as Mock<IData>).lastRecordAdapter);
        });
    });
});
