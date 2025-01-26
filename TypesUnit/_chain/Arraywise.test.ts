import { registerFactory } from 'Types/_chain/factory';
import Arraywise from 'Types/_chain/Arraywise';

registerFactory();

function generateArray(length: number): number[] {
    return Array.from({ length }, () => {
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    });
}

describe('Types/_chain/Arraywise', () => {
    let items: string[];
    let chain: Arraywise<string>;

    beforeEach(() => {
        items = ['one', 'two', 'three'];
        chain = new Arraywise(items);
    });

    afterEach(() => {
        chain.destroy();
    });

    describe('.constructor()', () => {
        it('should throw an error on invalid argument', () => {
            let chain;

            expect(() => {
                //@ts-ignore
                chain = new Arraywise(undefined);
            }).toThrow();
            expect(() => {
                chain = new Arraywise({} as any);
            }).toThrow();
            expect(() => {
                chain = new Arraywise('' as any);
            }).toThrow();
            expect(() => {
                chain = new Arraywise(0 as any);
            }).toThrow();
            expect(() => {
                //@ts-ignore
                chain = new Arraywise(null);
            }).toThrow();

            expect(chain).not.toBeDefined();
        });
    });

    describe('.start', () => {
        it('should return itself for first element', () => {
            expect(chain.start).toBe(chain);
        });

        it('should return first element for second element', () => {
            expect(chain.reverse().start).toBe(chain);
        });
    });

    describe('.getEnumerator()', () => {
        it('should return enumerator with all items', () => {
            const enumerator = chain.getEnumerator();
            let index = 0;
            while (enumerator.moveNext()) {
                expect(enumerator.getCurrent()).toBe(items[index]);
                index++;
            }
            expect(index).toBe(items.length);
        });
    });

    describe('.each()', () => {
        it('should return all items', () => {
            let index = 0;
            chain.each((item, itemIndex) => {
                expect(item).toBe(items[index]);
                expect(itemIndex).toBe(index);
                index++;
            });
            expect(index).toBe(items.length);
        });
    });

    describe('.value()', () => {
        it('should return all items as array', () => {
            expect(chain.value()).toEqual(items);
        });

        it('should return type from given factory', () => {
            class Type<T> {
                constructor(public items: T) {}
            }
            //@ts-ignore
            const factory = (items) => {
                return new Type(items);
            };
            const result = chain.value<Type<Arraywise<string>>>(factory);

            expect(result).toBeInstanceOf(Type);
            expect(result.items).toBeInstanceOf(Arraywise);
        });

        it('should pass arguments to the factory', () => {
            //@ts-ignore
            const factory = (...args) => {
                return args;
            };
            const arg1 = 'foo';
            const arg2 = 'bar';
            const result = chain.value(factory, arg1, arg2);

            //@ts-ignore
            expect(result[0]).toBeInstanceOf(Arraywise);
            //@ts-ignore
            expect(result[1]).toEqual(arg1);
            //@ts-ignore
            expect(result[2]).toEqual(arg2);
        });
    });

    describe('.toArray()', () => {
        it('should return all items', () => {
            expect(chain.toArray()).toEqual(items);
        });
    });

    describe('.toObject()', () => {
        it('should return array-like items', () => {
            const obj = chain.toObject();
            for (let i = 0; i < items.length; i++) {
                expect(obj[i]).toBe(items[i]);
            }
        });
    });

    describe('.reduce()', () => {
        it('should return summary', () => {
            const items = [1, 2, 3];
            const chain = new Arraywise(items);
            const result = chain.reduce((prev, curr) => {
                //@ts-ignore
                return prev + curr;
            });
            expect(result).toBe(1 + 2 + 3);
        });

        it('should return summary with offset', () => {
            const items = [1, 2, 3];
            const chain = new Arraywise(items);
            const result = chain.reduce((prev, curr) => {
                //@ts-ignore
                return prev + curr;
            }, 10);
            expect(result).toBe(10 + 1 + 2 + 3);
        });
    });

    describe('.reduceRight()', () => {
        it('should return division', () => {
            const items = [2, 5, 2, 100];
            const chain = new Arraywise(items);
            const result = chain.reduceRight((prev, curr) => {
                //@ts-ignore
                return prev / curr;
            });
            expect(result).toBe(100 / 2 / 5 / 2);
        });

        it('should return division with offset', () => {
            const items = [5, 2, 100];
            const chain = new Arraywise(items);
            const result = chain.reduceRight((prev, curr) => {
                //@ts-ignore
                return prev / curr;
            }, 15000);
            expect(result).toBe(15000 / 100 / 2 / 5);
        });
    });

    describe('.map()', () => {
        it('should convert chain to the indices', () => {
            let index = 0;
            chain
                //@ts-ignore
                .map((item, itemIndex) => {
                    return itemIndex;
                })
                .each((item) => {
                    expect(item).toBe(index);
                    index++;
                });
            expect(index).toBe(items.length);
        });

        it('should convert chain to the pairs', () => {
            let index = 0;
            chain
                .map((item, itemIndex) => {
                    return [item, itemIndex];
                })
                .each((item) => {
                    expect(item[0]).toBe(items[index]);
                    expect(item[1]).toBe(index);
                    index++;
                });
            expect(index).toBe(items.length);
        });
    });

    describe('.zip()', () => {
        it('should zip the collections', () => {
            const expectData = [
                ['one', 1, true],
                ['two', 2, true],
                ['three', 3, false],
            ];

            let index = 0;
            chain.zip([1, 2, 3], [true, true, false]).each((item) => {
                expect(item).toEqual(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });
    });

    describe('.zipObject()', () => {
        it('should zip the collections', () => {
            expect(chain.zipObject([1, 2, 3])).toEqual({
                one: 1,
                two: 2,
                three: 3,
            });
        });
    });

    describe('.pluck()', () => {
        it('should convert chain to the array of sting', () => {
            const items = [{ name: 'one' }, { name: 'two' }, { name: 'three' }];
            const chain = new Arraywise(items);

            let index = 0;
            chain.pluck('name').each((item) => {
                expect(item).toBe(items[index].name);
                index++;
            });
            expect(index).toBe(items.length);
        });
    });

    describe('.invoke()', () => {
        it('should convert chain to the array of sting', () => {
            const items = ['What', 'you', 'see', 'is', 'what', 'you', 'get'];
            const chain = new Arraywise(items);

            let index = 0;
            chain.invoke('substr', 0, 1).each((item) => {
                expect(item).toBe(items[index][0]);
                index++;
            });
            expect(index).toBe(items.length);
        });
    });

    describe('.concat()', () => {
        it('should concat the chain with the array', () => {
            const items = [1, 2, 3];
            const concat1 = [4, 5];
            const concat2 = [6];
            const expectData = [1, 2, 3, 4, 5, 6];
            const chain = new Arraywise(items);

            let index = 0;
            chain.concat(concat1, concat2).each((item) => {
                expect(item).toBe(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });
    });

    describe('.flatten()', () => {
        it('should convert nested chain to the array', () => {
            const items = [1, [2], [3, [[4, [5]]]]];
            const expectData = [1, 2, 3, 4, 5];
            const chain = new Arraywise(items);

            let index = 0;
            chain.flatten().each((item) => {
                expect(item).toBe(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });
    });

    describe('.uniq()', () => {
        it('should return unique items', () => {
            const items = [1, 2, 3, 2, 1, 0];
            const expectData = [1, 2, 3, 0];
            const chain = new Arraywise(items);

            let index = 0;
            chain.uniq().each((item) => {
                expect(item).toBe(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });

        it('should return unique items for large array', () => {
            const items = generateArray(10000);
            const expectData = Array.from(new Set(items));
            const chain = new Arraywise(items);

            let index = 0;
            chain.uniq().each((item) => {
                expect(item).toBe(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });

        it('should return items with unique property values', () => {
            const items = [
                { id: 1, title: 'a' },
                { id: 2, title: 'b' },
                { id: 3, title: 'a' },
                { id: 4, title: 'c' },
            ];
            const expectData = [1, 2, 4];
            const chain = new Arraywise(items);

            let index = 0;
            chain
                .uniq((item) => {
                    return item.title;
                })
                .each((item) => {
                    expect(item.id).toBe(expectData[index]);
                    index++;
                });
            expect(index).toBe(expectData.length);
        });

        it('should return items with unique property values from toArray', () => {
            const items = [
                { id: 1, title: 'a' },
                { id: 2, title: 'b' },
                { id: 3, title: 'a' },
                { id: 4, title: 'c' },
            ];
            const expectData = [1, 2, 4];
            const chain = new Arraywise(items);

            const result = chain
                .uniq((item) => {
                    return item.title;
                })
                .value();
            result.forEach((item, index) => {
                expect(item.id).toBe(expectData[index]);
            });
            expect(result.length).toBe(expectData.length);
        });
    });

    describe('.union()', () => {
        it('should union with the array', () => {
            const items = [1, 2, 3];
            const union = [0, 1, 2, 3, 4, 5];
            const expectData = [1, 2, 3, 0, 4, 5];
            const chain = new Arraywise(items);

            let index = 0;
            chain.union(union).each((item) => {
                expect(item).toBe(expectData[index]);
                index++;
            });
            expect(index).toBe(expectData.length);
        });
    });

    describe('.filter()', () => {
        it('should filter chain by item', () => {
            const expectData = ['three'];

            let index = 0;
            chain
                .filter((item) => {
                    return item === 'three';
                })
                .each((item) => {
                    expect(item).toBe(expectData[index]);
                    index++;
                });
            expect(index).toBe(expectData.length);
        });

        it('should filter chain by index', () => {
            const expectData = ['two'];

            let index = 0;
            chain
                //@ts-ignore
                .filter((item, index) => {
                    return index === 1;
                })
                .each((item) => {
                    expect(item).toBe(expectData[index]);
                    index++;
                });
            expect(index).toBe(expectData.length);
        });
    });

    describe('.reject()', () => {
        it('should filter chain in negative logic', () => {
            const expectData = ['one', 'two'];

            let index = 0;
            chain
                .reject((item) => {
                    return item === 'three';
                })
                .each((item) => {
                    expect(item).toBe(expectData[index]);
                    index++;
                });
            expect(index).toBe(expectData.length);
        });
    });

    describe('.where()', () => {
        it('should filter chain in "and" logic', () => {
            const items = [
                { id: 1, title: 'foo', genre: 'bar' },
                { id: 2, title: 'fooz', genre: 'baz' },
                { id: 3, title: 'foo', genre: 'bar' },
                { id: 2, title: 'foox', genre: 'baz' },
            ];
            const expectData = [items[0], items[2]];
            const chain = new Arraywise(items);

            const result = chain
                .where({
                    //@ts-ignore
                    title: 'foo',
                    //@ts-ignore
                    genre: 'bar',
                })
                .value();
            expect(result).toEqual(expectData);
        });
    });

    describe('.reverse()', () => {
        it('should reverse chain', () => {
            const result = chain.reverse().value();
            const expectData = items.slice();

            expectData.reverse();
            expect(result).toEqual(expectData);
        });
    });

    describe('.first()', () => {
        it('should return first item', () => {
            expect(chain.first()).toEqual(items[0]);
        });

        it('should return first "n" items', () => {
            expect(chain.first(2).value()).toEqual(items.slice(0, 2));
        });
    });

    describe('.last()', () => {
        it('should return last item', () => {
            expect(chain.last()).toEqual(items[items.length - 1]);
        });

        it('should return last "n" items', () => {
            expect(chain.last(2).value()).toEqual(items.slice(-2));
        });
    });

    describe('.sort()', () => {
        it('should sort chain', () => {
            const result = chain.sort().value();
            const expectData = items.slice();

            expectData.sort();
            expect(result).toEqual(expectData);
        });
    });
});
