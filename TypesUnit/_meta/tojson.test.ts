/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, assert } from 'chai';
import { Meta, MetaClass } from 'Types/_meta/baseMeta';
import { ObjectType, ArrayType, StringType, WidgetMeta, NullType } from 'Types/meta';
import EditorFn, { NamedEditor } from 'TypesUnit/_meta/tojson/editor';

const getEmptyResult = (id: string, inherits: string[] = [], other: object) => {
    return {
        is: 'primitive',
        required: true,
        id,
        inherits,
        ...other,
    };
};

describe('Types/_meta/marshaling', () => {
    describe('Meta', () => {
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
                    defaultValue: JSON.stringify(defaultValue),
                    ...info,
                    group: JSON.stringify(['', '']),
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

        it('Сериализуются sampleData', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            const sample = { foo: 'bar' };
            // @ts-ignore
            someMeta = someMeta.sampleData(sample);
            // @ts-ignore
            assert.deepEqual(someMeta.toJSON()[0].sampleData, JSON.stringify({ d: sample }));

            const importPath = 'Foo/Bar';
            someMeta = someMeta.sampleDataImport(importPath);
            // @ts-ignore
            assert.deepEqual(someMeta.toJSON()[0].sampleData, JSON.stringify({ i: importPath }));
        });
        /**
         * Автогенерированные id не должны быть указаны,
         * так как никто не может для них указанть редакторы в контексте.
         */
        it('Автогенерируемые id не указаны в inherits', () => {
            const ParentType = new Meta<never>({
                is: MetaClass.primitive,
                id: 'ParentType',
                info: {
                    description: 'родитель'
                }
            });

            const ChildrenType = ParentType
                .title('Средний тип')
                .id('ChildrenType');

            const result = [
                {
                    description: 'родитель',
                    is: MetaClass.primitive,
                    id: 'ChildrenType',
                    inherits: ['ParentType'],
                    required: true,
                    title: 'Средний тип',

                }
            ];
            expect(ChildrenType.toJSON()).deep.equal(result);
        });
    });

    describe('ObjectMeta', () => {
        it('Сериализация', () => {
            const strTypeJson = getEmptyResult('string-type-id', ['string'], []);
            const objTypeJson = {
                is: 'object',
                required: true,
                id: 'object-type-id',
                inherits: ['object'],
                attributes: [['string-type-id', 'str']]
            };

            const objectType = ObjectType.id('object-type-id').attributes({
                str: StringType.id('string-type-id'),
            });
            expect(objectType.toJSON()).deep.equal([strTypeJson, objTypeJson]);
        });

        it('Пустые attributes сериализуются', () => {
            const objTypeJson = {
                is: 'object',
                required: true,
                id: 'object-type-id',
                inherits: ['object'],
                attributes: []
            };

            const objectType = ObjectType.id('object-type-id');
            expect(objectType.toJSON()).deep.equal([objTypeJson]);
        });
    });

    describe('ArrayMeta', () => {
        /**
        * Автогенерированные id не должны быть указаны,
        * так как никто не может для них указанть редакторы в контексте.
        */
        it('ArrayMeta сериализуется', () => {
            const strTypeJson = getEmptyResult('string-type-id', ['string'], []);
            const arrTypeJson = {
                is: 'array',
                required: true,
                id: 'array-type-id',
                inherits: ['array'],
                arrayOf: 'string-type-id',
            };

            const arrayType = ArrayType.id('array-type-id').of(StringType.id('string-type-id'));
            expect(arrayType.toJSON()).deep.equal([strTypeJson, arrTypeJson]);
        });
    });

    describe('WidgetMeta', () => {
        let someMeta = new WidgetMeta();

        someMeta = someMeta.id('widget-meta-id').attachedStyles({
            children: {
                field: StringType.id('children_field_type')
            }
        }).attributes({
            field: StringType.id('field_type')
        });

        const resultJson = {
            is: 'widget',
            required: true,
            id: 'widget-meta-id',
            inherits: [],
            attributes: [
                ['field_type', 'field']
            ],
            attachedStyles: [
                ['children', [
                    ['children_field_type', 'field']
                ]]
            ]
        };

        const jsonData = someMeta.toJSON();

        it('Сериализуются attachedStyle', () => {
            // @ts-ignore
            assert.deepEqual(jsonData[jsonData.length - 1].attachedStyles, JSON.stringify(resultJson.attachedStyles));
        });

        it('Сериализация attachedStyle не влияет на attributes', () => {
            // @ts-ignore
            assert.deepEqual(jsonData[jsonData.length - 1].attributes, resultJson.attributes);
        });
    });

    it('Базовые типы не присылаются', () => {
        const nullMetaArray = ArrayType.id('null-array-id').of(NullType);
        const json = nullMetaArray.toJSON();
        expect(json.length).equal(1);
        expect(json[0].id).equal('null-array-id');
    });
});
