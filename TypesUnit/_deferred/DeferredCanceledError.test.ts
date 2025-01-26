import { DeferredCanceledError } from 'Types/deferred';

describe('Types/deferred:DeferredCanceledError', () => {
    let instance: DeferredCanceledError;

    beforeEach(() => {
        instance = new DeferredCanceledError('Test Error');
    });

    test('Should create an instance of Error', () => {
        expect(instance).toBeInstanceOf(Error);
    });

    test('Should create an instance of DeferredCanceledError', () => {
        expect(instance).toBeInstanceOf(DeferredCanceledError);
    });

    test('An instance has "canceled" property', () => {
        expect(instance.canceled).toBe(true);
    });

    test('An instance was created with the correct message', () => {
        expect(instance.message).toBe('Test Error');
    });
});
