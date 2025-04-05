import { registerFactory } from 'Types/_chain/factory';
import Objectwise from 'Types/_chain/Objectwise';

registerFactory();

describe('Types/_chain/Objectwise', () => {
    let items: Record<string, number>;
    let chain: Objectwise<number>;

    beforeEach(() => {
        items = { one: 1, two: 2, three: 3 };
        chain = new Objectwise(items);
    });

    afterEach(() => {
        chain.destroy();
    });

    describe('.constructor()', () => {
        test('should throw an error on invalid argument', () => {
            let chain;

            expect(() => {
                //@ts-ignore
                chain = new Objectwise(undefined);
            }).toThrow();
            expect(() => {
                chain = new Objectwise('' as any);
            }).toThrow();
            expect(() => {
                chain = new Objectwise(0 as any);
            }).toThrow();
            expect(() => {
                //@ts-ignore
                chain = new Objectwise(null);
            }).toThrow();

            expect(chain).not.toBeDefined();
        });
    });

    describe('.getEnumerator()', () => {
        test('should return enumerator with all items', () => {
            const enumerator = chain.getEnumerator();
            const result = {};
            while (enumerator.moveNext()) {
                //@ts-ignore
                result[enumerator.getCurrentIndex()] = enumerator.getCurrent();
            }
            expect(result).toEqual(items);
        });
    });

    describe('.each()', () => {
        test('should return all items', () => {
            const keys = Object.keys(items);
            let count = 0;
            chain.each((item, key) => {
                expect(item).toBe(items[key]);
                expect(key).toBe(keys[count]);
                count++;
            });
            expect(count).toBe(keys.length);
        });
    });

    describe('.value()', () => {
        test('should return equal object', () => {
            expect(chain.value()).toEqual(items);
        });

        test('should return type from given factory', () => {
            class Type<T> {
                constructor(public items: T) {}
            }
            //@ts-ignore
            const factory = (items) => {
                return new Type(items);
            };

            const result = chain.value(factory);
            expect(result).toBeInstanceOf(Type);
            expect(result.items).toBeInstanceOf(Objectwise);
        });
    });

    describe('.toArray()', () => {
        test('should return all object values', () => {
            const arr = [];
            for (const key in items) {
                if (items.hasOwnProperty(key)) {
                    arr.push(items[key]);
                }
            }
            expect(chain.toArray()).toEqual(arr);
        });
    });

    describe('.toObject()', () => {
        test('should return equal object', () => {
            expect(chain.toObject()).toEqual(items);
        });
    });

    describe('.reduce()', () => {
        test('should return sum of values', () => {
            const result = chain.reduce((prev, curr) => {
                //@ts-ignore
                return prev + curr;
            }, 0);
            expect(result).toBe(1 + 2 + 3);
        });

        test('should return concatenation of keys', () => {
            //@ts-ignore
            const result = chain.reduce((prev, curr, index) => {
                return prev + index;
            }, '');
            expect(result).toBe('one' + 'two' + 'three');
        });
    });

    describe('.map()', () => {
        test('should map chain as keys', () => {
            const keys = Object.keys(items);
            let index = 0;
            chain
                //@ts-ignore
                .map((value, key) => {
                    return key;
                })
                .each((item, key) => {
                    expect(item).toBe(keys[index]);
                    expect(key).toBe(keys[index]);
                    index++;
                });
            expect(index).toBe(keys.length);
        });

        test('should map chain as values', () => {
            const keys = Object.keys(items);
            let index = 0;
            chain
                .map((item) => {
                    return item;
                })
                .each((item) => {
                    expect(item).toBe(items[keys[index]]);
                    index++;
                });
            expect(index).toBe(keys.length);
        });
    });

    describe('.filter()', () => {
        test('should filter chain by item', () => {
            let index = 0;
            chain
                .filter((item) => {
                    return item === 3;
                })
                .each((item) => {
                    expect(item).toBe(3);
                    index++;
                });
            expect(index).toBe(1);
        });

        test('should filter chain by index', () => {
            let index = 0;
            chain
                //@ts-ignore
                .filter((item, index) => {
                    return index === 'two';
                })
                .each((item) => {
                    expect(item).toBe(2);
                    index++;
                });
            expect(index).toBe(1);
        });
    });
});
