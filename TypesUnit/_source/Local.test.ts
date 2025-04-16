import Local, { IOptions } from 'Types/_source/Local';
import Query, { andExpression, Join as QueryJoin } from 'Types/_source/Query';
import JsonTable from 'Types/_entity/adapter/JsonTable';
import RecordSetAdapter from 'Types/_entity/adapter/RecordSet';
import IDataHolder from 'Types/_entity/adapter/IDataHolder';
import ITable from 'Types/_entity/adapter/ITable';
import { ExtendDate, IExtendDateConstructor } from 'Types/_declarations';

class TestLocal extends Local {
    constructor(
        options?: IOptions,
        protected tableData?: unknown
    ) {
        super(options);
    }

    protected _applyFrom(_from?: string): any {
        return undefined;
    }

    protected _applyJoin(_data: any, _join: QueryJoin[]): any {
        return undefined;
    }

    protected _getTableAdapter(): ITable {
        return new JsonTable(this.tableData as any);
    }
}

describe('Types/_source/Local', () => {
    let source: TestLocal;

    beforeEach(() => {
        source = new TestLocal();
    });

    describe('.create()', () => {
        test('should generate a request with Date field', () => {
            const date = new Date() as ExtendDate;
            if (!date.setSQLSerializationMode) {
                return Promise.resolve();
            }

            date.setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE);
            const meta = { foo: date };
            return source.create(meta).then((data) => {
                expect(data.get('foo')).toBeInstanceOf(Date);
                expect(data.get('foo').getSQLSerializationMode()).toBe(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_DATE
                );
            });
        });

        test('should generate a request with Time field', () => {
            const date = new Date() as ExtendDate;
            if (!date.setSQLSerializationMode) {
                return Promise.resolve();
            }

            date.setSQLSerializationMode((Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME);
            const meta = { foo: date };
            return source.create(meta).then((data) => {
                expect(data.get('foo')).toBeInstanceOf(Date);
                expect(data.get('foo').getSQLSerializationMode()).toBe(
                    (Date as IExtendDateConstructor).SQL_SERIALIZE_MODE_TIME
                );
            });
        });
    });

    describe('.query()', () => {
        test('should throw error if andExpression() has been used', () => {
            const query = new Query();
            query.where(andExpression());
            expect(() => {
                source.query(query);
            }).toThrow();
        });
    });

    describe('.getAdapter()', () => {
        test('should return an adapter with data reference if IDataHolder is supported', () => {
            const tableData = {};
            const adapter = new RecordSetAdapter();
            const localSource = new TestLocal({ adapter }, tableData);
            const returnedAdapter = localSource.getAdapter() as unknown as IDataHolder<unknown>;

            expect(returnedAdapter.dataReference).toBe(tableData);
        });
    });
});
