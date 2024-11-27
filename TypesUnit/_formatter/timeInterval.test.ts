import { default as timeInterval, TimeUnits, DisplayMode } from 'Types/_formatter/timeInterval';
import { controller } from 'I18n/i18n';

describe('Types/_formatter/timeInterval', () => {
    beforeEach(() => {
        jest.spyOn(controller, 'isEnabled', 'get').mockReturnValue(false);
    });

    describe('Display mode numeric', () => {
        test('should return null interval if it is smaller than requested', () => {
            expect(
                timeInterval({
                    time: 5,
                })
            ).toBe('0:00');
        });

        test('should return interval with lead null if it have one unit', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Second * 30,
                })
            ).toBe('0:30');
        });

        test('should return all interval in numerical mode', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Day + TimeUnits.Minute * 10 + TimeUnits.Second * 5,
                })
            ).toBe('24:10:05');
            expect(
                timeInterval({
                    time: TimeUnits.Day + TimeUnits.Minute * 10,
                })
            ).toBe('24:10:00');
        });

        test('should return two biggest units in numerical mode', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Day + TimeUnits.Minute * 10 + TimeUnits.Second * 5,
                    displayedUnitsNumber: 2,
                })
            ).toBe('24:10');
        });

        test('should return units with leading zero if value is < 10', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Hour * 5 + TimeUnits.Minute * 5 + TimeUnits.Second * 5,
                    leadZero: true,
                })
            ).toBe('05:05:05');
        });

        test('should return units with leading zero if value is 0', () => {
            expect(
                timeInterval({
                    time: 0,
                    leadZero: true,
                })
            ).toBe('00:00');
        });

        test('should return units without leading zero if value is >= 10', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Hour * 10 + TimeUnits.Minute * 10 + TimeUnits.Second * 10,
                    leadZero: true,
                })
            ).toBe('10:10:10');
        });
    });

    describe('Display mode literal', () => {
        test('should return empty if interval is smaller than requested and mode literal', () => {
            expect(
                timeInterval({
                    time: 5,
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('');
        });

        test('should return only biggest value', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Day * 2 + TimeUnits.Minute * 10,
                    displayedUnitsNumber: 1,
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('2 дн');
        });

        test('should return only two biggest value', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Hour * 2 + TimeUnits.Minute * 10,
                    displayedUnitsNumber: 2,
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('2 ч 10 мин');
        });

        test('should return interval withs all units', () => {
            expect(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14, 12, 13, 13),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('1 г 1 мес 1 дн 12 ч 13 мин 13 сек');
        });

        test('should return interval without year if years unit disable', () => {
            expect(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14),
                    displayedUnits: {
                        years: false,
                    },
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('13 мес 1 дн');

            expect(
                timeInterval({
                    startDate: new Date(2021, 6, 13),
                    finishDate: new Date(2023, 6, 13),
                    displayedUnits: {
                        years: false,
                    },
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('24 мес');
        });

        test('should return interval withs only months if interval is smaller year', () => {
            expect(
                timeInterval({
                    startDate: new Date(2023, 5, 13),
                    finishDate: new Date(2023, 6, 13),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('1 мес');

            expect(
                timeInterval({
                    startDate: new Date(2024, 0, 13),
                    finishDate: new Date(2024, 11, 1),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('10 мес 18 дн');
        });

        test('should return interval with years if interval is bigger year', () => {
            expect(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('1 г 1 мес 1 дн');

            expect(
                timeInterval({
                    startDate: new Date(2021, 6, 13),
                    finishDate: new Date(2023, 6, 13),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('2 г');
        });
    });

    describe('Display mode mixed', () => {
        test('should return null interval if it is smaller minute', () => {
            expect(
                timeInterval({
                    time: 5,
                    displayMode: DisplayMode.Mixed,
                })
            ).toBe('0:00');
        });

        test('should return interval with lead null if it have one unit', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Second * 30,
                    displayMode: DisplayMode.Mixed,
                })
            ).toBe('0:30');
        });

        test('should return interval with lead hours if seconds disable', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Minute * 30,
                    displayMode: DisplayMode.Mixed,
                    displayedUnits: {
                        seconds: false,
                    },
                })
            ).toBe('0:30');

            expect(
                timeInterval({
                    time: TimeUnits.Minute * 10,
                    displayedUnits: {
                        seconds: false,
                    },
                })
            ).toBe('0:10');
        });

        test('should return interval in numerical mode if interval is smaller day', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Hour * 23 + TimeUnits.Minute * 30,
                    displayMode: DisplayMode.Mixed,
                })
            ).toBe('23:30:00');
        });

        test('should return interval in literal mode if interval is bigger day', () => {
            expect(
                timeInterval({
                    time: TimeUnits.Day + TimeUnits.Hour * 23 + TimeUnits.Minute * 30,
                    displayMode: DisplayMode.Mixed,
                })
            ).toBe('1 дн 23 ч');
        });

        test('should return interval in literal mode and two biggest units if interval is bigger day', () => {
            expect(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14, 12, 13, 13),
                    displayMode: DisplayMode.Mixed,
                    displayedUnitsNumber: 2,
                })
            ).toBe('1 г 1 мес');
        });

        test('should return interval in literal mode for date with same month', () => {
            expect(
                timeInterval({
                    startDate: new Date(2023, 9, 3),
                    finishDate: new Date(2026, 9, 1),
                    displayMode: DisplayMode.Mixed,
                })
            ).toBe('2 г 11 мес 28 дн');
        });

        test('should return interval in literal mode for date with same month enable weeks', () => {
            expect(
                timeInterval({
                    startDate: new Date(2023, 9, 3),
                    finishDate: new Date(2026, 9, 1),
                    displayMode: DisplayMode.Mixed,
                    displayedUnits: {
                        weeks: true,
                    },
                })
            ).toBe('2 г 11 мес 4 нед');
        });
    });

    describe('Special cases', () => {
        test('end date passing over year & over month', () => {
            expect(
                timeInterval({
                    startDate: new Date(2023, 11, 1),
                    finishDate: new Date(2024, 0, 13),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('1 мес 12 дн');
        });

        test('end date passing over year & over month & over day', () => {
            expect(
                timeInterval({
                    startDate: new Date(2023, 11, 13),
                    finishDate: new Date(2024, 0, 1),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('19 дн');

            expect(
                timeInterval({
                    startDate: new Date(2022, 11, 13),
                    finishDate: new Date(2024, 0, 1),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('1 г 19 дн');

            expect(
                timeInterval({
                    startDate: new Date(2023, 11, 29),
                    finishDate: new Date(2024, 0, 22),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('24 дн');
        });

        test('end date passing over year only', () => {
            expect(
                timeInterval({
                    startDate: new Date(2022, 7, 13),
                    finishDate: new Date(2023, 1, 13),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('6 мес');
        });

        test('same year & month different date (start date < end date)', () => {
            expect(
                timeInterval({
                    startDate: new Date(2023, 11, 13),
                    finishDate: new Date(2024, 11, 14),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('1 г 1 дн');
        });

        test('same year & month different date (start date > end date)', () => {
            expect(
                timeInterval({
                    startDate: new Date(2023, 11, 13),
                    finishDate: new Date(2024, 11, 12),
                    displayMode: DisplayMode.Literal,
                })
            ).toBe('11 мес 29 дн');
        });
    });
});
