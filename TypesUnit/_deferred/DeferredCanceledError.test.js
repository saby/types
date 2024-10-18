/* global define, describe, assert, it */
define([
    'Types/deferred',
], function (
    { DeferredCanceledError }
) {

    describe('Types/deferred:DeferredCanceledError', function () {
        let instance;

        beforeEach(() => {
            instance = new DeferredCanceledError('Test Error');
        });

        it('Should create an instance of Error', function () {
            assert.instanceOf(instance, Error);
        });

        it('Should create an instance of DeferredCanceledError', function () {
            assert.instanceOf(instance, DeferredCanceledError);
        });

        it('An instance has "canceled" property', function () {
            assert.isTrue(instance.canceled);
        });

        it('An instance was created with the correct message', function () {
            assert.strictEqual(instance.message, 'Test Error');
        });
    })
})
