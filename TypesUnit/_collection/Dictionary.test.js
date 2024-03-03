/* global assert */
define([
   'Types/_collection/Dictionary',
   'Types/_collection/enumerator/Arraywise',
   'Types/_collection/enumerator/Objectwise'
], function (DictionaryOrigin, ArrayEnumeratorOrigin, ObjectEnumeratorOrigin) {
   'use strict';

   var Dictionary = DictionaryOrigin.default;
   var ArrayEnumerator = ArrayEnumeratorOrigin.default;
   var ObjectEnumerator = ObjectEnumeratorOrigin.default;

   describe('Types/_collection/Dictionary', function () {
      var getDict = function () {
         return ['one', 'two', 'three'];
      };
      var getLocaleDict = function () {
         return ['uno', 'dos', 'tres'];
      };
      var dict;
      var localeDict;
      var instance;

      beforeEach(function () {
         dict = getDict();
         localeDict = getLocaleDict();
         instance = new Dictionary({
            dictionary: dict
         });
      });

      afterEach(function () {
         dict = undefined;
         localeDict = undefined;
         instance = undefined;
      });

      describe('.constructor()', function () {
         it('should create Dictionary', function () {
            assert.instanceOf(instance, Dictionary);
         });
      });

      describe('.getDictionary', function () {
         it('should return dictionary copy', function () {
            assert.notEqual(instance.getDictionary(), dict);
            assert.deepEqual(instance.getDictionary(), dict);
         });

         it('should return localized dictionary copy', function () {
            var innerInstance = new Dictionary({
               dictionary: dict,
               localeDictionary: localeDict
            });
            assert.notEqual(innerInstance.getDictionary(true), localeDict);
            assert.deepEqual(innerInstance.getDictionary(true), localeDict);
         });
      });

      describe('.getEnumerator', function () {
         it('should return Array', function () {
            assert.instanceOf(instance.getEnumerator(), ArrayEnumerator);
         });

         it('should return Objectwise', function () {
            var innerInstance = new Dictionary({
               dictionary: {}
            });

            assert.instanceOf(innerInstance.getEnumerator(), ObjectEnumerator);
         });

         it('should return valid enumerator', function () {
            var enumerator = instance.getEnumerator();
            var index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), dict[index]);
               index++;
            }
            assert.strictEqual(index, dict.length);
         });

         it('should return localized enumerator', function () {
            var innerInstance = new Dictionary({
               dictionary: dict,
               localeDictionary: localeDict
            });
            var enumerator = innerInstance.getEnumerator(true);
            var index = 0;

            while (enumerator.moveNext()) {
               assert.strictEqual(enumerator.getCurrent(), localeDict[index]);
               index++;
            }
            assert.strictEqual(index, localeDict.length);
         });
      });

      describe('.each', function () {
         it('should return each value', function () {
            var count = 0;
            instance.each(function (item, index) {
               assert.equal(index, count);
               assert.equal(item, dict[count]);
               count++;
            });
            assert.equal(count, dict.length);
         });

         it('should return each localized value', function () {
            var innerInstance = new Dictionary({
               dictionary: dict,
               localeDictionary: localeDict
            });
            var index = 0;

            innerInstance.each(
               function (item) {
                  assert.strictEqual(item, localeDict[index]);
                  index++;
               },
               innerInstance,
               true
            );
            assert.strictEqual(index, localeDict.length);
         });

         it('should skip null as index', function () {
            var dictionary = {
               0: 'one',
               1: 'two',
               null: 'null',
               2: 'three'
            };
            var innerInstance = new Dictionary({
               dictionary: dictionary
            });
            innerInstance.each(function (item, index) {
               assert.isNotNull(index);
               assert.isTrue(dictionary.hasOwnProperty(index));
            });
         });
      });

      describe('.isEqual()', function () {
         it('should return true for the same dictionary', function () {
            var same = new Dictionary({
               dictionary: getDict()
            });
            assert.isTrue(instance.isEqual(same));
         });

         it('should return false for the different dictionary', function () {
            var dictionary = getDict();
            dictionary[0] = 'uno';
            var diff = new Dictionary({
               dictionary: dictionary
            });
            assert.isFalse(instance.isEqual(diff));
         });

         it('should return false for not a Dictionary', function () {
            assert.isFalse(instance.isEqual());
            assert.isFalse(instance.isEqual(null));
            assert.isFalse(instance.isEqual(false));
            assert.isFalse(instance.isEqual(true));
            assert.isFalse(instance.isEqual(0));
            assert.isFalse(instance.isEqual(1));
            assert.isFalse(instance.isEqual({}));
            assert.isFalse(instance.isEqual([]));
         });
      });
   });
});
