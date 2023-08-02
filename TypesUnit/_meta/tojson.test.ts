/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai';
import { Meta, MetaClass } from 'Types/_meta/baseMeta';
import { ObjectType, StringType } from 'Types/meta';
import EditorFn, { NamedEditor } from 'TypesUnit/_meta/tojson/editor';

describe('Types/_meta/meta', () => {
    describe('toJSON()', () => {
        it('Meta сериализуется', () => {
            const id = 'some-id-1';
            const inherits = [];
            const required = true;
            /* const editor = 'NOT IMPLEMENTED: MODULE PATH -1'; */
            const defaultValue = 'none-1';

            const info = {
                title: 'title-1',
                description: 'description-1',
                icon: '//sbis.ru/favicon.ico',
                category: 'category-1',
                group: { name: '', uid: '' },
                order: 1,
                hidden: true,
                disabled: true,
            };

            const result = [
                {
                    is: MetaClass.primitive,
                    id,
                    inherits,
                    required,
                    defaultValue,
                    ...info,
                    group: ['', ''],
                },
            ];

            const someMeta = new Meta({
                is: MetaClass.primitive,
                id,
                inherits,
                required,
                defaultValue,
                info,
            });
            expect(someMeta.toJSON()).deep.equal(result);
        });

        it('ObjectMeta сериализуется', () => {
            const getEmptyResult = (id: string, inherits: string[] = [], other: object) => {
                return {
                    is: 'primitive',
                    required: true,
                    defaultValue: undefined,
                    id,
                    category: undefined,
                    description: undefined,
                    disabled: undefined,
                    group: undefined,
                    hidden: undefined,
                    icon: undefined,
                    order: undefined,
                    title: undefined,
                    inherits,
                    ...other,
                };
            };
            const strTypeJson = getEmptyResult('string-type-id', ['string'], []);
            const objrTypeJson = getEmptyResult('object-type-id', ['object'], {
                attributes: [['string-type-id', 'str']],
            });

            const objectType = ObjectType.id('object-type-id').attributes({
                str: StringType.id('string-type-id'),
            });
            expect(objectType.toJSON()).deep.equal([objrTypeJson, strTypeJson]);
        });

        it('Сериализуются editor', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            // @ts-ignore
            someMeta = someMeta.editor(EditorFn).designtimeEditor(NamedEditor);
            // @ts-ignore
            expect(someMeta.toJSON()[0].editor).equal(EditorFn._moduleName);
            // @ts-ignore
            expect(someMeta.toJSON()[0].designtimeEditor).equal(NamedEditor._moduleName);
        });

        it('Сериализуются editorProps', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            const props1 = { foo: 1 };
            const props2 = { bar: 2 };
            someMeta = someMeta
                // @ts-ignore
                .editor(EditorFn)
                .editorProps(props1)
                // @ts-ignore
                .designtimeEditor(NamedEditor)
                .designtimeEditorProps(props2);

            // @ts-ignore
            expect(someMeta.toJSON()[0].editorProps).equal(JSON.stringify(props1));
            // @ts-ignore
            expect(someMeta.toJSON()[0].designtimeEditorProps).equal(JSON.stringify(props2));
        });
    });
});
