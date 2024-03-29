import {
    default as timeInterval,
    TimeUnits,
    DisplayMode,
} from 'Types/_formatter/timeInterval';
import { controller } from 'I18n/i18n';
import { assert } from 'chai';
import { stub } from 'sinon';

describe('Types/_formatter/timeInterval', () => {
    let stubEnabled;

    before(() => {
        stubEnabled = stub(controller, 'isEnabled');
        stubEnabled.get(() => {
            return false;
        });
    });

    after(() => {
        stubEnabled.restore();
    });

    describe('Display mode numeric', () => {
        it('should return null interval if it is smaller than requested', () => {
            assert.strictEqual(
                timeInterval({
                    time: 5,
                }),
                '0:00'
            );
        });

        it('should return interval with lead null if it have one unit', () => {
            assert.strictEqual(
                timeInterval({
                    time: TimeUnits.Second * 30,
                }),
                '0:30'
            );
        });

        it('should return all interval in numerical mode', () => {
            assert.strictEqual(
                timeInterval({
                    time:
                        TimeUnits.Day +
                        TimeUnits.Minute * 10 +
                        TimeUnits.Second * 5,
                }),
                '24:10:05'
            );
            assert.strictEqual(
                timeInterval({
                    time: TimeUnits.Day + TimeUnits.Minute * 10,
                }),
                '24:10:00'
            );
        });

        it('should return two biggest units in numerical mode', () => {
            assert.strictEqual(
                timeInterval({
                    time:
                        TimeUnits.Day +
                        TimeUnits.Minute * 10 +
                        TimeUnits.Second * 5,
                    displayedUnitsNumber: 2,
                }),
                '24:10'
            );
        });
    });

    describe('Display mode literal', () => {
        it('should return empty if interval is smaller than requested and mode literal', () => {
            assert.strictEqual(
                timeInterval({
                    time: 5,
                    displayMode: DisplayMode.Literal,
                }),
                ''
            );
        });

        it('should return only biggest value', () => {
            assert.strictEqual(
                timeInterval({
                    time: TimeUnits.Day * 2 + TimeUnits.Minute * 10,
                    displayedUnitsNumber: 1,
                    displayMode: DisplayMode.Literal,
                }),
                '2 дн'
            );
        });

        it('should return only two biggest value', () => {
            assert.strictEqual(
                timeInterval({
                    time: TimeUnits.Hour * 2 + TimeUnits.Minute * 10,
                    displayedUnitsNumber: 2,
                    displayMode: DisplayMode.Literal,
                }),
                '2 ч 10 мин'
            );
        });

        it('should return interval withs all units', () => {
            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14, 12, 13, 13),
                    displayMode: DisplayMode.Literal,
                }),
                '1 г 1 мес 1 дн 12 ч 13 мин 13 сек'
            );
        });

        it('should return interval without year if years unit disable', () => {
            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14),
                    displayedUnits: {
                        years: false,
                    },
                    displayMode: DisplayMode.Literal,
                }),
                '13 мес 1 дн'
            );

            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2021, 6, 13),
                    finishDate: new Date(2023, 6, 13),
                    displayedUnits: {
                        years: false,
                    },
                    displayMode: DisplayMode.Literal,
                }),
                '24 мес'
            );
        });

        it('should return interval withs only moths if interval is smaller year', () => {
            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2023, 5, 13),
                    finishDate: new Date(2023, 6, 13),
                    displayMode: DisplayMode.Literal,
                }),
                '1 мес'
            );

            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2022, 7, 13),
                    finishDate: new Date(2023, 1, 13),
                    displayMode: DisplayMode.Literal,
                }),
                '6 мес'
            );

            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2022, 7, 13),
                    finishDate: new Date(2023, 6, 13),
                    displayMode: DisplayMode.Literal,
                }),
                '11 мес'
            );
        });

        it('should return interval with years if interval is bigger year', () => {
            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14),
                    displayMode: DisplayMode.Literal,
                }),
                '1 г 1 мес 1 дн'
            );

            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2021, 6, 13),
                    finishDate: new Date(2023, 6, 13),
                    displayMode: DisplayMode.Literal,
                }),
                '2 г'
            );
        });
    });

    describe('Display mode mixed', () => {
        it('should return null interval if it is smaller minute', () => {
            assert.strictEqual(
                timeInterval({
                    time: 5,
                    displayMode: DisplayMode.Mixed,
                }),
                '0:00'
            );
        });

        it('should return interval with lead null if it have one unit', () => {
            assert.strictEqual(
                timeInterval({
                    time: TimeUnits.Second * 30,
                    displayMode: DisplayMode.Mixed,
                }),
                '0:30'
            );
        });

        it('should return interval with lead hours if seconds disable', () => {
            assert.strictEqual(
                timeInterval({
                    time: TimeUnits.Minute * 30,
                    displayMode: DisplayMode.Mixed,
                    displayedUnits: {
                        seconds: false,
                    },
                }),
                '0:30'
            );
        });

        it('should return interval in numerical mode if interval is smaller day', () => {
            assert.strictEqual(
                timeInterval({
                    time: TimeUnits.Hour * 23 + TimeUnits.Minute * 30,
                    displayMode: DisplayMode.Mixed,
                }),
                '23:30:00'
            );
        });

        it('should return interval in literal mode if interval is bigger day', () => {
            assert.strictEqual(
                timeInterval({
                    time:
                        TimeUnits.Day +
                        TimeUnits.Hour * 23 +
                        TimeUnits.Minute * 30,
                    displayMode: DisplayMode.Mixed,
                }),
                '1 дн 23 ч'
            );
        });

        it('should return interval in literal mode and two biggest units if interval is bigger day', () => {
            assert.strictEqual(
                timeInterval({
                    startDate: new Date(2022, 5, 13),
                    finishDate: new Date(2023, 6, 14, 12, 13, 13),
                    displayMode: DisplayMode.Mixed,
                    displayedUnitsNumber: 2,
                }),
                '1 г 1 мес'
            );
        });
    });
});
