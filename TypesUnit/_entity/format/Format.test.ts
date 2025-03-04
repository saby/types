import Format from 'Types/_collection/format/Format';
import fieldsFactory from 'Types/_entity/format/fieldsFactory';

describe('Types/_entity/format/Format', () => {
    let format: Format;

    beforeEach(() => {
        format = new Format();
    });

    describe('.constructor()', () => {
        test('should throw an error if items contains not a field format', () => {
            expect(() => {
                return new Format({
                    items: [null],
                });
            }).toThrow();
        });

        test('should throw an error if items contains fields with same names', () => {
            expect(() => {
                return new Format({
                    items: [
                        fieldsFactory({ type: 'integer', name: 'f1' }),
                        fieldsFactory({ type: 'integer', name: 'f2' }),
                        fieldsFactory({ type: 'string', name: 'f1' }),
                    ],
                });
            }).toThrow();
        });
    });

    describe('.add()', () => {
        test('should throw an error if not a field format passed', () => {
            expect(() => {
                format.add(0 as any);
            }).toThrow();
        });

        test('should throw an error if field with given name already exists', () => {
            format.add(fieldsFactory({ type: 'integer', name: 'f1' }));
            expect(() => {
                format.add(fieldsFactory({ type: 'integer', name: 'f1' }));
            }).toThrow();
        });
    });

    describe('.remove()', () => {
        test('should throw an error if not a field format passed', () => {
            expect(() => {
                format.remove(1 as any);
            }).toThrow();
        });
    });

    describe('.replace()', () => {
        test('should throw an error if not a field format passed', () => {
            expect(() => {
                format.replace(2 as any, 0);
            }).toThrow();
        });

        test('should throw an error if field with given name already exists', () => {
            format.add(fieldsFactory({ type: 'integer', name: 'f1' }));
            format.add(fieldsFactory({ type: 'integer', name: 'f2' }));
            format.replace(fieldsFactory({ type: 'integer', name: 'f2' }), 1);
            expect(() => {
                format.replace(fieldsFactory({ type: 'integer', name: 'f1' }), 1);
            }).toThrow();
        });
    });

    describe('.assign()', () => {
        test('should throw an error if not a field format passed', () => {
            expect(() => {
                format.assign([3] as any);
            }).toThrow();
        });

        test('should throw an error if field with given name already exists', () => {
            format.add(fieldsFactory({ type: 'integer', name: 'f1' }));
            format.add(fieldsFactory({ type: 'integer', name: 'f2' }));
            expect(() => {
                format.assign([
                    fieldsFactory({ type: 'integer', name: 'f1' }),
                    fieldsFactory({ type: 'integer', name: '2' }),
                    fieldsFactory({ type: 'integer', name: 'f1' }),
                ]);
            }).toThrow();
        });
    });

    describe('.append()', () => {
        test('should throw an error if not a field format passed', () => {
            expect(() => {
                format.append([4] as any);
            }).toThrow();
        });

        test('should throw an error if field with given name already exists', () => {
            format.append([fieldsFactory({ type: 'integer', name: 'f1' })]);
            expect(() => {
                format.append([fieldsFactory({ type: 'integer', name: 'f1' })]);
            }).toThrow();
        });
    });

    describe('.prepend()', () => {
        test('should throw an error if not a field format passed', () => {
            expect(() => {
                format.prepend([5] as any);
            }).toThrow();
        });

        test('should throw an error if field with given name already exists', () => {
            format.prepend([fieldsFactory({ type: 'integer', name: 'f1' })]);
            expect(() => {
                format.prepend([fieldsFactory({ type: 'integer', name: 'f1' })]);
            }).toThrow();
        });
    });

    describe('.removeField()', () => {
        test('should remove field with given name', () => {
            const format = new Format({
                items: [
                    fieldsFactory({ type: 'integer', name: 'f1' }),
                    fieldsFactory({ type: 'string', name: 'f2' }),
                ],
            });
            format.removeField('f2');
            expect(format.getCount()).toBe(1);
            format.removeField('f1');
            expect(format.getCount()).toBe(0);
        });

        test('should throw an error if field with given name does not exist', () => {
            expect(() => {
                format.removeField('f1');
            }).toThrow();
        });
    });

    describe('.getFieldIndex()', () => {
        test('should return exists field index', () => {
            const format = new Format({
                items: [
                    fieldsFactory({ type: 'integer', name: 'f1' }),
                    fieldsFactory({ type: 'string', name: 'f2' }),
                ],
            });
            expect(format.getFieldIndex('f1')).toBe(0);
            expect(format.getFieldIndex('f2')).toBe(1);
        });

        test('should -1 if field does not exist', () => {
            expect(format.getFieldIndex('f1')).toBe(-1);
            expect(format.getFieldIndex('f2')).toBe(-1);
        });
    });

    describe('.getFieldName()', () => {
        test('should return field name by index', () => {
            const format = new Format({
                items: [
                    fieldsFactory({ type: 'integer', name: 'f1' }),
                    fieldsFactory({ type: 'string', name: 'f2' }),
                ],
            });
            expect(format.getFieldName(0)).toBe('f1');
            expect(format.getFieldName(1)).toBe('f2');
        });

        test('should throw an error if index is out of bounds', () => {
            expect(() => {
                format.getFieldName(0);
            }).toThrow();
        });
    });

    describe('.clone()', () => {
        test('should return the clone', () => {
            const format = new Format({
                items: [
                    fieldsFactory({ type: 'integer', name: 'f1' }),
                    fieldsFactory({ type: 'string', name: 'f2' }),
                ],
            });
            const clone: Format = format.clone();
            expect(clone).toBeInstanceOf(Format);
            expect(format).not.toEqual(clone);
            expect(format.getCount()).toBe(clone.getCount());
            for (let i = 0, count = format.getCount(); i < count; i++) {
                expect(format.at(i)).not.toEqual(clone.at(i));
                expect(format.at(i).isEqual(clone.at(i))).toBe(true);
            }
        });
    });
});
