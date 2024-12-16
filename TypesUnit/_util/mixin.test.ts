import { applyMixins } from 'Types/_util/mixin';

describe('Types/_util/mixin', () => {
    describe('applyMixins()', () => {
        test('should inherit static members', () => {
            interface IBarMixinContructor {
                propA: string;
                methodA(): string;
            }

            class Foo {}

            class BarMixin {
                static propA: string = 'a';
                static methodA(): string {
                    return 'b';
                }
            }

            applyMixins(Foo, BarMixin);

            expect(Foo.hasOwnProperty('propA')).toBe(true);
            expect((Foo as unknown as IBarMixinContructor).propA).toBe(BarMixin.propA);

            expect(Foo.hasOwnProperty('methodA')).toBe(true);
            expect((Foo as unknown as IBarMixinContructor).methodA).toBe(BarMixin.methodA);
        });

        test("shouldn't inherit static method toJSON", () => {
            class Foo {}
            class BarMixin {
                static toJSON(): unknown {
                    return {};
                }
            }

            applyMixins(Foo, BarMixin);
            expect(Foo.hasOwnProperty('toJSON')).toBe(false);
        });

        test('should inherit dynamic members', () => {
            class BarMixin {
                propA: string = 'a';
                constructor() {
                    BarMixin.initMixin(this);
                }
                //@ts-ignore
                static initMixin(instance) {
                    instance.propA = 'a';
                }
                methodA(): string {
                    return 'b';
                }
            }

            class Foo {
                constructor() {
                    BarMixin.initMixin(this);
                }
            }

            applyMixins(Foo, BarMixin);

            const foo = new Foo() as BarMixin;

            expect(foo.propA).toBe('a');

            expect(Foo.prototype.hasOwnProperty('methodA')).toBe(true);
            expect(foo.methodA).toBe(BarMixin.prototype.methodA);
        });
    });
});
