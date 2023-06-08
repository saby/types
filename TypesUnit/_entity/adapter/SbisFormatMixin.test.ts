import { assert } from 'chai';
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
        it('return different hashes for different array fields', () => {
            const formatA = [
                { n: 'foo', t: { n: 'Массив', t: 'Число целое' } },
            ];
            const formatB = [{ n: 'foo', t: { n: 'Массив', t: 'Строка' } }];

            assert.notEqual(getFormatHash(formatA), getFormatHash(formatB));
        });

        it('return different hashes for different flags fields', () => {
            const formatA = [{ n: 'foo', t: { n: 'Флаги', s: { 0: 'bar' } } }];
            const formatB = [{ n: 'foo', t: { n: 'Флаги', s: { 1: 'bar' } } }];

            assert.notEqual(getFormatHash(formatA), getFormatHash(formatB));
        });
    });

    describe('normalizeFormats()', () => {
        it('should return return normalized data for repeatable format', () => {
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

            assert.deepEqual(normalizeFormats(data), expectedData);
        });

        it('should return return normalized data for mixture of formats', () => {
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

            assert.deepEqual(normalizeFormats(data), expectedData);
        });
    });

    describe('denormalizeFormats()', () => {
        it('should return data with resolved formats', () => {
            const nestedFormat = [{ n: 'bar', t: 'Число целое' }];

            const data = {
                d: [
                    getNestedRecord([1], nestedFormat, 0, false),
                    getNestedRecord([2], nestedFormat, 0, true),
                    getNestedRecord([3], nestedFormat, 0, true),
                ],
                s: [{ n: 'foo', t: 'Запись' }],
            };

            denormalizeFormats(data);

            assert.deepEqual(data.d, [
                getNestedRecord([1], nestedFormat),
                getNestedRecord([2], nestedFormat),
                getNestedRecord([3], nestedFormat),
            ]);
        });

        it('should deal with not an object', () => {
            assert.doesNotThrow(() => {
                denormalizeFormats('Foo' as unknown as GenericFormat);
            });
        });
    });
});
