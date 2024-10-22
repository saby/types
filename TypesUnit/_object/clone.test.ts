import { assert } from 'chai';
import clone from 'Types/_object/clone';

class TestClass {}

interface TestObj {
    str?: string;
    num?: number;
    date?: Date;
    func?: Function;
    arr?: string[];
    obj?: TestObj;
    cls?: TestClass;
    $constructor?: Function;
}

describe('Types/_object/clone', () => {
    it('should clone object with string value', () => {
        const origin: TestObj = {
            str: 'string',
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.deepEqual(origin, cloned);
    });

    it('should clone object with number value', () => {
        const origin: TestObj = {
            num: 123,
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.deepEqual(origin, cloned);
    });

    it('should clone object with date', () => {
        const origin: TestObj = {
            date: new Date(),
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.deepEqual(origin, cloned);
    });

    it('should clone object with function', () => {
        const origin: TestObj = {
            func() {},
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.deepEqual(origin, cloned);
    });

    it('should clone object with class', () => {
        const origin: TestObj = {
            cls: new TestClass(),
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.deepEqual(origin, cloned);
    });

    it('should clone object with array', () => {
        const origin: TestObj = {
            arr: ['str'],
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.isTrue(origin.arr !== cloned.arr);
        assert.deepEqual(origin, cloned);
    });

    it('should clone object with object', () => {
        const origin: TestObj = {
            obj: {
                str: 'string',
            },
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.isTrue(origin.obj !== cloned.obj);
        assert.deepEqual(origin, cloned);
    });

    it('should clone object with wasaby control', () => {
        const origin: TestObj = {
            obj: {
                $constructor() {},
            },
        };
        const cloned = clone(origin) as TestObj;

        assert.isTrue(origin !== cloned);
        assert.strictEqual(origin.obj, cloned.obj);
        assert.deepEqual(origin, cloned);
    });
});
