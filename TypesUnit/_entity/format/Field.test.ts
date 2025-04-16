import Field from 'Types/_entity/format/Field';
import { register } from 'Types/di';

class TestField extends Field {
    protected _moduleName: string = 'TypesUnit/_entity/format/Field.test:TestField';
}
register('TypesUnit/_entity/format/Field.test:TestField', TestField, {
    instantiate: false,
});

describe('Types/_entity/format/Field', () => {
    let field: TestField;

    beforeEach(() => {
        field = new TestField();
    });

    describe('.getType()', () => {
        test('should return empty string by default', () => {
            expect(field.getType()).toBe('');
        });

        test('should return the value passed to the constructor', () => {
            const type = 'foo';
            const field = new TestField({ type });
            expect(field.getType()).toBe(type);
        });
    });

    describe('.getDefaultValue()', () => {
        test('should return null by default', () => {
            expect(field.getDefaultValue()).toBeNull();
        });

        test('should return the value passed to the constructor', () => {
            const defaultValue = 'a';
            const field = new TestField({ defaultValue });
            expect(field.getDefaultValue()).toBe(defaultValue);
        });
    });

    describe('.setDefaultValue()', () => {
        test('should set the default value', () => {
            const value = 'a';
            field.setDefaultValue(value);
            expect(field.getDefaultValue()).toBe(value);
        });
    });

    describe('.getName()', () => {
        test('should return empty string by default', () => {
            expect(field.getName()).toBe('');
        });

        test('should return the value passed to the constructor', () => {
            const name = 'a';
            const field = new TestField({ name });
            expect(field.getName()).toBe(name);
        });
    });

    describe('.setName()', () => {
        test('should set the name', () => {
            const name = 'a';
            field.setName(name);
            expect(field.getName()).toBe(name);
        });
    });

    describe('.isNullable()', () => {
        test('should return true by default', () => {
            expect(field.isNullable()).toBe(true);
        });

        test('should return the value passed to the constructor', () => {
            const nullable = true;
            const field = new TestField({ nullable });
            expect(field.isNullable()).toBe(nullable);
        });
    });

    describe('.setNullable()', () => {
        test('should set the nullable option', () => {
            const nullable = true;
            field.setNullable(nullable);
            expect(field.isNullable()).toBe(nullable);
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const clone: Field = field.clone();
            expect(clone).toBeInstanceOf(Field);
            expect(field).not.toEqual(clone);
            expect(field.getType()).toBe(clone.getType());
            expect(field.getName()).toBe(clone.getName());
            expect(field.getDefaultValue()).toBe(clone.getDefaultValue());
            expect(field.isNullable()).toBe(clone.isNullable());
            expect(field.isEqual(clone)).toBe(true);
        });
    });

    describe('.copyFrom()', () => {
        test('should return the same configured object', () => {
            const name = 'a';
            const defaultValue = 'b';
            const nullable = true;
            const donor = new TestField({
                name,
                defaultValue,
                nullable,
            });
            const acceptor = new TestField();
            acceptor.copyFrom(donor);

            expect(donor.getName()).toBe(acceptor.getName());
            expect(donor.getDefaultValue()).toBe(acceptor.getDefaultValue());
            expect(donor.isNullable()).toBe(acceptor.isNullable());
        });
    });

    describe('.isEqual()', () => {
        test('should return true', () => {
            const other = new TestField();
            expect(field.isEqual(other)).toBe(true);
        });

        test('should return false for different module', () => {
            class Ext extends Field {
                // Nothing
            }

            const other = new Ext();
            expect(field.isEqual(other)).toBe(false);
        });

        test('should return false for different name', () => {
            const other = new TestField({
                name: 'a',
            });
            expect(field.isEqual(other)).toBe(false);
        });

        test('should return false for different defaultValue', () => {
            const other = new TestField({
                defaultValue: 'a',
            });
            expect(field.isEqual(other)).toBe(false);
        });

        test('should return false for different nullable', () => {
            const other = new TestField({
                nullable: false,
            });
            expect(field.isEqual(other)).toBe(false);
        });
    });
});
