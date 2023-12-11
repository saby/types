/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai';
import {
    category,
    isMeta,
    Meta,
    MetaClass,
    ObjectMeta,
    ArrayMeta,
    PromiseMeta,
    FunctionMeta,
    VariantMeta,
    WidgetMeta,
} from 'Types/meta';

import {
    isArrayMeta,
    isFunctionMeta,
    isPromiseMeta,
    isVariantMeta,
    isWidgetMeta,
} from 'Types/_meta/meta';

import { isArrayMetaDescriptor } from 'Types/_meta/array';
import { isFunctionMetaDescriptor } from 'Types/_meta/function';
import { isPrimitiveMetaDescriptor } from 'Types/_meta/baseMeta';
import { isPromiseMetaDescriptor } from 'Types/_meta/promise';
import { isVariantMetaDescriptor } from 'Types/_meta/variant';
import { isObjectMetaDescriptor } from 'Types/_meta/object';
import { isWidgetMetaDescriptor } from 'Types/_meta/widget';

import {
    AnyType,
    ArrayType,
    FunctionType,
    ObjectType,
    PromiseType,
    VariantType,
    WidgetType,
} from 'Types/_meta/types';

describe('Types/_meta/meta', () => {
    describe('isMeta()', () => {
        it('возвращает `true`, если аргумент является экземпляром класса `Meta`', () => {
            const result = isMeta(new Meta({}));
            expect(result).equal(true);
        });

        it('возвращает `true`, если аргумент является экземпляром класса `ObjectMeta`', () => {
            const result = isMeta(new ObjectMeta());
            expect(result).equal(true);
        });

        it('возвращает `true`, если аргумент является экземпляром класса `ArrayMeta`', () => {
            const result = isMeta(new ArrayMeta());
            expect(result).equal(true);
        });

        it('возвращает `true`, если аргумент является экземпляром класса `FunctionMeta`', () => {
            const result = isMeta(new FunctionMeta());
            expect(result).equal(true);
        });

        it('возвращает `true`, если аргумент является экземпляром класса `PromiseMeta`', () => {
            const result = isMeta(new PromiseMeta());
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является экземпляром класса `Meta`', () => {
            expect(isMeta(null)).equal(false);
            expect(isMeta({})).equal(false);
            expect(isMeta({ is: MetaClass.primitive })).equal(false);
        });
    });

    /*     describe('isObjectMeta()', () => {
        it('возвращает `true`, если аргумент является экземпляром класса `ObjectMeta`', () => {
            const result = isObjectMeta(new ObjectMeta());
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является экземпляром класса `ObjectMeta`', () => {
            expect(isObjectMeta(new WidgetMeta())).equal(false);
            expect(isObjectMeta(new Meta())).equal(false);
            expect(isObjectMeta(new ArrayMeta())).equal(false);
            expect(isObjectMeta(new FunctionMeta())).equal(false);
            expect(isObjectMeta(new PromiseMeta())).equal(false);
            expect(
                isObjectMeta({ is: MetaClass.object, attributes: {} })
            ).equal(false);
        });
    }); */

    describe('isPromiseMeta()', () => {
        it('возвращает `true`, если аргумент является экземпляром класса `PromiseMeta`', () => {
            const result = isPromiseMeta(new PromiseMeta());
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является экземпляром класса `PromiseMeta`', () => {
            expect(isPromiseMeta(new Meta())).equal(false);
            expect(isPromiseMeta(new ArrayMeta())).equal(false);
            expect(isPromiseMeta(new FunctionMeta())).equal(false);
            expect(isPromiseMeta(new ObjectMeta())).equal(false);
            expect(isPromiseMeta({ is: MetaClass.promise })).equal(false);
        });
    });

    describe('isArrayMeta()', () => {
        it('возвращает `true`, если аргумент является экземпляром класса `ArrayMeta`', () => {
            const result = isArrayMeta(new ArrayMeta());
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является экземпляром класса `ArrayMeta`', () => {
            expect(isArrayMeta(new Meta())).equal(false);
            expect(isArrayMeta(new PromiseMeta())).equal(false);
            expect(isArrayMeta(new FunctionMeta())).equal(false);
            expect(isArrayMeta(new ObjectMeta())).equal(false);
            expect(isArrayMeta({ is: MetaClass.array })).equal(false);
        });
    });

    describe('isFunctionMeta()', () => {
        it('возвращает `true`, если аргумент является экземпляром класса `FunctionMeta`', () => {
            const result = isFunctionMeta(new FunctionMeta());
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является экземпляром класса `FunctionMeta`', () => {
            expect(isFunctionMeta(new Meta())).equal(false);
            expect(isFunctionMeta(new PromiseMeta())).equal(false);
            expect(isFunctionMeta(new ArrayMeta())).equal(false);
            expect(isFunctionMeta(new ObjectMeta())).equal(false);
            expect(isFunctionMeta({ is: MetaClass.function })).equal(false);
        });
    });

    describe('isVariantMeta()', () => {
        it('возвращает `true`, если аргумент является экземпляром класса `VariantMeta`', () => {
            const result = isVariantMeta(new VariantMeta());
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является экземпляром класса `VariantMeta`', () => {
            expect(isVariantMeta(new Meta())).equal(false);
            expect(isVariantMeta(new PromiseMeta())).equal(false);
            expect(isVariantMeta(new ArrayMeta())).equal(false);
            expect(isVariantMeta(new ObjectMeta())).equal(false);
            expect(isVariantMeta({ is: MetaClass.union })).equal(false);
        });
    });

    describe('isWidgetMeta()', () => {
        it('возвращает `true`, если аргумент является экземпляром класса `WidgetMeta`', () => {
            const result = isWidgetMeta(new WidgetMeta());
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является экземпляром класса `WidgetMeta`', () => {
            expect(isWidgetMeta(ObjectType)).equal(false);
            expect(isWidgetMeta(new Meta())).equal(false);
            expect(isWidgetMeta(new PromiseMeta())).equal(false);
            expect(isWidgetMeta(new ArrayMeta())).equal(false);
            expect(isWidgetMeta(new ObjectMeta())).equal(false);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore тест на то что упадёт проверка
            expect(isWidgetMeta({ is: MetaClass.widget })).equal(false);
        });
    });

    describe('isPrimitiveMetaDescriptor()', () => {
        it('возвращает `true`, если аргумент является корректным описанием', () => {
            const result = isPrimitiveMetaDescriptor({});
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является корректным описанием', () => {
            expect(isPrimitiveMetaDescriptor(AnyType)).equal(false);
            expect(isPrimitiveMetaDescriptor(1)).equal(false);
            expect(isPrimitiveMetaDescriptor(null)).equal(false);
            expect(isPrimitiveMetaDescriptor([])).equal(false);
            expect(
                isPrimitiveMetaDescriptor(() => {
                    return true;
                })
            ).equal(false);
        });
    });

    describe('isObjectMetaDescriptor()', () => {
        it('возвращает `true`, если аргумент является корректным описанием типа "object"', () => {
            const result = isObjectMetaDescriptor({ is: MetaClass.object });
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является корректным описанием типа "object"', () => {
            expect(isObjectMetaDescriptor(ObjectType)).equal(false);
            expect(isObjectMetaDescriptor(1)).equal(false);
            expect(isObjectMetaDescriptor(null)).equal(false);
            expect(
                isObjectMetaDescriptor(() => {
                    return true;
                })
            ).equal(false);
            expect(isObjectMetaDescriptor({})).equal(false);
            expect(isObjectMetaDescriptor({ attributes: [] })).equal(false);
            expect(isObjectMetaDescriptor({ arrayOf: {} })).equal(false);
            expect(isObjectMetaDescriptor({ result: {} })).equal(false);
        });
    });

    describe('isPromiseMetaDescriptor()', () => {
        it('возвращает `true`, если аргумент является корректным описанием типа "promise"', () => {
            const result = isPromiseMetaDescriptor({ is: MetaClass.promise });
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является корректным описанием типа "promise"', () => {
            expect(isPromiseMetaDescriptor(PromiseType)).equal(false);
            expect(isPromiseMetaDescriptor(1)).equal(false);
            expect(isPromiseMetaDescriptor(null)).equal(false);
            expect(
                isPromiseMetaDescriptor(() => {
                    return true;
                })
            ).equal(false);
            expect(isPromiseMetaDescriptor({})).equal(false);
            expect(isPromiseMetaDescriptor({ attributes: {} })).equal(false);
            expect(isPromiseMetaDescriptor({ arrayOf: {} })).equal(false);
        });
    });

    describe('isArrayMetaDescriptor()', () => {
        it('возвращает `true`, если аргумент является корректным описанием типа "array"', () => {
            const result = isArrayMetaDescriptor({ is: MetaClass.array });
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является корректным описанием типа "array"', () => {
            expect(isArrayMetaDescriptor(ArrayType)).equal(false);
            expect(isArrayMetaDescriptor(1)).equal(false);
            expect(isArrayMetaDescriptor(null)).equal(false);
            expect(
                isArrayMetaDescriptor(() => {
                    return true;
                })
            ).equal(false);
            expect(isArrayMetaDescriptor({})).equal(false);
            expect(isArrayMetaDescriptor({ attributes: {} })).equal(false);
            expect(isArrayMetaDescriptor({ arrayOf: [] })).equal(false);
            expect(isArrayMetaDescriptor({ result: {} })).equal(false);
        });
    });

    describe('isFunctionMetaDescriptor()', () => {
        it('возвращает `true`, если аргумент является корректным описанием типа "function"', () => {
            const result = isFunctionMetaDescriptor({ is: MetaClass.function });
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является корректным описанием типа "function"', () => {
            expect(isFunctionMetaDescriptor(FunctionType)).equal(false);
            expect(isFunctionMetaDescriptor(1)).equal(false);
            expect(isFunctionMetaDescriptor(null)).equal(false);
            expect(
                isFunctionMetaDescriptor(() => {
                    return true;
                })
            ).equal(false);
            expect(isFunctionMetaDescriptor({})).equal(false);
            expect(isFunctionMetaDescriptor({ attributes: {} })).equal(false);
            expect(isFunctionMetaDescriptor({ arrayOf: {} })).equal(false);
            expect(isFunctionMetaDescriptor({ result: {} })).equal(false);
        });
    });

    describe('isVariantMetaDescriptor()', () => {
        it('возвращает `true`, если аргумент является корректным описанием типа "variant"', () => {
            const result = isVariantMetaDescriptor({ is: MetaClass.variant });
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является корректным описанием типа "variant"', () => {
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor(VariantType)).equal(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor(1)).equal(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor(null)).equal(false);
            expect(
                // @ts-ignore это тест
                isVariantMetaDescriptor(() => {
                    return true;
                })
            ).equal(false);
            expect(isVariantMetaDescriptor({})).equal(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor({ attributes: {} })).equal(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor({ arrayOf: {} })).equal(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor({ result: {} })).equal(false);
        });
    });

    describe('isWidgetMetaDescriptor()', () => {
        it('возвращает `true`, если аргумент является корректным описанием типа "widget"', () => {
            const result = isWidgetMetaDescriptor({ is: MetaClass.widget });
            expect(result).equal(true);
        });

        it('возвращает `false`, если аргумент не является корректным описанием типа "widget"', () => {
            expect(isWidgetMetaDescriptor(WidgetType)).equal(false);
            expect(isWidgetMetaDescriptor(1)).equal(false);
            expect(isWidgetMetaDescriptor(null)).equal(false);
            expect(
                isWidgetMetaDescriptor(() => {
                    return true;
                })
            ).equal(false);
            expect(isWidgetMetaDescriptor({})).equal(false);
            expect(isWidgetMetaDescriptor({ attributes: {} })).equal(false);
            expect(isWidgetMetaDescriptor({ arrayOf: {} })).equal(false);
            expect(isWidgetMetaDescriptor({ result: {} })).equal(false);
        });
    });

    describe('category()', () => {
        it('возвращает новые атрибуты с изменённым значением `category`', () => {
            const name = 'name';
            const original = {
                one: {},
                two: AnyType.category('two'),
            };
            const result = category(name, original);
            expect(result).not.equal(original);
            expect(result.one).not.equal(original.one);
            expect(result.one).instanceOf(Meta);
            expect((result.one as Meta<any>).getCategory()).equal(name);
            expect(result.two).not.equal(original.two);
            expect(result.two.getCategory()).equal(name);
            expect(result.two).instanceOf(Meta);
        });

        it('не создаёт новые атрибуты, если свойство `category` не изменяется', () => {
            const name = 'name';
            const original = {
                one: AnyType,
                two: AnyType.category(name),
            };
            const result = category(name, original);
            expect(result).not.equal(original);
            expect(result.one).not.equal(original.one);
            expect(result.one.getCategory()).equal(name);
            expect(result.one).instanceOf(Meta);
            expect(result.two).equal(original.two);
            expect(result.two).instanceOf(Meta);
        });
    });
});
