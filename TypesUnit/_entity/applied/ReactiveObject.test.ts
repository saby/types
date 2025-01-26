import ReactiveObject from 'Types/_entity/applied/ReactiveObject';

describe('Types/_entity/applied/ReactiveObject', () => {
    describe('.constructor()', () => {
        test('should create instance of ReactiveObject', () => {
            const instance = new ReactiveObject({});
            expect(instance).toBeInstanceOf(ReactiveObject);
        });
    });

    describe('[key: string]', () => {
        test('should return property value', () => {
            const instance = new ReactiveObject({
                foo: 'bar',
            });
            expect(instance.foo).toEqual('bar');
        });

        test('should update property value', () => {
            const instance = new ReactiveObject({
                foo: 'bar',
            });
            instance.foo = 'baz';
            expect(instance.foo).toEqual('baz');
        });

        test('should invoke callback if property value being updated', () => {
            let given;
            const instance = new ReactiveObject(
                {
                    foo: 'bar',
                },
                (version: number) => {
                    given = version;
                }
            );
            instance.foo = 'baz';
            expect(given).toEqual(1);
        });

        test('should return read-only property value', () => {
            const instance = new ReactiveObject({
                get foo(): string {
                    return 'bar';
                },
            });
            expect(instance.foo).toEqual('bar');
        });

        test('should throw an Error on write into read-only property value', () => {
            const instance: any = new ReactiveObject({
                get foo(): string {
                    return 'bar';
                },
            });
            expect(() => {
                instance.foo = 'baz';
            }).toThrow();
        });

        test('should update calculated property value', () => {
            const instance = new ReactiveObject({
                email: 'foo@bar.com',
                get domain(): string {
                    return this.email.split('@')[1];
                },
                set domain(value: string) {
                    const parts = this.email.split('@');
                    parts[1] = value;
                    this.email = parts.join('@');
                },
            });
            expect(instance.domain).toEqual('bar.com');
            instance.domain = 'bar.org';
            expect(instance.domain).toEqual('bar.org');
            expect(instance.email).toEqual('foo@bar.org');
        });

        test('should update not-reactive property value', () => {
            const instance = new ReactiveObject<{
                foo?: string;
            }>({});
            instance.foo = 'bar';
            expect(instance.foo).toEqual('bar');
        });
    });

    describe('.getVersion()', () => {
        test('should update version after update property', () => {
            const instance = new ReactiveObject({
                foo: 'bar',
            });
            const initialVersion = instance.getVersion();

            instance.foo = 'baz';
            expect(instance.getVersion()).not.toEqual(initialVersion);
        });

        test("shouldn't update version after set the same property value", () => {
            const instance = new ReactiveObject({
                foo: 'bar',
            });
            const initialVersion = instance.getVersion();

            instance.foo = 'bar';
            expect(instance.getVersion()).toEqual(initialVersion);
        });

        test('should update version after update calculated property value', () => {
            const instance = new ReactiveObject({
                get foo(): string {
                    return 'bar';
                },
                set foo(_value: string) {
                    // do nothing
                },
            });
            const initialVersion = instance.getVersion();
            instance.foo = 'baz';
            expect(instance.getVersion()).not.toEqual(initialVersion);
        });

        test("shouldn't update version after set the same calculated property value", () => {
            const instance = new ReactiveObject({
                get foo(): string {
                    return 'bar';
                },
                set foo(_value: string) {
                    // do nothing
                },
            });
            const initialVersion = instance.getVersion();

            instance.foo = 'bar';
            expect(instance.getVersion()).toEqual(initialVersion);
        });

        test("shouldn't update version after update not-reactive property", () => {
            const instance = new ReactiveObject<{
                foo?: string;
            }>({});
            const initialVersion = instance.getVersion();

            instance.foo = 'bar';
            expect(instance.getVersion()).toEqual(initialVersion);
        });

        test('should update version on nested object update', () => {
            const instance = new ReactiveObject({
                foo: new ReactiveObject({
                    bar: 'baz',
                }),
            });
            const initialVersion = instance.getVersion();
            expect(initialVersion).toEqual(instance.getVersion());

            instance.foo.bar = 'newbie';
            const version = instance.getVersion();
            expect(version).not.toEqual(initialVersion);
            expect(version).toEqual(instance.getVersion());

            instance.foo.bar = 'dewbie';
            expect(version).not.toEqual(instance.getVersion());
        });
    });
});
