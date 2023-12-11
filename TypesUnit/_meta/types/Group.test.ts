import { expect } from 'chai';
import { Meta, MetaClass } from 'Types/_meta/baseMeta';
import { group, ObjectMeta } from 'Types/meta';

describe('Types/_meta', () => {
    describe('group()', () => {
        it('Не теряется редактор при группировки атрибутов', () => {
            const attributeOne = new Meta()
                .editor('TypesUnit/_meta/types/mock')
                .editorProps({ editorProp: 'foo' });
            const original = new ObjectMeta({
                is: MetaClass.object,
                attributes: { attributeOne },
            });
            const copied = new ObjectMeta({
                is: MetaClass.object,
                attributes: {
                    ...group('some-group', original.getAttributes()),
                },
            });
            expect(copied.getAttributes()).has.keys(['attributeOne']);
            expect(copied.getAttributes()?.attributeOne.getEditor()).deep.equal(
                attributeOne.getEditor()
            );
            expect(copied.getAttributes()?.attributeOne.getEditor().props).has.keys(['editorProp']);
        });
    });
});
