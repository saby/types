import SbisFormatController, {
    RecursiveIterator,
} from 'Types/_entity/adapter/SbisFormatController';

const format0 = [
    {
        n: '@Родитель',
        t: 'Число целое',
    },
    {
        n: 'Имя',
        t: 'Строка',
    },
    {
        n: 'Дети',
        t: {
            n: 'Массив',
            t: 'Объект',
        },
    },
];

const format1 = [
    {
        n: '@Ребёнок',
        t: 'Число целое',
    },
    {
        n: 'Имя',
        t: 'Строка',
    },
];

function getRawData(): any {
    return {
        f: 0,
        s: format0.slice(),
        d: [
            0,
            'Пётр',
            [
                {
                    f: 1,
                    s: format1.slice(),
                    d: [0, 'Вова'],
                },
                {
                    f: 1,
                    d: [0, 'Оля'],
                },
            ],
        ],
    };
}

describe('Types/_entity/adapter/SbisFormatController', () => {
    let formatController: SbisFormatController;

    beforeEach(() => {
        formatController = new SbisFormatController(getRawData());
    });

    describe('for native Iterator', () => {
        describe('._cache', () => {
            test('has id with value 0, but not 1', () => {
                formatController.getFormat(0);
                expect(format0).toEqual((formatController as any)._cache.get(0));
                expect((formatController as any)._cache.has(1)).toBe(false);
            });

            test('has all id', () => {
                expect(() => {
                    formatController.getFormat();
                }).toThrow();
                expect(format0).toEqual((formatController as any)._cache.get(0));
                expect(format1).toEqual((formatController as any)._cache.get(1));
            });
        });

        test('.getFormat()', () => {
            expect(format0).toEqual(formatController.getFormat(0));
            expect(format1).toEqual(formatController.getFormat(1));
            expect(format1).toEqual(formatController.getFormat(1));
            expect(() => {
                formatController.getFormat(2);
            }).toThrow();
        });

        test('.scanFormats()', () => {
            formatController.scanFormats(getRawData());

            expect((formatController as any)._cache.has(0)).toBe(true);
            expect(format0).toEqual((formatController as any)._cache.get(0));

            expect((formatController as any)._cache.has(1)).toBe(true);
            expect(format1).toEqual((formatController as any)._cache.get(1));
        });
    });

    describe('for pseudo Iterator', () => {
        beforeEach(() => {
            jest.spyOn(RecursiveIterator, 'doesEnvSupportIterator')
                .mockClear()
                .mockReturnValue(false);
        });

        describe('._cache', () => {
            test('has id with value 0, but not 1', () => {
                formatController.getFormat(0);
                expect(format0).toEqual((formatController as any)._cache.get(0));
                expect((formatController as any)._cache.has(1)).toBe(false);
            });

            test('has all id', () => {
                expect(() => {
                    formatController.getFormat();
                }).toThrow();
                expect(format0).toEqual((formatController as any)._cache.get(0));
                expect(format1).toEqual((formatController as any)._cache.get(1));
            });
        });

        test('.getFormat()', () => {
            expect(format0).toEqual(formatController.getFormat(0));
            expect(format1).toEqual(formatController.getFormat(1));
            expect(format1).toEqual(formatController.getFormat(1));
            expect(() => {
                formatController.getFormat(2);
            }).toThrow();
        });

        test('.scanFormats()', () => {
            formatController.scanFormats(getRawData());

            expect((formatController as any)._cache.has(0)).toBe(true);
            expect(format0).toEqual((formatController as any)._cache.get(0));

            expect((formatController as any)._cache.has(1)).toBe(true);
            expect(format1).toEqual((formatController as any)._cache.get(1));
        });
    });
});
