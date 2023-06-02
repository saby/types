import { expect } from 'chai';
import {
    UnionMeta,
    FunctionMeta,
    Meta,
    MetaClass,
    PromiseMeta,
} from 'Types/meta';

describe('Types/_meta/meta', () => {
    describe('UnionMeta', () => {
        it('наследует класс `Meta`', () => {
            const result = new UnionMeta();
            expect(result).instanceOf(Meta);
        });

        describe('constructor()', () => {
            it('преобразует описание `types` в экземпляры класса `Meta`', () => {
                const result = new UnionMeta({
                    is: MetaClass.union,
                    types: [
                        { is: MetaClass.promise },
                        { is: MetaClass.function },
                    ],
                });
                expect(result.getTypes().length).equal(2);
                expect(result.getTypes()[0]).instanceOf(PromiseMeta);
                expect(result.getTypes()[1]).instanceOf(FunctionMeta);
            });

            it('не создаёт новый экземпляр в `types`, если это уже тип', () => {
                const types = [new FunctionMeta()];
                const result = new UnionMeta({ is: MetaClass.union, types });
                expect(result.getTypes().length).equal(1);
                expect(result.getTypes()[0]).equal(types[0]);
            });
        });

        describe('toDescriptor()', () => {
            it('преобразует тип в мета-описание', () => {
                const original = new UnionMeta({
                    is: MetaClass.union,
                    id: 'toDescriptor',
                    types: [{}],
                });
                const result = original.toDescriptor();
                expect(result.is).equal(MetaClass.union);
                expect(result.id).equal('toDescriptor');
                expect(result.types.length).equal(1);
                expect(result.types[0]).instanceOf(Meta);
            });
        });

        describe('of()', () => {
            it('создаёт новый экземпляр класса `UnionMeta`', () => {
                const types1 = [new Meta()];
                const types2 = [new Meta(), new Meta()] as const;
                const origin = new UnionMeta({
                    is: MetaClass.union,
                    types: types1,
                });
                const result = origin.of(types2);
                expect(origin.getTypes().length).equal(1);
                expect(origin.getTypes()[0]).equal(types1[0]);
                expect(result).not.equal(origin);
                expect(result.getTypes().length).equal(2);
                expect(result.getTypes()[0]).equal(types2[0]);
                expect(result.getTypes()[1]).equal(types2[1]);
            });
        });
    });
});
