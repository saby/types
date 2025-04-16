import PrefetchProxy from 'Types/_source/PrefetchProxy';
import OptionsMixin from 'Types/_source/OptionsMixin';
import { Query } from 'Types/source';

describe('Types/_source/PrefetchProxy', () => {
    const getTarget = (data: object[]) => {
        class Target extends OptionsMixin {
            data = data;
            lastMethod: string;
            lastArgs: string[];

            create(): string {
                this.lastMethod = 'create';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!create';
            }

            read(): string {
                this.lastMethod = 'read';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!read';
            }

            update(): string {
                this.lastMethod = 'update';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!update';
            }

            destroy(): string {
                this.lastMethod = 'destroy';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!destroy';
            }

            query(): string {
                this.lastMethod = 'query';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!query';
            }

            merge(): string {
                this.lastMethod = 'merge';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!merge';
            }

            copy(): string {
                this.lastMethod = 'copy';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!copy';
            }

            move(): string {
                this.lastMethod = 'move';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!move';
            }

            getOrderProperty(): string {
                this.lastMethod = 'getOrderProperty';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!getOrderProperty';
            }

            //@ts-ignore
            getOptions(): string {
                this.lastMethod = 'getOptions';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!getOptions';
            }

            setOptions(): string {
                this.lastMethod = 'setOptions';
                this.lastArgs = Array.prototype.slice.call(arguments);
                return '!setOptions';
            }
        }

        return new Target();
    };

    let targetData: {
        id: number;
    }[];
    let target: any;

    beforeEach(() => {
        targetData = [{ id: 1 }, { id: 2 }, { id: 3 }];

        target = getTarget(targetData);
    });

    describe('.constructor()', () => {
        test('should throw ReferenceError if target is not specified', () => {
            let source;
            expect(() => {
                //@ts-ignore
                source = new PrefetchProxy();
            }).toThrow();

            expect(source).not.toBeDefined();
        });
    });

    describe('.getData()', () => {
        test('should return value from "data" option', () => {
            const data = {
                create: { foo: 1 } as any,
                read: { bar: 2 } as any,
            };
            const source = new PrefetchProxy({ data, target });

            expect(source.getData()).toEqual(data);
        });
    });

    describe('.getOriginal()', () => {
        test('should return value from "target" option', () => {
            const source = new PrefetchProxy({
                target,
            });

            expect(source.getOriginal()).toBe(target);
        });

        test('should unwrap the chain of IDecorator instances', () => {
            const source = new PrefetchProxy({
                target: new PrefetchProxy({ target }),
            });

            expect(source.getOriginal()).toBe(target);
        });
    });

    describe('.create()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo'];

            //@ts-ignore
            expect(source.create.apply(source, args)).toEqual('!create');
            expect(target.lastMethod).toEqual('create');
            expect(target.lastArgs).toEqual(args);
        });
    });

    describe('.read()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo', 'bar'];

            //@ts-ignore
            expect(source.read.apply(source, args)).toEqual('!read');
            expect(target.lastMethod).toEqual('read');
            expect(target.lastArgs).toEqual(args);
        });

        test('should return result from data.read first', () => {
            const expected: any = { foo: 'bar' };
            const source = new PrefetchProxy({
                target,
                data: {
                    read: expected,
                },
            });

            //@ts-ignore
            return source.read(undefined).then((data) => {
                expect(data).toEqual(expected);
                //@ts-ignore
                expect(source.read(undefined) as any).toEqual('!read');
            });
        });

        test('should pass valid arguments to validator', () => {
            const readData = {};
            const data: unknown = { read: readData };
            const validators = {
                read: () => {
                    return true;
                },
            };
            const readSpy = jest.spyOn(validators, 'read').mockClear();

            //@ts-ignore
            const source = new PrefetchProxy({ target, data, validators });
            const entityId = 123;
            const entityMeta = {};

            return source.read(entityId, entityMeta).then(() => {
                expect(readSpy).toHaveBeenCalledTimes(1);

                const call = readSpy.mock.lastCall;
                //@ts-ignore
                expect(call[0]).toBe(readData);
                //@ts-ignore
                expect(call[1]).toEqual({});
                //@ts-ignore
                expect(call[2]).toBe(entityId);
                //@ts-ignore
                expect(call[3]).toBe(entityMeta);
            });
        });

        test('should always return result from data.read', () => {
            const expected: any = { foo: 'bar' };
            const source = new PrefetchProxy({
                target,
                data: {
                    read: expected,
                },
                validators: {
                    read: () => {
                        return true;
                    },
                },
            });

            //@ts-ignore
            return source.read(undefined).then((data) => {
                expect(data).toEqual(expected);

                //@ts-ignore
                return source.read(undefined).then((data) => {
                    expect(data).toEqual(expected);
                });
            });
        });

        test('should always return result from target', () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    read: {} as any,
                },
                validators: {
                    read: () => {
                        return false;
                    },
                },
            });

            //@ts-ignore
            expect(source.read(undefined) as any).toEqual('!read');
            //@ts-ignore
            expect(source.read(undefined) as any).toEqual('!read');
        });
    });

    describe('.update()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo', 'bar'];

            //@ts-ignore
            expect(source.update.apply(source, args)).toEqual('!update');
            expect(target.lastMethod).toEqual('update');
            expect(target.lastArgs).toEqual(args);
        });
    });

    describe('.destroy()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo', 'bar'];

            //@ts-ignore
            expect(source.destroy.apply(source, args)).toEqual('!destroy');
            expect(target.lastMethod).toEqual('destroy');
            expect(target.lastArgs).toEqual(args);
        });
    });

    describe('.query()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo'];

            //@ts-ignore
            expect(source.query.apply(source, args)).toEqual('!query');
            expect(target.lastMethod).toEqual('query');
            expect(target.lastArgs).toEqual(args);
        });

        test('should return result from data.query first', () => {
            const expected: any = { foo: 'bar' };
            const source = new PrefetchProxy({
                target,
                data: {
                    query: expected,
                },
            });

            return source.query(undefined).then((data) => {
                expect(data).toEqual(expected);

                expect(source.query() as any).toEqual('!query');
            });
        });

        test('should pass valid arguments to validator', () => {
            const queryData = {};
            const data: unknown = { query: queryData };
            const validators = {
                query: () => {
                    return true;
                },
            };
            const querySpy = jest.spyOn(validators, 'query').mockClear();

            //@ts-ignore
            const source = new PrefetchProxy({ target, data, validators });
            const query = new Query();

            return source.query(query).then(() => {
                expect(querySpy).toHaveBeenCalledTimes(1);

                const call = querySpy.mock.lastCall;
                //@ts-ignore
                expect(call[0]).toBe(queryData);
                //@ts-ignore
                expect(call[1]).toEqual({});
                //@ts-ignore
                expect(call[2]).toBe(query);
            });
        });

        test('should always return result from data.query', () => {
            const expected: any = { foo: 'bar' };
            const source = new PrefetchProxy({
                target,
                data: {
                    query: expected,
                },
                validators: {
                    query: () => {
                        return true;
                    },
                },
            });

            return source.query().then((data) => {
                expect(data).toEqual(expected);

                return source.query().then((data) => {
                    expect(data).toEqual(expected);
                });
            });
        });

        test('should always return result from target', () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    query: {} as any,
                },
                validators: {
                    query: () => {
                        return false;
                    },
                },
            });

            expect(source.query() as any).toEqual('!query');
            expect(source.query() as any).toEqual('!query');
        });

        test('should return reject if query is error', () => {
            const error = new Error('It is error');
            const source = new PrefetchProxy({
                target,
                data: {
                    query: error,
                },
            });

            return source.query().catch((data) => {
                expect(data).toBeInstanceOf(Error);
                expect(data).toEqual(error);
            });
        });
    });

    describe('.merge()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo', 'bar'];

            //@ts-ignore
            expect(source.merge.apply(source, args)).toEqual('!merge');
            expect(target.lastMethod).toEqual('merge');
            expect(target.lastArgs).toEqual(args);
        });
    });

    describe('.copy()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo', 'bar'];

            //@ts-ignore
            expect(source.copy.apply(source, args)).toEqual('!copy');
            expect(target.lastMethod).toEqual('copy');
            expect(target.lastArgs).toEqual(args);
        });

        test('should return result from data.copy first', () => {
            const expected: any = { foo: 'bar' };
            const source = new PrefetchProxy({
                target,
                data: {
                    copy: expected,
                },
            });

            //@ts-ignore
            return source.copy(undefined).then((data) => {
                expect(data).toEqual(expected);

                //@ts-ignore
                expect(source.copy(undefined) as any).toEqual('!copy');
            });
        });

        test('should pass valid arguments to validator', () => {
            const copyData = {};
            const data: unknown = { copy: copyData };
            const validators = {
                copy: () => {
                    return true;
                },
            };
            const copySpy = jest.spyOn(validators, 'copy').mockClear();

            //@ts-ignore
            const source = new PrefetchProxy({ target, data, validators });
            const entityId = 123;
            const entityMeta = {};

            return source.copy(entityId, entityMeta).then(() => {
                expect(copySpy).toHaveBeenCalledTimes(1);

                const call = copySpy.mock.lastCall;
                //@ts-ignore
                expect(call[0]).toBe(copyData);
                //@ts-ignore
                expect(call[1]).toEqual({});
                //@ts-ignore
                expect(call[2]).toBe(entityId);
                //@ts-ignore
                expect(call[3]).toBe(entityMeta);
            });
        });

        test('should always return result from data.copy', () => {
            const expected: any = { foo: 'bar' };
            const source = new PrefetchProxy({
                target,
                data: {
                    copy: expected,
                },
                validators: {
                    copy: () => {
                        return true;
                    },
                },
            });

            //@ts-ignore
            return source.copy(undefined).then((data) => {
                expect(data).toEqual(expected);

                //@ts-ignore
                return source.copy(undefined).then((data) => {
                    expect(data).toEqual(expected);
                });
            });
        });

        test('should always return result from target', () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    copy: {} as any,
                },
                validators: {
                    copy: () => {
                        return false;
                    },
                },
            });

            //@ts-ignore
            expect(source.copy(undefined) as any).toEqual('!copy');
            //@ts-ignore
            expect(source.copy(undefined) as any).toEqual('!copy');
        });
    });

    describe('.move()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foo', 'bar', 'baz'];

            //@ts-ignore
            expect(source.move.apply(source, args)).toEqual('!move');
            expect(target.lastMethod).toEqual('move');
            expect(target.lastArgs).toEqual(args);
        });
    });

    describe('.getOptions()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args: string[] = [];

            //@ts-ignore
            expect(source.getOptions.apply(source, args)).toEqual('!getOptions');
            expect(target.lastMethod).toEqual('getOptions');
            expect(target.lastArgs).toEqual(args);
        });
    });

    describe('.setOptions()', () => {
        test('should call the same method on target', () => {
            const source = new PrefetchProxy({
                target,
            });
            const args = ['foor'];

            //@ts-ignore
            expect(source.setOptions.apply(source, args)).toEqual('!setOptions');
            expect(target.lastMethod).toEqual('setOptions');
            expect(target.lastArgs).toEqual(args);
        });
    });

    describe('.fromJSON()', () => {
        test("should call the same method on clone's target if original already called", () => {
            const source = new PrefetchProxy({
                target,
                data: {
                    read: { foo: 'bar' } as any,
                },
            });

            const argsA = ['foo', 1];
            //@ts-ignore
            source.read.apply(source, argsA);

            const json = source.toJSON();
            const clone = (PrefetchProxy as any).fromJSON(json);

            const argsB = ['bar', 2];
            clone.read.apply(clone, argsB);
            expect(target.lastMethod).toEqual('read');
            expect(target.lastArgs).toEqual(argsB);
        });
    });
});
