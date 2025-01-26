/* eslint-disable @typescript-eslint/ban-ts-comment */
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
} from 'Meta/types';

import {
    isArrayMeta,
    isFunctionMeta,
    isPromiseMeta,
    isVariantMeta,
    isWidgetMeta,
} from 'Meta/_types/meta';

import { isArrayMetaDescriptor } from 'Meta/_types/array';
import { isFunctionMetaDescriptor } from 'Meta/_types/function';
import { isPrimitiveMetaDescriptor } from 'Meta/_types/baseMeta';
import { isPromiseMetaDescriptor } from 'Meta/_types/promise';
import { isVariantMetaDescriptor } from 'Meta/_types/variant';
import { isObjectMetaDescriptor } from 'Meta/_types/object';
import { isWidgetMetaDescriptor } from 'Meta/_types/widget';

import {
    AnyType,
    ArrayType,
    FunctionType,
    ObjectType,
    PromiseType,
    VariantType,
    WidgetType,
} from 'Meta/_types/types';

describe('Meta/_types/meta', () => {
    describe('isMeta()', () => {
        test('возвращает `true`, если аргумент является экземпляром класса `Meta`', () => {
            const result = isMeta(new Meta({}));
            expect(result).toEqual(true);
        });

        test('возвращает `true`, если аргумент является экземпляром класса `ObjectMeta`', () => {
            const result = isMeta(new ObjectMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `true`, если аргумент является экземпляром класса `ArrayMeta`', () => {
            const result = isMeta(new ArrayMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `true`, если аргумент является экземпляром класса `FunctionMeta`', () => {
            const result = isMeta(new FunctionMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `true`, если аргумент является экземпляром класса `PromiseMeta`', () => {
            const result = isMeta(new PromiseMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является экземпляром класса `Meta`', () => {
            expect(isMeta(null)).toEqual(false);
            expect(isMeta({})).toEqual(false);
            expect(isMeta({ is: MetaClass.primitive })).toEqual(false);
        });
    });

    /*     describe('isObjectMeta()', () => {
        test('возвращает `true`, если аргумент является экземпляром класса `ObjectMeta`', () => {
            const result = isObjectMeta(new ObjectMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является экземпляром класса `ObjectMeta`', () => {
            expect(isObjectMeta(new WidgetMeta())).toEqual(false);
            expect(isObjectMeta(new Meta())).toEqual(false);
            expect(isObjectMeta(new ArrayMeta())).toEqual(false);
            expect(isObjectMeta(new FunctionMeta())).toEqual(false);
            expect(isObjectMeta(new PromiseMeta())).toEqual(false);
            expect(
                isObjectMeta({ is: MetaClass.object, attributes: {} })
            ).toEqual(false);
        });
    }); */

    describe('isPromiseMeta()', () => {
        test('возвращает `true`, если аргумент является экземпляром класса `PromiseMeta`', () => {
            const result = isPromiseMeta(new PromiseMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является экземпляром класса `PromiseMeta`', () => {
            expect(isPromiseMeta(new Meta())).toEqual(false);
            expect(isPromiseMeta(new ArrayMeta())).toEqual(false);
            expect(isPromiseMeta(new FunctionMeta())).toEqual(false);
            expect(isPromiseMeta(new ObjectMeta())).toEqual(false);
            expect(isPromiseMeta({ is: MetaClass.promise })).toEqual(false);
        });
    });

    describe('isArrayMeta()', () => {
        test('возвращает `true`, если аргумент является экземпляром класса `ArrayMeta`', () => {
            const result = isArrayMeta(new ArrayMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является экземпляром класса `ArrayMeta`', () => {
            expect(isArrayMeta(new Meta())).toEqual(false);
            expect(isArrayMeta(new PromiseMeta())).toEqual(false);
            expect(isArrayMeta(new FunctionMeta())).toEqual(false);
            expect(isArrayMeta(new ObjectMeta())).toEqual(false);
            expect(isArrayMeta({ is: MetaClass.array })).toEqual(false);
        });
    });

    describe('isFunctionMeta()', () => {
        test('возвращает `true`, если аргумент является экземпляром класса `FunctionMeta`', () => {
            const result = isFunctionMeta(new FunctionMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является экземпляром класса `FunctionMeta`', () => {
            expect(isFunctionMeta(new Meta())).toEqual(false);
            expect(isFunctionMeta(new PromiseMeta())).toEqual(false);
            expect(isFunctionMeta(new ArrayMeta())).toEqual(false);
            expect(isFunctionMeta(new ObjectMeta())).toEqual(false);
            expect(isFunctionMeta({ is: MetaClass.function })).toEqual(false);
        });
    });

    describe('isVariantMeta()', () => {
        test('возвращает `true`, если аргумент является экземпляром класса `VariantMeta`', () => {
            const result = isVariantMeta(new VariantMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является экземпляром класса `VariantMeta`', () => {
            expect(isVariantMeta(new Meta())).toEqual(false);
            expect(isVariantMeta(new PromiseMeta())).toEqual(false);
            expect(isVariantMeta(new ArrayMeta())).toEqual(false);
            expect(isVariantMeta(new ObjectMeta())).toEqual(false);
            expect(isVariantMeta({ is: MetaClass.union })).toEqual(false);
        });
    });

    describe('isWidgetMeta()', () => {
        test('возвращает `true`, если аргумент является экземпляром класса `WidgetMeta`', () => {
            const result = isWidgetMeta(new WidgetMeta());
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является экземпляром класса `WidgetMeta`', () => {
            expect(isWidgetMeta(ObjectType)).toEqual(false);
            expect(isWidgetMeta(new Meta())).toEqual(false);
            expect(isWidgetMeta(new PromiseMeta())).toEqual(false);
            expect(isWidgetMeta(new ArrayMeta())).toEqual(false);
            expect(isWidgetMeta(new ObjectMeta())).toEqual(false);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore тест на то что упадёт проверка
            expect(isWidgetMeta({ is: MetaClass.widget })).toEqual(false);
        });
    });

    describe('isPrimitiveMetaDescriptor()', () => {
        test('возвращает `true`, если аргумент является корректным описанием', () => {
            const result = isPrimitiveMetaDescriptor({});
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является корректным описанием', () => {
            expect(isPrimitiveMetaDescriptor(AnyType)).toEqual(false);
            expect(isPrimitiveMetaDescriptor(1)).toEqual(false);
            expect(isPrimitiveMetaDescriptor(null)).toEqual(false);
            expect(isPrimitiveMetaDescriptor([])).toEqual(false);
            expect(
                isPrimitiveMetaDescriptor(() => {
                    return true;
                })
            ).toEqual(false);
        });
    });

    describe('isObjectMetaDescriptor()', () => {
        test('возвращает `true`, если аргумент является корректным описанием типа "object"', () => {
            const result = isObjectMetaDescriptor({ is: MetaClass.object });
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является корректным описанием типа "object"', () => {
            expect(isObjectMetaDescriptor(ObjectType)).toEqual(false);
            expect(isObjectMetaDescriptor(1)).toEqual(false);
            expect(isObjectMetaDescriptor(null)).toEqual(false);
            expect(
                isObjectMetaDescriptor(() => {
                    return true;
                })
            ).toEqual(false);
            expect(isObjectMetaDescriptor({})).toEqual(false);
            expect(isObjectMetaDescriptor({ attributes: [] })).toEqual(false);
            expect(isObjectMetaDescriptor({ arrayOf: {} })).toEqual(false);
            expect(isObjectMetaDescriptor({ result: {} })).toEqual(false);
        });
    });

    describe('isPromiseMetaDescriptor()', () => {
        test('возвращает `true`, если аргумент является корректным описанием типа "promise"', () => {
            const result = isPromiseMetaDescriptor({ is: MetaClass.promise });
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является корректным описанием типа "promise"', () => {
            expect(isPromiseMetaDescriptor(PromiseType)).toEqual(false);
            expect(isPromiseMetaDescriptor(1)).toEqual(false);
            expect(isPromiseMetaDescriptor(null)).toEqual(false);
            expect(
                isPromiseMetaDescriptor(() => {
                    return true;
                })
            ).toEqual(false);
            expect(isPromiseMetaDescriptor({})).toEqual(false);
            expect(isPromiseMetaDescriptor({ attributes: {} })).toEqual(false);
            expect(isPromiseMetaDescriptor({ arrayOf: {} })).toEqual(false);
        });
    });

    describe('isArrayMetaDescriptor()', () => {
        test('возвращает `true`, если аргумент является корректным описанием типа "array"', () => {
            const result = isArrayMetaDescriptor({ is: MetaClass.array });
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является корректным описанием типа "array"', () => {
            expect(isArrayMetaDescriptor(ArrayType)).toEqual(false);
            expect(isArrayMetaDescriptor(1)).toEqual(false);
            expect(isArrayMetaDescriptor(null)).toEqual(false);
            expect(
                isArrayMetaDescriptor(() => {
                    return true;
                })
            ).toEqual(false);
            expect(isArrayMetaDescriptor({})).toEqual(false);
            expect(isArrayMetaDescriptor({ attributes: {} })).toEqual(false);
            expect(isArrayMetaDescriptor({ arrayOf: [] })).toEqual(false);
            expect(isArrayMetaDescriptor({ result: {} })).toEqual(false);
        });
    });

    describe('isFunctionMetaDescriptor()', () => {
        test('возвращает `true`, если аргумент является корректным описанием типа "function"', () => {
            const result = isFunctionMetaDescriptor({ is: MetaClass.function });
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является корректным описанием типа "function"', () => {
            expect(isFunctionMetaDescriptor(FunctionType)).toEqual(false);
            expect(isFunctionMetaDescriptor(1)).toEqual(false);
            expect(isFunctionMetaDescriptor(null)).toEqual(false);
            expect(
                isFunctionMetaDescriptor(() => {
                    return true;
                })
            ).toEqual(false);
            expect(isFunctionMetaDescriptor({})).toEqual(false);
            expect(isFunctionMetaDescriptor({ attributes: {} })).toEqual(false);
            expect(isFunctionMetaDescriptor({ arrayOf: {} })).toEqual(false);
            expect(isFunctionMetaDescriptor({ result: {} })).toEqual(false);
        });
    });

    describe('isVariantMetaDescriptor()', () => {
        test('возвращает `true`, если аргумент является корректным описанием типа "variant"', () => {
            const result = isVariantMetaDescriptor({ is: MetaClass.variant });
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является корректным описанием типа "variant"', () => {
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor(VariantType)).toEqual(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor(1)).toEqual(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor(null)).toEqual(false);
            expect(
                // @ts-ignore это тест
                isVariantMetaDescriptor(() => {
                    return true;
                })
            ).toEqual(false);
            expect(isVariantMetaDescriptor({})).toEqual(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor({ attributes: {} })).toEqual(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor({ arrayOf: {} })).toEqual(false);
            // @ts-ignore это тест
            expect(isVariantMetaDescriptor({ result: {} })).toEqual(false);
        });
    });

    describe('isWidgetMetaDescriptor()', () => {
        test('возвращает `true`, если аргумент является корректным описанием типа "widget"', () => {
            const result = isWidgetMetaDescriptor({ is: MetaClass.widget });
            expect(result).toEqual(true);
        });

        test('возвращает `false`, если аргумент не является корректным описанием типа "widget"', () => {
            expect(isWidgetMetaDescriptor(WidgetType)).toEqual(false);
            expect(isWidgetMetaDescriptor(1)).toEqual(false);
            expect(isWidgetMetaDescriptor(null)).toEqual(false);
            expect(
                isWidgetMetaDescriptor(() => {
                    return true;
                })
            ).toEqual(false);
            expect(isWidgetMetaDescriptor({})).toEqual(false);
            expect(isWidgetMetaDescriptor({ attributes: {} })).toEqual(false);
            expect(isWidgetMetaDescriptor({ arrayOf: {} })).toEqual(false);
            expect(isWidgetMetaDescriptor({ result: {} })).toEqual(false);
        });
    });

    describe('category()', () => {
        test('возвращает новые атрибуты с изменённым значением `category`', () => {
            const name = 'name';
            const original = {
                one: {},
                two: AnyType.category('two'),
            };
            const result = category(name, original);
            expect(result).not.toEqual(original);
            expect(result.one).not.toEqual(original.one);
            expect(result.one).toBeInstanceOf(Meta);
            expect((result.one as Meta<any>).getCategory()).toEqual(name);
            expect(result.two).not.toEqual(original.two);
            expect(result.two.getCategory()).toEqual(name);
            expect(result.two).toBeInstanceOf(Meta);
        });

        test('не создаёт новые атрибуты, если свойство `category` не изменяется', () => {
            const name = 'name';
            const original = {
                one: AnyType,
                two: AnyType.category(name),
            };
            const result = category(name, original);
            expect(result).not.toEqual(original);
            expect(result.one).not.toEqual(original.one);
            expect(result.one.getCategory()).toEqual(name);
            expect(result.one).toBeInstanceOf(Meta);
            expect(result.two).toEqual(original.two);
            expect(result.two).toBeInstanceOf(Meta);
        });
    });
});
