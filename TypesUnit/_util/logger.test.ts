import logger from 'Types/_util/logger';

describe('Types/_util/object', () => {
    describe('.logger', () => {
        test('should have log() method', () => {
            expect(typeof logger.log).toBe('function');
        });

        test('should have error() method', () => {
            expect(typeof logger.error).toBe('function');
        });

        test('should have info() method', () => {
            expect(typeof logger.info).toBe('function');
        });

        test('should have stack() method', () => {
            expect(typeof logger.stack).toBe('function');
        });
    });
});
