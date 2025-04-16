/* eslint-disable @typescript-eslint/ban-ts-comment */
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
    EnumType,
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
        test('Meta сериализуется', () => {
            const meta = getCustomMeta();
            const json = getCustomJson();
            expect(json).toEqual(meta.saveMeta());
        });

        test('Сериализуются editor', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            // @ts-ignore
            someMeta = someMeta.editor(EditorFn).designtimeEditor(NamedEditor);
            // @ts-ignore
            expect(someMeta.saveMeta()[0].editor).toEqual(EditorFn._moduleName);
            // @ts-ignore
            expect(someMeta.saveMeta()[0].designtimeEditor).toEqual(NamedEditor._moduleName);
        });

        test('Сериализуются editorProps', () => {
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
            expect(someMeta.saveMeta()[0].editorProps).toEqual(JSON.stringify(props1));
            // @ts-ignore
            expect(someMeta.saveMeta()[0].designtimeEditorProps).toEqual(JSON.stringify(props2));
        });

        test('Сериализуются editor в виде строки', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            // @ts-ignore
            someMeta = someMeta.editor(NamedEditor._moduleName);
            // @ts-ignore
            expect(someMeta.saveMeta()[0].editor).toEqual(NamedEditor._moduleName);
        });

        test('Сериализуется RecordSet', () => {
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
            //@ts-ignore
            const actualProps = metaWithRecordSet.saveMeta()[0].editorProps;
            const actualPropsObject = JSON.parse(actualProps);

            // Сериализовался как инстанс RecordSet.
            const item0 = actualPropsObject.items[0];
            expect(item0[SERIALIZED_KEY]).toEqual(TYPE.INST);
            expect(item0.module).toEqual(recordSetModuleName);

            // Сериализовался как ссылка на предыдущий RecordSet.
            const item1 = actualPropsObject.items[1];
            expect(item1[SERIALIZED_KEY]).toEqual(TYPE.LINK);
            expect(item1.module).toBeUndefined();

            expect(item0.id).toEqual(item1.id);
        });

        test('Сериализуются designTimeEditor в виде строки', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            // @ts-ignore
            someMeta = someMeta.designtimeEditor(NamedEditor._moduleName);
            // @ts-ignore
            expect(someMeta.saveMeta()[0].designtimeEditor).toEqual(NamedEditor._moduleName);
        });

        test('Сериализуются sampleData', () => {
            let someMeta = new Meta({
                is: MetaClass.primitive,
            });
            const sample = { foo: 'bar' };
            // @ts-ignore
            someMeta = someMeta.sampleData(sample);
            // @ts-ignore
            expect(someMeta.saveMeta()[0].sampleData).toEqual(JSON.stringify({ data: sample }));

            const importPath = 'Foo/Bar';
            someMeta = someMeta.sampleDataImport(importPath);
            // @ts-ignore
            expect(someMeta.saveMeta()[0].sampleData).toEqual(JSON.stringify({ importPath }));
        });
        /**
         * Автогенерированные id не должны быть указаны,
         * так как никто не может для них указанть редакторы в контексте.
         */
        test('Автогенерируемые id не указаны в inherits', () => {
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
            expect(ChildrenType.saveMeta()).toEqual(result);
        });
    });

    describe('ObjectMeta', () => {
        test('Сериализация', () => {
            const strTypeJson = getEmptyResult('string-type-id', ['string'], []);
            const objTypeJson = {
                is: 'object',
                required: true,
                id: 'object-type-id',
                inherits: ['object'],
                properties: [['string-type-id', 'str']],
                attributes: [['string-type-id', 'str']],
            };

            const objectType = ObjectType.id('object-type-id').properties({
                str: StringType.id('string-type-id'),
            });
            expect(objectType.saveMeta()).toEqual([strTypeJson, objTypeJson]);
        });

        test('Пустые properties сериализуются', () => {
            const objTypeJson = {
                is: 'object',
                required: true,
                id: 'object-type-id',
                inherits: ['object'],
                properties: [],
                attributes: [],
            };

            const objectType = ObjectType.id('object-type-id');
            expect(objectType.saveMeta()).toEqual([objTypeJson]);
        });
    });

    describe('ArrayMeta', () => {
        /**
         * Автогенерированные id не должны быть указаны,
         * так как никто не может для них указанть редакторы в контексте.
         */
        test('ArrayMeta сериализуется', () => {
            const strTypeJson = getEmptyResult('string-type-id', ['string'], []);
            const arrTypeJson = {
                is: 'array',
                required: true,
                id: 'array-type-id',
                inherits: ['array'],
                arrayOf: 'string-type-id',
            };

            const arrayType = ArrayType.id('array-type-id').of(StringType.id('string-type-id'));
            expect(arrayType.saveMeta()).toEqual([strTypeJson, arrTypeJson]);
        });
    });

    describe('VariantMeta', () => {
        /**
         * Автогенерированные id не должны быть указаны,
         * так как никто не может для них указанть редакторы в контексте.
         */
        test('VariantMeta сериализуется', () => {
            const strTypeJson = getEmptyResult('string-type-id', ['string'], []);
            const objTypeJson = {
                is: 'object',
                required: true,
                id: 'object-variant-id',
                inherits: ['object'],
                properties: [['string-type-id', 'type']],
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
                main: ObjectType.id('object-variant-id').properties({
                    type: StringType.id('string-type-id'),
                }),
            });
            expect(arrayType.saveMeta()).toEqual([strTypeJson, objTypeJson, variantTypeJson]);
        });

        test('VariantType без типов сериализуется без ошибок', () => {
            const variantTypeJson = {
                id: 'variant-type-id',
                inherits: ['variant'],
                invariant: 'type',
                is: 'variant',
                required: true,
            };
            const emptyType = VariantType.id('variant-type-id');
            expect(emptyType.saveMeta()).toEqual([variantTypeJson]);
        });
    });

    describe('WidgetMeta', () => {
        let someMeta = new WidgetMeta();
        const accessZones = ['zone1', 'zone2'];
        const components = ['uuid-1', 'uuid-2'];
        const featureName = 'feature-name';

        //@ts-ignore
        someMeta = someMeta
            .id('widget-meta-id')
            .attachedStyles({
                children: {
                    field: StringType.id('children_field_type'),
                },
            })
            .properties({
                field: StringType.id('field_type'),
            })
            .access(accessZones, RightMode.all)
            .components(components)
            .feature(featureName)
            .designtimeEditor('widget-meta-id/designtime', {}, true);

        const resultJson = {
            is: 'widget',
            required: true,
            id: 'widget-meta-id',
            inherits: [],
            properties: [['field_type', 'field']],
            attachedStyles: JSON.stringify([['children', [['children_field_type', 'field']]]]),
            rights: JSON.stringify(accessZones),
            rightmode: RightMode.all,
            componentUUID: JSON.stringify(['uuid-1', 'uuid-2']),
            feature: JSON.stringify(featureName),
            designtimeEditor: 'widget-meta-id/designtime',
            designtimeEditorProps: '{}',
            designEditorAS: true,
        };

        const jsonData = someMeta.saveMeta();

        test('Сериализуются attachedStyle', () => {
            // @ts-ignore
            expect(jsonData[jsonData.length - 1].attachedStyles).toEqual(resultJson.attachedStyles);
        });

        test('Сериализация attachedStyle не влияет на properties', () => {
            // @ts-ignore
            expect(jsonData[jsonData.length - 1].properties).toEqual(resultJson.properties);
        });

        test('Сериализация access', () => {
            // @ts-ignore
            expect(jsonData[jsonData.length - 1].rights).toEqual(resultJson.rights);
            // @ts-ignore
            expect(jsonData[jsonData.length - 1].rightmode).toEqual(resultJson.rightmode);
        });

        test('Сериализация components', () => {
            // @ts-ignore
            expect(jsonData[jsonData.length - 1].componentUUID).toEqual(resultJson.componentUUID);
        });

        test('Сериализация feature', () => {
            // @ts-ignore
            expect(jsonData[jsonData.length - 1].feature).toEqual(resultJson.feature);
        });

        test('Серилизуется с пустым AttachedAttributes', () => {
            const wt = new WidgetMeta()
                .id('SabyGetBill/Constructor/Widgets/Header')
                .category('Шапка')
                .title('Шапка')
                .description('Виджет шапки счета')
                .properties({
                    showLogo: BooleanType.title('Логотип').order(0),
                    showName: BooleanType.title('Название').order(1),
                })
                .editor('SabyGetBill/Constructor/Editors/Header')
                .relatedObjects(['SabyGetBill']);

            //@ts-ignore
            // eslint-disable-next-line dot-notation, @typescript-eslint/no-unused-expressions
            expect(wt.saveMeta()['attachedAttributes']).toBeUndefined();
        });

        test('Серилизуется isAlwaysShow', () => {
            // @ts-ignore
            expect(jsonData[jsonData.length - 1].designEditorAS).toEqual(resultJson.designEditorAS);
        });
    });

    describe('WidgetMetaNew', () => {
        let someMeta = new WidgetMeta();
        const IDashboardColorsType = ObjectType.id('IDashboardColorsType.colors');
        const IDashboardEmptyVisibleType = ObjectType.id('IDashboardEmptyVisibleType');

        //@ts-ignore
        someMeta = someMeta
            .id('ProjectManagement/Projectsw/Widgets/projectList:Widget')
            .components(['f14949a6-250e-4a18-83a4-eba9f7e97648'])
            .required()
            .title('Проекты')
            .category('Аккаунт и расширения')
            .defaultValue({
                colors: { marker: 'brand', background: 'default', title: 'default' },
                headingVisible: true,
                headingSize: 'l',
                heightMode: 'limited',
                height: 272,
                emptyHidden: false,
            })
            .description('Виджет списка проектов по сотруднику')
            .designtimeEditor({
                //@ts-ignore
                minHeight: 250,
                minWidth: 311,
                maxWidth: '$u',
                headerVisible: '$u',
                padding: '$u',
                _moduleName: 'Dashboard/new/dashboardEditor:WidgetEditor',
            })
            .properties({
                //@ts-ignore
                colors: IDashboardColorsType,
                //@ts-ignore
                emptyHidden: IDashboardEmptyVisibleType,
                size: EnumType.id('ISizeEnumType')
                    .title('Размер виджета')
                    .elements([
                        StringType.id('s').title('Маленький'),
                        StringType.id('m').title('Средний'),
                        StringType.id('l').title('Большой'),
                    ]),
            })
            .feature('person_widgets_card')
            .group('testUid', 'testName');

        const resultJson = {
            id: 'ProjectManagement/Projectsw/Widgets/projectList:Widget',
            metatype: 'widget',
            inherits: [''],
            metaattributes: {
                keywords: '[]',
                roles: '[]',
                rightmode: 0,
                required: true,
                title: 'Проекты',
                category: 'Аккаунт и расширения',
                componentUUID: '["f14949a6-250e-4a18-83a4-eba9f7e97648"]',
                defaultValue:
                    '{"colors":{"marker":"brand","background":"default","title":"default"},"headingVisible":true,"headingSize":"l","heightMode":"limited","height":272,"emptyHidden":false}',
                description: 'Виджет списка проектов по сотруднику',
                icon: 'icon-Widget',
                designtimeEditor: 'Dashboard/new/dashboardEditor:WidgetEditor',
                designtimeEditorProps:
                    '{"minHeight":250,"minWidth":311,"maxWidth":"$u","headerVisible":"$u","padding":"$u"}',
                feature: 'person_widgets_card',
                group: '["testUid","testName"]',
            },
            properties: [
                {
                    name: 'colors',
                    type: 'IDashboardColorsType.colors',
                },
                {
                    name: 'emptyHidden',
                    type: 'IDashboardEmptyVisibleType',
                },
                {
                    name: 'size',
                    type: 'ISizeEnumType',
                },
            ],
        };

        const jsonData = someMeta.saveMeta(true);

        test('Сериализуются в новом формате', () => {
            // @ts-ignore
            expect(jsonData[3]).toEqual(resultJson);
        });

        test('Метатип EnumType сериализуется', () => {
            const serializedEnum = {
                metatype: 'enum',
                id: 'ISizeEnumType',
                properties: [],
                inherits: ['enum'],
                metaattributes: {
                    required: true,
                    title: 'Размер виджета',
                    invariant: 'type',
                },
            };
            expect(jsonData[2]).toEqual(serializedEnum);
        });
    });

    test('Базовые типы не присылаются', () => {
        const nullMetaArray = ArrayType.id('null-array-id').of(NullType);
        const json = nullMetaArray.saveMeta();
        expect(json.length).toEqual(1);
        expect(json[0].id).toEqual('null-array-id');
    });

    test('Один и тот же тип не серилазуется дважды', () => {
        const ItemType = StringType.id('item-id');
        const metaArray = ObjectType.id('object-id').properties({
            first: ItemType,
            second: ItemType,
        });
        const json = metaArray.saveMeta();
        expect(json.length).toEqual(2);
    });
});
