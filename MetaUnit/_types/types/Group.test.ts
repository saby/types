import { expect } from 'chai';
import { group, ObjectMeta } from 'Meta/types';
import { Meta, MetaClass } from 'Meta/_types/baseMeta';
import { TmpMetaEditor } from 'Meta/_types/components';

describe('Meta/_types', () => {
    describe('group()', () => {
        it('Не теряется редактор при группировки атрибутов', () => {
            const attributeOne = new Meta()
                .editor('MetaUnit/_types/types/mock')
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
            expect((copied.getAttributes()?.attributeOne.getEditor() as TmpMetaEditor).props).has.keys(['editorProp']);
        });
    });
});
