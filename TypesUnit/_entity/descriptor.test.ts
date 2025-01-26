import descriptor from 'Types/_entity/descriptor';
//@ts-ignore
import extend = require('Core/core-extend');

describe('Types/_entity/descriptor', () => {
    test('should throw TypeError on call without arguments', () => {
        expect(() => {
            descriptor();
        }).toThrow();
    });

    test('should correctly validate null', () => {
        expect(descriptor(null)({ testProp: null }, 'testProp', 'TestComponent')).not.toBeDefined();
    });

    test('should return TypeError for not null value', () => {
        expect(descriptor(null)({ testProp: 0 }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
    });

    test('should correctly validate Boolean', () => {
        expect(
            descriptor(Boolean)({ testProp: false }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
        expect(
            descriptor(Boolean)({ testProp: true }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
    });

    test('should return TypeError for not a Boolean value', () => {
        expect(descriptor(Boolean)({ testProp: null }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Boolean)({ testProp: 0 }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Boolean)({ testProp: '' }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Boolean)({ testProp: {} }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
    });

    test('should correctly validate Number', () => {
        expect(descriptor(Number)({ testProp: 1 }, 'testProp', 'TestComponent')).not.toBeDefined();
    });

    test('should return TypeError for not a Number value', () => {
        expect(descriptor(Number)({ testProp: null }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Number)({ testProp: true }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Number)({ testProp: '' }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Number)({ testProp: {} }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
    });

    test('should correctly validate String', () => {
        expect(
            descriptor(String)({ testProp: 'a' }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
    });

    test('should correctly validate subclass of String', () => {
        class SubString extends String {
            constructor(str: string) {
                super(str);
            }
        }

        const inst = new SubString('a');
        expect(
            descriptor(String)({ testProp: inst }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
    });

    test('should return TypeError for not a String value', () => {
        expect(descriptor(String)({ testProp: null }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(String)({ testProp: false }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(String)({ testProp: 1 }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(String)({ testProp: {} }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
    });

    test('should correctly validate Object', () => {
        const inst = {};
        expect(
            descriptor(Object)({ testProp: inst }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
    });

    test('should return TypeError for not an Object value', () => {
        expect(descriptor(Object)({ testProp: null }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Object)({ testProp: false }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Object)({ testProp: 1 }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Object)({ testProp: '' }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
    });

    test('should correctly validate Array', () => {
        const inst: unknown[] = [];
        expect(
            descriptor(Array)({ testProp: inst }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
    });

    test('should return TypeError for not an Array value', () => {
        expect(descriptor(Array)({ testProp: null }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Array)({ testProp: false }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Array)({ testProp: 1 }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
        expect(descriptor(Array)({ testProp: '' }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
    });

    test('should correctly validate class', () => {
        const IFace = {};
        const Module = extend.extend(Object, [IFace], {});
        const inst = new Module();

        expect(
            descriptor(IFace)({ testProp: inst }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
    });

    test('should return TypeError if value is not implements an interface', () => {
        const IFace = {};
        const Module = extend.extend(Object, {});
        const inst = new Module();

        expect(descriptor(IFace)({ testProp: inst }, 'testProp', 'TestComponent')).toBeInstanceOf(
            TypeError
        );
    });

    test('should correctly validate composite value', () => {
        expect(
            descriptor(Boolean, Number, String)({ testProp: false }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
        expect(
            descriptor(Boolean, Number, String)({ testProp: 0 }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
        expect(
            descriptor(Boolean, Number, String)({ testProp: '' }, 'testProp', 'TestComponent')
        ).not.toBeDefined();

        expect(
            descriptor(Boolean, null)({ testProp: false }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
        expect(
            descriptor(Boolean, null)({ testProp: null }, 'testProp', 'TestComponent')
        ).not.toBeDefined();
    });

    test('should return TypeError for invalid composite value', () => {
        expect(
            descriptor(Boolean, Number)({ testProp: '' }, 'testProp', 'TestComponent')
        ).toBeInstanceOf(TypeError);
        expect(
            descriptor(Boolean, Number, String)({ testProp: {} }, 'testProp', 'TestComponent')
        ).toBeInstanceOf(TypeError);
    });

    test('should not throw on undefined value with descriptor of any type', () => {
        expect(
            // @ts-expect-error
            descriptor(Boolean)({}, 'testProp', 'TestComponent')
        ).not.toBeDefined();
        // @ts-expect-error
        expect(descriptor(Number)({}, 'testProp', 'TestComponent')).not.toBeDefined();
        // @ts-expect-error
        expect(descriptor(String)({}, 'testProp', 'TestComponent')).not.toBeDefined();
        // @ts-expect-error
        expect(descriptor(Object)({}, 'testProp', 'TestComponent')).not.toBeDefined();
        // @ts-expect-error
        expect(descriptor({})({}, 'testProp', 'TestComponent')).not.toBeDefined();
    });

    describe('.required()', () => {
        test('should correctly validate required', () => {
            expect(
                descriptor(Boolean).required()({ testProp: false }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
            expect(
                descriptor(Number).required()({ testProp: -1 }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
            expect(
                descriptor(String).required()({ testProp: 'a' }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
        });

        test('should return TypeError for undefined', () => {
            expect(
                // @ts-expect-error
                descriptor(Boolean).required()({}, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                // @ts-expect-error
                descriptor(Number).required()({}, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                // @ts-expect-error
                descriptor(String).required()({}, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
        });
    });

    describe('.oneOf()', () => {
        test('should correctly validate oneOf', () => {
            expect(
                descriptor(Boolean).oneOf([true])({ testProp: true }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
            expect(
                descriptor(Number).oneOf([1, 2, 3])({ testProp: 2 }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
            expect(
                descriptor(String).oneOf(['a', 'b'])({ testProp: 'a' }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
        });

        test('should not throw on undefined', () => {
            expect(
                descriptor(Number).oneOf([0, 1])(
                    {},
                    // @ts-expect-error
                    'testProp',
                    'TestComponent'
                )
            ).not.toBeDefined();
        });

        test('should return TypeError for undefined but required', () => {
            expect(
                descriptor(Number).oneOf([0, 1]).required()(
                    {},
                    // @ts-expect-error
                    'testProp',
                    'TestComponent'
                )
            ).toBeInstanceOf(TypeError);
        });

        test('should return TypeError for invalid value', () => {
            expect(
                descriptor(Boolean).oneOf([true])({ testProp: false }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                descriptor(Number).oneOf([1, 2])({ testProp: 0 }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                descriptor(String).oneOf(['a'])({ testProp: 'b' }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
        });

        test('should throw TypeError in invalid values argument', () => {
            expect(() => {
                //@ts-ignore
                descriptor(Boolean).oneOf(undefined);
            }).toThrow();

            expect(() => {
                //@ts-ignore
                descriptor(Boolean).oneOf(null);
            }).toThrow();

            expect(() => {
                //@ts-ignore
                descriptor(Boolean).oneOf({} as undefined);
            }).toThrow();
        });
    });

    describe('.not()', () => {
        test('should correctly validate not', () => {
            expect(
                descriptor(Boolean).not([true])({ testProp: false }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
            expect(
                descriptor(Number).not([1, 2, 3])({ testProp: 0 }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
            expect(
                descriptor(String).not(['a', 'b'])({ testProp: 'c' }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
        });

        test('should not throw on undefined', () => {
            expect(
                // @ts-expect-error
                descriptor(Number).not([0, 1])({}, 'testProp', 'TestComponent')
            ).not.toBeDefined();
        });

        test('should return TypeError for undefined but required', () => {
            expect(
                descriptor(Number).not([0, 1]).required()(
                    {},
                    // @ts-expect-error
                    'testProp',
                    'TestComponent'
                )
            ).toBeInstanceOf(TypeError);
        });

        test('should return TypeError for invalid value', () => {
            expect(
                descriptor(Boolean).not([true])({ testProp: true }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                descriptor(Number).not([1, 2])({ testProp: 1 }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                descriptor(String).not(['a'])({ testProp: 'a' }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
        });

        test('should throw TypeError in invalid values argument', () => {
            expect(() => {
                //@ts-ignore
                descriptor(Boolean).not(undefined);
            }).toThrow();

            expect(() => {
                //@ts-ignore
                descriptor(Boolean).not(null);
            }).toThrow();

            expect(() => {
                //@ts-ignore
                descriptor(Boolean).not({} as undefined);
            }).toThrow();
        });
    });

    describe('.arrayOf()', () => {
        test('should correctly validate arrayOf', () => {
            expect(
                descriptor(Array).arrayOf(Boolean)(
                    { testProp: [true] },
                    'testProp',
                    'TestComponent'
                )
            ).not.toBeDefined();
            expect(
                descriptor(Array).arrayOf(Number)({ testProp: [0, 1] }, 'testProp', 'TestComponent')
            ).not.toBeDefined();
            expect(
                descriptor(Array).arrayOf(String)(
                    { testProp: ['a', 'b'] },
                    'testProp',
                    'TestComponent'
                )
            ).not.toBeDefined();
        });

        test('should not throw on undefined', () => {
            expect(
                descriptor(Array).arrayOf(Number)(
                    {},
                    // @ts-expect-error
                    'testProp',
                    'TestComponent'
                )
            ).not.toBeDefined();
        });

        test('should return TypeError for undefined but required', () => {
            expect(
                descriptor(Array).arrayOf(Number).required()(
                    {},
                    // @ts-expect-error
                    'testProp',
                    'TestComponent'
                )
            ).toBeInstanceOf(TypeError);
        });

        test('should return TypeError for invalid value', () => {
            expect(
                descriptor(Array).arrayOf(Boolean)({ testProp: true }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                descriptor(Array).arrayOf(Boolean)({ testProp: 0 }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
            expect(
                descriptor(Array).arrayOf(Boolean)({ testProp: [0] }, 'testProp', 'TestComponent')
            ).toBeInstanceOf(TypeError);
        });
    });
});
