import {
    denormalizeFormats,
    normalizeFormats,
    IFieldFormat,
    GenericFormat,
    getFormatHash,
} from 'Types/_entity/adapter/SbisFormatMixin';

describe('Types/_entity/adapter/SbisFormatMixin', () => {
    const getNestedRecord = (
        values: unknown,
        format: IFieldFormat[],
        index?: Number,
        link?: boolean
    ) => {
        switch (link) {
            case true:
                return [
                    {
                        d: values,
                        f: index,
                    },
                ];

            case false:
                return [
                    {
                        d: values,
                        f: index,
                        s: format,
                    },
                ];

            case undefined:
                return [
                    {
                        d: values,
                        s: format,
                    },
                ];
        }
    };

    describe('getFormatHash()', () => {
        test('return different hashes for different array fields', () => {
            const formatA = [{ n: 'foo', t: { n: 'Массив', t: 'Число целое' } }];
            const formatB = [{ n: 'foo', t: { n: 'Массив', t: 'Строка' } }];

            expect(getFormatHash(formatA)).not.toEqual(getFormatHash(formatB));
        });

        test('return different hashes for different flags fields', () => {
            const formatA = [{ n: 'foo', t: { n: 'Флаги', s: { 0: 'bar' } } }];
            const formatB = [{ n: 'foo', t: { n: 'Флаги', s: { 1: 'bar' } } }];

            expect(getFormatHash(formatA)).not.toEqual(getFormatHash(formatB));
        });
    });

    describe('normalizeFormats()', () => {
        test('should return return normalized data for repeatable format', () => {
            const nestedFormat = [{ n: 'bar', t: 'Число целое' }];

            const data = {
                s: [{ n: 'foo', t: 'Запись' }],
                d: [
                    getNestedRecord([1], nestedFormat),
                    getNestedRecord([2], nestedFormat),
                    getNestedRecord([3], nestedFormat),
                ],
            };
            const expectedData = {
                s: [{ n: 'foo', t: 'Запись' }],
                f: 0,
                d: [
                    getNestedRecord([1], nestedFormat, 1, false),
                    getNestedRecord([2], nestedFormat, 1, true),
                    getNestedRecord([3], nestedFormat, 1, true),
                ],
            };

            expect(normalizeFormats(data)).toEqual(expectedData);
        });

        test('should return return normalized data for mixture of formats', () => {
            const nestedFormatA = [{ n: 'foo', t: 'Число целое' }];
            const nestedFormatB = [{ n: 'bar', t: 'Строка' }];

            const data = [
                getNestedRecord([1], nestedFormatA),
                getNestedRecord(['a'], nestedFormatB),
                getNestedRecord([2], nestedFormatA),
            ];

            const expectedData = [
                getNestedRecord([1], nestedFormatA, 0, false),
                getNestedRecord(['a'], nestedFormatB, 1, false),
                getNestedRecord([2], nestedFormatA, 0, true),
            ];

            expect(normalizeFormats(data)).toEqual(expectedData);
        });

        test('identical formats with different typeNames are considered unique', () => {
            const format = [{ n: 'Id', t: 'Число целое' }];

            const data = {
                d: [
                    {
                        d: [1],
                        s: format,
                        tp: 'User',
                    },
                    {
                        d: [2],
                        s: format,
                        tp: 'Employee',
                    },
                    {
                        d: [3],
                        s: format,
                        tp: 'Company',
                    },
                ],
                s: [{ n: 'Filter', t: 'Запись' }],
            };

            const expectedData = {
                d: [
                    {
                        d: [1],
                        s: format,
                        tp: 'User',
                        f: 1,
                    },
                    {
                        d: [2],
                        s: format,
                        tp: 'Employee',
                        f: 2,
                    },
                    {
                        d: [3],
                        s: format,
                        tp: 'Company',
                        f: 3,
                    },
                ],
                f: 0,
                s: [{ n: 'Filter', t: 'Запись' }],
            };

            expect(normalizeFormats(data)).toEqual(expectedData);
        });
    });

    describe('denormalizeFormats()', () => {
        test('should return data with resolved formats', () => {
            const nestedFormat = [{ n: 'bar', t: 'Число целое' }];

            const data = {
                d: [
                    getNestedRecord([1], nestedFormat, 0, false),
                    getNestedRecord([2], nestedFormat, 0, true),
                    getNestedRecord([3], nestedFormat, 0, true),
                ],
                s: [{ n: 'foo', t: 'Запись' }],
            };

            //@ts-ignore
            denormalizeFormats(data);

            expect(data.d).toEqual([
                getNestedRecord([1], nestedFormat),
                getNestedRecord([2], nestedFormat),
                getNestedRecord([3], nestedFormat),
            ]);
        });

        test('should deal with not an object', () => {
            expect(() => {
                //@ts-ignore
                denormalizeFormats('Foo' as unknown as GenericFormat);
            }).not.toThrow();
        });
    });
});
