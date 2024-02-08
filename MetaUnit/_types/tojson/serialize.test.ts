/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect, assert } from 'chai';
import { RecordSet } from 'Types/collection';
import { Meta, MetaClass } from 'Meta/_types/baseMeta';
import {
    ObjectType,
    ArrayType,
    StringType,
    WidgetMeta,
    BooleanType,
    NullType,
    VariantType,
    RightMode,
} from 'Meta/types';
import EditorFn, { NamedEditor } from 'MetaUnit/_types/tojson/editor';
import {
    getMeta as getCustomMeta,
    getJson as getCustomJson,
    getMetaWithRecordSet,
} from './model/custom';
import { SERIALIZED_KEY, TYPE } from 'Types/_serializer/Types';

const getEmptyResult = (id: string, inherits: string[] = [], other: object) => {
    return {
        is: 'primitive',
        required: true,
        id,
        inherits,
        ...other,
    };
};

describe('Meta/_types/marshaling', () => {
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

        it('Сериализуется RecordSet', () => {
            const recordSet = new RecordSet({
                keyProperty: 'id',
                rawData: [
                    {
                        id: '0',
                        caption: 'Zero',
                    },
                    {
                        id: '1',
                        caption: 'Two',
                    },
                ],
            });
            // @ts-ignore
            const recordSetModuleName = recordSet._moduleName;

            // Два равных по ссылке инстанса RecordSet.
            const metaWithRecordSet = getMetaWithRecordSet([recordSet, recordSet]);
            const actualProps = metaWithRecordSet.toJSON()[0].editorProps;
            const actualPropsObject = JSON.parse(actualProps);

            // Сериализовался как инстанс RecordSet.
            const item0 = actualPropsObject.items[0];
            expect(item0[SERIALIZED_KEY]).equal(TYPE.INST);
            expect(item0.module).equal(recordSetModuleName);

            // Сериализовался как ссылка на предыдущий RecordSet.
            const item1 = actualPropsObject.items[1];
            expect(item1[SERIALIZED_KEY]).equal(TYPE.LINK);
            expect(item1.module).equal(undefined);

            expect(item0.id).equal(item1.id);
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

        it('Серилизуется с пустым AttachedAttributes', () => {
            const wt = new WidgetMeta()
                .id('SabyGetBill/Constructor/Widgets/Header')
                .category('Шапка')
                .title('Шапка')
                .description('Виджет шапки счета')
                .attributes({
                    showLogo: BooleanType.title('Логотип').order(0),
                    showName: BooleanType.title('Название').order(1),
                })
                .editor('SabyGetBill/Constructor/Editors/Header')
                .relatedObjects(['SabyGetBill']);

            // eslint-disable-next-line dot-notation, @typescript-eslint/no-unused-expressions
            expect(wt.toJSON()['attachedAttributes']).to.be.undefined;
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