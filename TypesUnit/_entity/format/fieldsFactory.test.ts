import {
    fieldsFactory,
    ArrayField,
    BinaryField,
    BooleanField,
    DateField,
    DateTimeField,
    EnumField,
    FlagsField,
    IdentityField,
    IntegerField,
    LinkField,
    ObjectField,
    RealField,
    RecordField,
    RecordSetField,
    RpcFileField,
    MoneyField,
    StringField,
    UuidField,
    TimeField,
    TimeIntervalField,
    XmlField,
} from 'Types/_entity/format';
import RecordSet from 'Types/_collection/RecordSet';
import Record from 'Types/_entity/Record';
import Enum from 'Types/_collection/Enum';
import Flags from 'Types/_collection/Flags';

describe('Types/_entity/format/FieldsFactory', () => {
    test('should throw an error if not simple object passed', () => {
        expect(() => {
            //@ts-ignore
            fieldsFactory(undefined);
        }).toThrow();
        expect(() => {
            //@ts-ignore
            fieldsFactory(null);
        }).toThrow();
        expect(() => {
            fieldsFactory(false as any);
        }).toThrow();
        expect(() => {
            fieldsFactory(true as any);
        }).toThrow();
        expect(() => {
            fieldsFactory(0 as any);
        }).toThrow();
        expect(() => {
            fieldsFactory(1 as any);
        }).toThrow();
        expect(() => {
            fieldsFactory('' as any);
        }).toThrow();
        expect(() => {
            fieldsFactory([] as any);
        }).toThrow();
    });

    test('should throw an error for unknown type', () => {
        expect(() => {
            fieldsFactory({
                name: 'foo',
                type: 'a',
            });
        }).toThrow();
    });

    test('should create boolean', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'boolean',
        });
        expect(field).toBeInstanceOf(BooleanField);
    });

    test('should create nullable boolean', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'boolean',
            nullable: false,
        });
        expect(field.isNullable()).toBe(false);
    });

    test('should create integer', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'integer',
        });
        expect(field).toBeInstanceOf(IntegerField);
    });

    test('should create real from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'real',
        });
        expect(field).toBeInstanceOf(RealField);
    });

    test('should create real from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Number,
        });
        expect(field).toBeInstanceOf(RealField);
    });

    test('should create money', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'money',
        });
        expect(field).toBeInstanceOf(MoneyField);
    });

    test('should create string from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'string',
        });
        expect(field).toBeInstanceOf(StringField);
    });

    test('should create string from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: String,
        });
        expect(field).toBeInstanceOf(StringField);
    });

    test('should create deprecated text as string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'text',
        });
        expect(field).toBeInstanceOf(StringField);
    });

    test('should create xml', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'xml',
        });
        expect(field).toBeInstanceOf(XmlField);
    });

    test('should create datetime', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'datetime',
        });
        expect(field).toBeInstanceOf(DateTimeField);
    });

    test('should create date from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'date',
        });
        expect(field).toBeInstanceOf(DateField);
    });

    test('should create date from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Date,
        });
        expect(field).toBeInstanceOf(DateField);
    });

    test('should create time', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'time',
        });
        expect(field).toBeInstanceOf(TimeField);
    });

    test('should create timeinterval', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'timeinterval',
        });
        expect(field).toBeInstanceOf(TimeIntervalField);
    });

    test('should create link', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'link',
        });
        expect(field).toBeInstanceOf(LinkField);
    });

    test('should create identity', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'identity',
        });
        expect(field).toBeInstanceOf(IdentityField);
    });

    test('should create enum from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'enum',
        });
        expect(field).toBeInstanceOf(EnumField);
    });

    test('should create enum from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Enum,
        });
        expect(field).toBeInstanceOf(EnumField);
    });

    test('should create enum from alias', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'Types/collection:Enum',
        });
        expect(field).toBeInstanceOf(EnumField);
    });

    test('should create flags from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'flags',
        });
        expect(field).toBeInstanceOf(FlagsField);
    });

    test('should create flags from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Flags,
        });
        expect(field).toBeInstanceOf(FlagsField);
    });

    test('should create record from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'record',
        });
        expect(field).toBeInstanceOf(RecordField);
    });

    test('should create record from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Record,
        });
        expect(field).toBeInstanceOf(RecordField);
    });

    test('should create recordset from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'recordset',
        });
        expect(field).toBeInstanceOf(RecordSetField);
    });

    test('should create recordset from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: RecordSet,
        });
        expect(field).toBeInstanceOf(RecordSetField);
    });

    test('should create binary', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'binary',
        });
        expect(field).toBeInstanceOf(BinaryField);
    });

    test('should create uuid', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'uuid',
        });
        expect(field).toBeInstanceOf(UuidField);
    });

    test('should create rpcfile', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'rpcfile',
        });
        expect(field).toBeInstanceOf(RpcFileField);
    });

    test('should create deprecated hierarchy as identity', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'hierarchy',
        });
        expect(field).toBeInstanceOf(IdentityField);
    });

    test('should create object from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'object',
        });
        expect(field).toBeInstanceOf(ObjectField);
    });

    test('should create object from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Object,
        });
        expect(field).toBeInstanceOf(ObjectField);
    });

    test('should create array from string', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: 'array',
        });
        expect(field).toBeInstanceOf(ArrayField);
    });

    test('should create array from constructor', () => {
        const field = fieldsFactory({
            name: 'foo',
            type: Array,
        });
        expect(field).toBeInstanceOf(ArrayField);
    });
});
