import { group, ObjectMeta } from 'Meta/types';
import { Meta, MetaClass } from 'Meta/_types/baseMeta';
import { TmpMetaEditor } from 'Meta/_types/components';

describe('Meta/_types', () => {
    describe('group()', () => {
        test('Не теряется редактор при группировки атрибутов', () => {
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
                    ...group('some-group', original.getProperties()),
                },
            });
            expect(Object.keys(copied.getProperties())).toEqual(
                expect.arrayContaining(['attributeOne'])
            );
            expect(copied.getProperties()?.attributeOne.getEditor()).toEqual(
                attributeOne.getEditor()
            );
            expect(
                Object.keys(
                    //@ts-ignore
                    (copied.getProperties()?.attributeOne.getEditor() as TmpMetaEditor).props
                )
            ).toEqual(expect.arrayContaining(['editorProp']));
        });
    });
});
