/* global assert */
define(['Types/_collection/Enum'], function (EnumOrigin) {
   'use strict';

   var Enum = EnumOrigin.default;

   describe('Types/_collection/Enum', function () {
      var getDict = function () {
            return ['one', 'two', 'three'];
         },
         getLocaleDict = function () {
            return ['uno', 'dos', 'tres'];
         },
         dict,
         localeDict,
         testEnum;

      beforeEach(function () {
         dict = getDict();
         localeDict = getLocaleDict();
         testEnum = new Enum({
            dictionary: dict,
            index: 1
         });
      });

      afterEach(function () {
         dict = undefined;
         testEnum = undefined;
      });

      describe('.constructor()', function () {
         it('should create Enum', function () {
            assert.instanceOf(testEnum, Enum);
         });

         it('should translate index to Number', function () {
            assert.strictEqual(
               new Enum({
                  dictionary: dict,
                  index: '1'
               }).get(),
               1
            );
         });
      });

      describe('.get()', function () {
         it('should return the default index', function () {
            assert.equal(testEnum.get(), 1);
         });
      });

      describe('.getOriginal()', function () {
         it('should return the original index', function () {
            testEnum.set(0);
            assert.equal(testEnum.getOriginal(), 1);
         });
      });

      describe('.set()', function () {
         it('should change current index', function () {
            testEnum.set(2);
            assert.equal(testEnum.get(), 2);
            assert.equal(testEnum.getAsValue(), 'three');
         });

         it('should change current index to null', function () {
            testEnum.set(null);
            assert.strictEqual(testEnum.get(), null);
            assert.isUndefined(testEnum.getAsValue());
         });

         it('should translate index to Number', function () {
            testEnum.set('2');
            assert.strictEqual(testEnum.get(), 2);
         });

         it('should translate index to Number even if dictonary has taken from object', function () {
            var inst = new Enum({
               dictionary: { 0: 'one', 1: 'two' }
            });

            inst.set('1');
            assert.strictEqual(inst.get(), 1);
         });

         it('should throw an exception if index is out of range', function () {
            assert.throws(function () {
               testEnum.set(569);
            });
         });

         it('should trigger "onChange" if value is changed', function () {
            var fired = {},
               handler = function (e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.subscribe('onChange', handler);

            testEnum.set(0);
            assert.strictEqual(fired.index, 0);
            assert.strictEqual(fired.value, 'one');

            testEnum.unsubscribe('onChange', handler);
         });

         it('should trigger "onChange" if value is changed from null', function () {
            var fired = {},
               handler = function (e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.set(null);
            testEnum.subscribe('onChange', handler);

            testEnum.set(0);
            assert.strictEqual(fired.index, 0);
            assert.strictEqual(fired.value, 'one');

            testEnum.unsubscribe('onChange', handler);
         });

         it('should trigger "onChange" if value is changed to null', function () {
            var fired = {},
               handler = function (e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.subscribe('onChange', handler);

            testEnum.set(null);
            assert.strictEqual(fired.index, null);
            assert.strictEqual(fired.value, undefined);

            testEnum.unsubscribe('onChange', handler);
         });

         it('should not trigger "onChange" if value is not changed', function () {
            var fired = {},
               handler = function (e, index, value) {
                  fired.index = index;
                  fired.value = value;
               };

            testEnum.subscribe('onChange', handler);

            testEnum.set(1);
            assert.isUndefined(fired.index);
            assert.isUndefined(fired.value);

            testEnum.unsubscribe('onChange', handler);
         });
      });

      describe('.getAsValue()', function () {
         it('should return the default value', function () {
            assert.equal(testEnum.getAsValue(), 'two');
         });

         it('should return original value', function () {
            assert.equal(
               new Enum({
                  dictionary: dict,
                  localeDictionary: localeDict,
                  index: 1
               }).getAsValue(),
               'two'
            );
         });

         it('should return localized value', function () {
            assert.equal(
               new Enum({
                  dictionary: dict,
                  localeDictionary: localeDict,
                  index: 1
               }).getAsValue(true),
               'dos'
            );
         });
      });

      describe('.getOriginalAsValue()', function () {
         it('should return the original value', function () {
            testEnum.setByValue('one');
            assert.equal(testEnum.getOriginalAsValue(), 'two');
         });

         it('should return original localized value', function () {
            var inst = new Enum({
               dictionary: dict,
               localeDictionary: localeDict,
               index: 1
            });

            inst.setByValue('uno', true);
            assert.equal(inst.getOriginalAsValue(true), 'dos');
         });
      });

      describe('.setByValue()', function () {
         it('should set original value', function () {
            testEnum.setByValue('one');
            assert.equal(testEnum.get(), 0);
            assert.equal(testEnum.getAsValue(), 'one');
         });

         it('should set localized value', function () {
            var inst = new Enum({
               dictionary: dict,
               localeDictionary: localeDict
            });

            inst.setByValue('uno', true);
            assert.equal(inst.getAsValue(), 'one');
         });

         it('should translate index to Number even if dictonary has taken from object', function () {
            var inst = new Enum({
               dictionary: { 0: 'one', 1: 'two' }
            });

            inst.setByValue('two');
            assert.strictEqual(inst.get(), 1);
         });

         it('should change current index to null', function () {
            testEnum.setByValue(null);
            assert.strictEqual(testEnum.get(), null);
            assert.isUndefined(testEnum.getAsValue());
         });

         it('should throw ReferenceError for not exists index', function () {
            assert.throws(function () {
               testEnum.setByValue('doesntExistingValue');
            }, ReferenceError);

            assert.throws(function () {
               testEnum.setByValue('doesntExistingValue', true);
            }, ReferenceError);
         });
      });

      describe('.produceInstance()', function () {
         it('should return instance of Enum', function () {
            assert.instanceOf(Enum.produceInstance(), Enum);
         });

         it('should return instance of Enum with dictionary returned by getDictionary()', function () {
            var options = {
                  format: {
                     getDictionary: function () {
                        return ['foo'];
                     }
                  }
               },
               inst = Enum.produceInstance(0, options);

            assert.strictEqual(inst.getAsValue(), 'foo');
         });

         it('should return instance of Enum with dictionary returned by meta.dictionary', function () {
            var options = {
                  format: {
                     meta: {
                        dictionary: ['foo']
                     }
                  }
               },
               inst = Enum.produceInstance(0, options);

            assert.strictEqual(inst.getAsValue(), 'foo');
         });

         it('should return instance of Enum with localized dictionary returned by getLocaleDictionary()', function () {
            var options = {
                  format: {
                     getDictionary: function () {
                        return ['foo'];
                     },
                     getLocaleDictionary: function () {
                        return ['bar'];
                     }
                  }
               },
               inst = Enum.produceInstance(0, options);

            assert.strictEqual(inst.getAsValue(), 'foo');
            assert.strictEqual(inst.getAsValue(true), 'bar');
         });

         it('should return instance of Enum with localized dictionary returned by meta.localeDictionary', function () {
            var options = {
                  format: {
                     meta: {
                        dictionary: ['foo'],
                        localeDictionary: ['bar']
                     }
                  }
               },
               inst = Enum.produceInstance(0, options);

            assert.strictEqual(inst.getAsValue(), 'foo');
            assert.strictEqual(inst.getAsValue(true), 'bar');
         });
      });

      describe('.isEqual()', function () {
         it('should return false for the different value', function () {
            var e = new Enum({
               dictionary: getDict(),
               index: 0
            });
            assert.isFalse(testEnum.isEqual(e));
         });

         it('should return false for not an Enum', function () {
            assert.isFalse(testEnum.isEqual());
            assert.isFalse(testEnum.isEqual(null));
            assert.isFalse(testEnum.isEqual(false));
            assert.isFalse(testEnum.isEqual(true));
            assert.isFalse(testEnum.isEqual(0));
            assert.isFalse(testEnum.isEqual(1));
            assert.isFalse(testEnum.isEqual({}));
            assert.isFalse(testEnum.isEqual([]));
         });
      });

      describe('.valueOf()', function () {
         it('should return the current index', function () {
            assert.equal(0 + testEnum, 1);
         });
      });

      describe('.toString()', function () {
         it('should return the current value', function () {
            assert.equal(testEnum.toString(), 'two');
         });

         it('should return the current value if Enum used as string', function () {
            assert.equal(''.concat(testEnum), 'two');
         });

         it('should return empty string for null', function () {
            var inst = new Enum({
               dictionary: { null: null, 0: 'one' }
            });
            assert.isNull(inst.getAsValue());
            assert.strictEqual(inst.toString(), '');
         });

         it('should return empty string for undefined', function () {
            var inst = new Enum({
               dictionary: { 0: undefined, 1: 'foo' },
               index: 0
            });
            assert.isUndefined(inst.getAsValue());
            assert.strictEqual(inst.toString(), '');
         });
      });

      describe('.toJson()', function () {
         it('should serialize to json', function () {
            var inst = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });
            assert.doesNotThrow(function () {
               JSON.stringify(inst);
            });
         });
      });

      describe('.clone()', function () {
         it('should clone value', function () {
            var clone = testEnum.clone();
            assert.notEqual(clone, testEnum);
            assert.isTrue(clone.isEqual(testEnum));
         });
      });

      describe('.acceptChanges', function () {
         it('should change state to "Changed" on value set', () => {
            var inst = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });
            assert.isFalse(inst.isChanged());

            inst.set(0);

            assert.isTrue(inst.isChanged());
         });

         it('should reset "Changed" state to "Unchanged"', () => {
            var inst = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });
            inst.set(0);
            inst.acceptChanges();
            assert.isFalse(inst.isChanged());
         });

         it('should keep values after acceptChanges', function () {
            var inst = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });

            inst.set(0);

            inst.acceptChanges();

            assert.strictEqual(inst.getAsValue(), 'one');
         });
      });

      describe('.rejectChanges', function () {
         it('should reset "Changed" state to "Unchanged"', () => {
            var inst = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });

            inst.set(0);
            inst.rejectChanges();
            assert.isFalse(inst.isChanged());
         });

         it('should reset "Changed" state to "Unchanged" after old value set', () => {
            var inst = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });

            const oldIndex = inst.get();

            inst.set(0);
            inst.set(oldIndex);

            assert.isFalse(inst.isChanged());
         });

         it('should revert value after rejectChanges', () => {
            var inst = new Enum({
               dictionary: ['one', 'two'],
               index: 1
            });
            inst.set(0);

            inst.rejectChanges();

            assert.strictEqual(inst.getAsValue(), 'two');
         });
      });
   });
});
