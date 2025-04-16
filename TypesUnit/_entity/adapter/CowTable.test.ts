import CowTableAdapter from 'Types/_entity/adapter/CowTable';
import IAdapter from 'Types/_entity/adapter/IAdapter';
import ITable from 'Types/_entity/adapter/ITable';
import IRecord from 'Types/_entity/adapter/IRecord';
import { EntityMarker } from 'Types/_declarations';

//@ts-ignore
class MockTable<T> implements ITable {
    readonly '[Types/_entity/adapter/ITable]': EntityMarker = true;
    isClone: boolean;
    protected data: T[];

    constructor(data: T[], cloneable?: boolean) {
        this.data = data;
        if (cloneable) {
            //@ts-ignore
            this['[Types/_entity/ICloneable]'] = true;
        }
    }

    getFields(): string[] {
        return [];
    }

    getCount(): number {
        return 0;
    }

    getData(): T[] {
        return this.data;
    }

    add(record: T, at: number): void {
        this.data[at] = record;
    }

    at(index: number): T {
        return this.data[index];
    }

    remove(at: number): void {
        this.data.splice(at, 1);
    }

    replace(record: T, at: number): void {
        this.data[at] = record;
    }

    move(): void {
        // Just do nothing
    }

    merge(): void {
        // Just do nothing
    }

    copy(): void {
        // Just do nothing
    }

    clear(): void {
        this.data.length = 0;
    }

    clone(): ITable {
        const clone = new MockTable(this.data);
        clone.isClone = true;
        //@ts-ignore
        return clone;
    }

    getFormat(): object {
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
    isCloneable: boolean | undefined;
    lastTableAdapter: MockTable<T>;

    constructor(cloneable?: boolean) {
        this.isCloneable = cloneable;
    }

    forTable(data: T[]): ITable {
        this.lastTableAdapter = new MockTable(data, this.isCloneable);
        //@ts-ignore
        return this.lastTableAdapter;
    }

    forRecord(): IRecord {
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

describe('Types/_entity/adapter/CowTable', () => {
    let data: object[];
    let original: IAdapter;
    let adapter: CowTableAdapter;

    beforeEach(() => {
        data = [];
        original = new Mock();
        adapter = new CowTableAdapter(data, original);
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

    describe('.getCount()', () => {
        test('should return 0', () => {
            expect(adapter.getCount()).toBe(0);
        });

        test('should leave data shared', () => {
            adapter.getCount();
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.add()', () => {
        test('should append a record into the copy', () => {
            adapter.add({ foo: 'bar' }, 0);

            expect(adapter.getData()).not.toEqual(data);
            expect(data.length).toBe(0);
            expect(adapter.getData().length).toBe(1);
            expect(adapter.getData()[0].foo).toBe('bar');
        });

        test('should copy the data once', () => {
            adapter.add({ foo: 'bar' }, 0);
            const data = adapter.getData();
            adapter.add({ foo: 'baz' }, 1);

            expect(adapter.getData()).toBe(data);
            expect(adapter.getData().length).toBe(2);
        });

        test('should use ICloneable interface if supported', () => {
            const original = new Mock(true);
            const adapter = new CowTableAdapter(data, original);

            //@ts-ignore
            expect((adapter.getOriginal() as MockTable<object>).isClone).not.toBeDefined();
            adapter.add({ foo: 'bar' }, 0);
            //@ts-ignore
            expect((adapter.getOriginal() as MockTable<object>).isClone).toBe(true);
        });
    });

    describe('.at()', () => {
        test('should return valid record', () => {
            const data = [{ foo: 'bar' }];
            const original = new Mock<IData>();
            const adapter = new CowTableAdapter(data, original);

            expect(adapter.at(0).foo).toBe('bar');
        });

        test('should leave data shared', () => {
            const data = [{ foo: 'bar' }];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.at(0);
            expect(adapter.getData()).toBe(data);
        });
    });

    describe('.remove()', () => {
        test('should remove the record in the copy', () => {
            const data = [{ foo: 'bar' }];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.remove(0);

            expect(adapter.getData()).not.toEqual(data);
            expect(data.length).toEqual(1);
            expect(adapter.getData().length).toBe(0);
        });
    });

    describe('.replace()', () => {
        test('should replace the record in the copy', () => {
            const data = [{ foo: 'bar' }];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.replace({ foo: 'baz' }, 0);

            expect(adapter.getData()).not.toEqual(data);
            expect(data[0].foo).toEqual('bar');
            expect(adapter.getData()[0].foo).toBe('baz');
        });
    });

    describe('.move()', () => {
        test('should copy the data', () => {
            const data = [{ foo: 'bar' }, { foo: 'baz' }];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.move(1, 0);

            expect(adapter.getData()).toEqual(data);
            expect(adapter.getData() !== data).toBeTruthy();
        });
    });

    describe('.merge()', () => {
        test('should copy the data', () => {
            const data = [{ foo: 'bar' }, { foo: 'baz' }];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.merge(0, 1, 'foo');

            expect(adapter.getData()).toEqual(data);
            expect(adapter.getData() !== data).toBeTruthy();
        });
    });

    describe('.copy()', () => {
        test('should copy the data', () => {
            const data = [{ foo: 'bar' }];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.copy(0);

            expect(adapter.getData()).toEqual(data);
            expect(adapter.getData() !== data).toBeTruthy();
        });
    });

    describe('.clear()', () => {
        test('should clear copy of the data', () => {
            const data = [{ foo: 'bar' }];
            const original = new Mock();
            const adapter = new CowTableAdapter(data, original);

            adapter.clear();
            expect(adapter.getData()).not.toEqual(data);
            expect(data.length).toEqual(1);
            expect(adapter.getData().length).toBe(0);
        });
    });

    describe('.getData()', () => {
        test('should return the raw data', () => {
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
            expect(adapter.getOriginal()).toBe((original as Mock<object>).lastTableAdapter);
        });
    });
});
