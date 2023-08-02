import { expect } from 'chai';
import { Meta, MetaClass } from 'Types/_meta/baseMeta';

describe('Types/_meta/meta', () => {
    describe('idgen', () => {
        it('id не фиксируется при вызова clone', () => {
            const id = 'not-fixed-id';

            const someMeta = new Meta({
                is: MetaClass.primitive,
                id,
            });
            expect(someMeta.clone({}).toDescriptor().id).not.equal(id);
        });

        it('id фиксируется при явном задании', () => {
            const id = 'fixed-id';

            const someMeta = new Meta({
                is: MetaClass.primitive,
            });
            expect(someMeta.id(id).clone({}).toDescriptor().id).equal(id);
        });
    });
});
