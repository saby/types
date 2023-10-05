/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, assert } from 'chai';
import { Meta, MetaClass } from 'Types/_meta/baseMeta';
import {
    ObjectType,
    ArrayType,
    StringType,
    WidgetMeta,
    NullType,
    VariantType,
    RightMode,
} from 'Types/meta';
import EditorFn, { NamedEditor } from 'TypesUnit/_meta/tojson/editor';
import { getMeta as getCustomMeta, getJson as getCustomJson } from './model/custom';

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
            const meta = getCustomMeta();
            const json = getCustomJson();
            expect(json).deep.equal(meta.toJSON());
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

        it('Сериализуются editor в виде строки', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            // @ts-ignore
            someMeta = someMeta.editor(NamedEditor._moduleName);
            // @ts-ignore
            expect(someMeta.toJSON()[0].editor).equal(NamedEditor._moduleName);
        });

        it('Сериализуются designTimeEditor в виде строки', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            // @ts-ignore
            someMeta = someMeta.designtimeEditor(NamedEditor._moduleName);
            // @ts-ignore
            expect(someMeta.toJSON()[0].designtimeEditor).equal(NamedEditor._moduleName);
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
                    description: 'родитель',
                },
            });

            const ChildrenType = ParentType.title('Средний тип').id('ChildrenType');

            const result = [
                {
                    description: 'родитель',
                    is: MetaClass.primitive,
                    id: 'ChildrenType',
                    inherits: ['ParentType'],
                    required: true,
                    title: 'Средний тип',
                },
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
                attributes: [['string-type-id', 'str']],
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
                attributes: [],
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

    describe('VariantMeta', () => {
        /**
         * Автогенерированные id не должны быть указаны,
         * так как никто не может для них указанть редакторы в контексте.
         */
        it('VariantMeta сериализуется', () => {
            const strTypeJson = getEmptyResult('string-type-id', ['string'], []);
            const objTypeJson = {
                is: 'object',
                required: true,
                id: 'object-variant-id',
                inherits: ['object'],
                attributes: [['string-type-id', 'type']],
            };
            const variantTypeJson = {
                is: 'variant',
                required: true,
                id: 'variant-type-id',
                inherits: ['variant'],
                invariant: 'type',
                of: '[["object-variant-id","main"]]',
            };

            const arrayType = VariantType.id('variant-type-id').of({
                main: ObjectType.id('object-variant-id').attributes({
                    type: StringType.id('string-type-id'),
                }),
            });
            expect(arrayType.toJSON()).deep.equal([strTypeJson, objTypeJson, variantTypeJson]);
        });

        it('VariantType без типов сериализуется без ошибок', () => {
            const variantTypeJson = {
                id: 'variant-type-id',
                inherits: ['variant'],
                invariant: 'type',
                is: 'variant',
                required: true,
            };
            const emptyType = VariantType.id('variant-type-id');
            expect(emptyType.toJSON()).deep.equal([variantTypeJson]);
        });
    });

    describe('WidgetMeta', () => {
        let someMeta = new WidgetMeta();
        const accessZones = ['zone1', 'zone2'];
        const components = ['uuid-1', 'uuid-2'];
        const featureName = 'feature-name';

        someMeta = someMeta
            .id('widget-meta-id')
            .attachedStyles({
                children: {
                    field: StringType.id('children_field_type'),
                },
            })
            .attributes({
                field: StringType.id('field_type'),
            })
            .access(accessZones, RightMode.all)
            .components(components)
            .feature(featureName);

        const resultJson = {
            is: 'widget',
            required: true,
            id: 'widget-meta-id',
            inherits: [],
            attributes: [['field_type', 'field']],
            attachedStyles: JSON.stringify([['children', [['children_field_type', 'field']]]]),
            rights: JSON.stringify(accessZones),
            rightmode: RightMode.all,
            componentUUID: JSON.stringify(['uuid-1', 'uuid-2']),
            feature: JSON.stringify(featureName),
        };

        const jsonData = someMeta.toJSON();

        it('Сериализуются attachedStyle', () => {
            // @ts-ignore
            assert.deepEqual(
                jsonData[jsonData.length - 1].attachedStyles,
                resultJson.attachedStyles
            );
        });

        it('Сериализация attachedStyle не влияет на attributes', () => {
            // @ts-ignore
            assert.deepEqual(jsonData[jsonData.length - 1].attributes, resultJson.attributes);
        });

        it('Сериализация access', () => {
            // @ts-ignore
            assert.deepEqual(jsonData[jsonData.length - 1].rights, resultJson.rights);
            // @ts-ignore
            assert.deepEqual(jsonData[jsonData.length - 1].rightmode, resultJson.rightmode);
        });

        it('Сериализация components', () => {
            // @ts-ignore
            assert.deepEqual(jsonData[jsonData.length - 1].componentUUID, resultJson.componentUUID);
        });

        it('Сериализация feature', () => {
            // @ts-ignore
            assert.deepEqual(jsonData[jsonData.length - 1].feature, resultJson.feature);
        });
    });

    it('Базовые типы не присылаются', () => {
        const nullMetaArray = ArrayType.id('null-array-id').of(NullType);
        const json = nullMetaArray.toJSON();
        expect(json.length).equal(1);
        expect(json[0].id).equal('null-array-id');
    });

    it('Один и тот же тип не серилазуется дважды', () => {
        const ItemType = StringType.id('item-id');
        const metaArray = ObjectType.id('object-id').attributes({
            first: ItemType,
            second: ItemType,
        });
        const json = metaArray.toJSON();
        expect(json.length).equal(2);
    });
});
