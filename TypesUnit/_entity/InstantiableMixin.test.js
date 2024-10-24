/* global assert */
define(['Types/_entity/InstantiableMixin', 'Env/Env'], function (InstantiableMixinOrigin, Env) {
   'use strict';

   var InstantiableMixin = InstantiableMixinOrigin.default.prototype;

   describe('Types/_entity/InstantiableMixin', function () {
      describe('.getInstanceId()', function () {
         it('should return various prefix on client and server', function () {
            var id = InstantiableMixin.getInstanceId();
            if (Env.constants.isBrowserPlatform) {
               assert.isTrue(id.startsWith('client-id-'));
            } else {
               assert.isTrue(id.startsWith('server-id-'));
            }
         });
      });
   });
});
