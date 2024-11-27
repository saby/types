import { register, unregister, isRegistered, isInstantiable, resolve, create } from 'Types/di';

describe('Types/di', () => {
    describe('.register()', () => {
        test('should work with object', () => {
            register('test.module', {});
        });

        test('should work without options', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module);
        });

        test('should accept twice', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module);
            register('test.module', Module);
        });

        test('should throw an error if alias is not a string', () => {
            expect(function () {
                //@ts-ignore
                register(null);
            }).toThrow();
            expect(function () {
                //@ts-ignore
                register(false);
            }).toThrow();
            expect(function () {
                //@ts-ignore
                register(true);
            }).toThrow();
            expect(function () {
                //@ts-ignore
                register(0);
            }).toThrow();
            expect(function () {
                //@ts-ignore
                register(1);
            }).toThrow();
            expect(function () {
                //@ts-ignore
                register({});
            }).toThrow();
        });

        test('should throw an error if alias is empty', () => {
            expect(function () {
                //@ts-ignore
                register('');
            }).toThrow();
            expect(function () {
                //@ts-ignore
                register();
            }).toThrow();
        });
    });

    describe('.unregister()', () => {
        test('should become dependency unregistered', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module);
            unregister('test.module');
            expect(isRegistered('test.module')).toBe(false);

            unregister('test.moduleA');
            expect(isRegistered('test.moduleA')).toBe(false);
        });

        test('should throw an error if alias is empty', () => {
            expect(function () {
                unregister('');
            }).toThrow();
            expect(function () {
                //@ts-ignore
                unregister();
            }).toThrow();
        });

        test('should become resolve to throw', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module);
            unregister('test.module');
            expect(function () {
                resolve('test.module');
            }).toThrow();
        });
    });

    describe('.isRegistered()', () => {
        test('should return false', () => {
            expect(isRegistered('test.module.isRegistered.false')).toBe(false);
        });

        test('should return true', () => {
            register('test.module.isRegistered.true', {});
            expect(isRegistered('test.module.isRegistered.true')).toBe(true);
        });

        test('should throw an error if alias is empty', () => {
            expect(function () {
                isRegistered('');
            }).toThrow();
            expect(function () {
                //@ts-ignore
                isRegistered();
            }).toThrow();
        });
    });

    describe('.isInstantiable()', () => {
        test('should return true by default', () => {
            register('Foo/bar', Object);
            expect(isInstantiable('Foo/bar')).toBe(true);
            unregister('Foo/bar');
        });

        test('should return true if option "instantiate" is true', () => {
            register('Foo/bar', Object, { instantiate: true });
            expect(isInstantiable('Foo/bar')).toBe(true);
            unregister('Foo/bar');
        });

        test('should return false if option "instantiate" is false', () => {
            register('Foo/Bar', Object, { instantiate: false });
            expect(isInstantiable('Foo/Bar')).toBe(false);
            unregister('Foo/Bar');
        });
    });

    describe('.create()', () => {
        test('should return an instance of registered module by alias', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module, { instantiate: false });
            expect(create('test.module')).toBeInstanceOf(Module);
        });

        test('should return an instance of registered module by constructor', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            expect(create(Module)).toBeInstanceOf(Module);
        });
    });

    describe('.resolve()', () => {
        test('should return an instance of registered module', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module);
            expect(resolve('test.module')).toBeInstanceOf(Module);
        });

        test('should return an instance of reassigned module', () => {
            // eslint-disable-next-line no-empty-function
            const ModuleA = function () {};
            register('test.module', ModuleA);
            expect(resolve('test.module')).toBeInstanceOf(ModuleA);

            // eslint-disable-next-line no-empty-function
            const ModuleB = function () {};
            register('test.module', ModuleB);
            expect(resolve('test.module')).toBeInstanceOf(ModuleB);
        });

        test('should pass arguments to the constructor', () => {
            let passedArgs;
            const args = { a: 1, b: 2 };
            //@ts-ignore
            const Module = function (innerArgs) {
                passedArgs = innerArgs;
            };
            register('test.module', Module);
            resolve('test.module', args);
            expect(args).toBe(passedArgs);
            resolve('test.module');
            expect(passedArgs).not.toBeDefined();
        });

        test('should return a new instance on every call if no option given', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module);
            const instA = resolve('test.module');
            const instB = resolve('test.module');
            const instC = resolve('test.module');
            expect(instA).not.toBe(instB);
            expect(instA).not.toBe(instC);
            expect(instB).not.toBe(instC);
        });

        test('should return a new instance on every call if "single" option is false', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module, { single: false });
            const instA = resolve('test.module');
            const instB = resolve('test.module');
            const instC = resolve('test.module');
            expect(instA).not.toBe(instB);
            expect(instA).not.toBe(instC);
            expect(instB).not.toBe(instC);
        });

        test('should return same instance on every call if "single" option is true', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module, { single: true });
            const instA = resolve('test.module');
            const instB = resolve('test.module');
            const instC = resolve('test.module');
            expect(instA).toBe(instB);
            expect(instA).toBe(instC);
        });

        test('should return given instance on every call if "instantiate" option is false', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            //@ts-ignore
            const inst = new Module();

            register('test.module', inst, { instantiate: false });
            const instA = resolve('test.module');
            const instB = resolve('test.module');
            const instC = resolve('test.module');
            expect(instA).toBe(inst);
            expect(instB).toBe(inst);
            expect(instC).toBe(inst);
        });

        test('should return a new instance of registered module  if "instantiate" option is true', () => {
            // eslint-disable-next-line no-empty-function
            const Module = function () {};
            register('test.module', Module, { instantiate: true });
            expect(resolve('test.module')).toBeInstanceOf(Module);
            expect(resolve('test.module')).toBeInstanceOf(Module);
        });

        test('should throw an error if alias is empty', () => {
            expect(function () {
                resolve('');
            }).toThrow();
            expect(function () {
                //@ts-ignore
                resolve();
            }).toThrow();
        });

        test('should accept a function as alias', () => {
            let passedArgs;
            const args = { a: 1, b: 2 };
            //@ts-ignore
            const Module = function (innerArgs) {
                passedArgs = innerArgs;
            };

            const instA = resolve(Module, args);
            expect(args).toBe(passedArgs);
            const instB = resolve(Module);
            expect(passedArgs).not.toBeDefined();
            expect(instA).toBeInstanceOf(Module);
            expect(instB).toBeInstanceOf(Module);
            expect(instA).not.toBe(instB);
        });

        test('should accept an instance as alias', () => {
            const inst = {};
            const instA = resolve(inst);
            const instB = resolve(inst);

            expect(instA).toBe(inst);
            expect(instB).toBe(inst);
        });
    });
});
