import { StringType } from 'Meta/types';
import { Meta, MetaClass } from 'Meta/_types/baseMeta';

describe('Meta/_types/meta', () => {
    describe('idgen', () => {
        test('id не фиксируется при вызова clone', () => {
            const id = 'not-fixed-id';

            const someMeta = new Meta({
                is: MetaClass.primitive,
                id,
            });
            expect(someMeta.clone({}).toDescriptor().id).not.toEqual(id);
        });

        test('id фиксируется при явном задании', () => {
            const id = 'fixed-id';

            const someMeta = new Meta({
                is: MetaClass.primitive,
            });
            expect(someMeta.id(id).clone({}).toDescriptor().id).toEqual(id);
        });

        test('id стабильный по изменениям', () => {
            const firstType = StringType.description('foo').optional().category('cat');

            const secondType = StringType.description('foo').optional().category('cat');

            expect(firstType.getId()).toEqual(secondType.getId());
        });
    });
});
