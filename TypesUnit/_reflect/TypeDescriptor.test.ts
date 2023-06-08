import { assert } from 'chai';
import { IType, TypeDescriptor } from 'Types/reflect';

describe('Types/reflect', () => {
    let typeDescriptor: TypeDescriptor;

    beforeEach(() => {
        typeDescriptor = new TypeDescriptor();
    });

    afterEach(() => {
        typeDescriptor = null;
    });
    describe('Проверки работы с типами (добавление, получение)', () => {
        it('Добавляем и получаем тип', () => {
            const type = {
                typeId: 'typeWithInfo',
                title: 'typeWithInfo',
                description: 'typeWithInfo',
                icon: 'typeWithInfo',
                category: 'typeWithInfo',
                permissionMode: 1,
            };
            typeDescriptor.addType(type);
            assert.strictEqual(
                typeDescriptor.getMetadata('typeWithInfo', 'title'),
                type.title
            );
            assert.strictEqual(
                typeDescriptor.getMetadata('typeWithInfo', 'description'),
                type.description
            );
            assert.strictEqual(
                typeDescriptor.getMetadata('typeWithInfo', 'icon'),
                type.icon
            );
            assert.strictEqual(
                typeDescriptor.getMetadata('typeWithInfo', 'category'),
                type.category
            );
            assert.strictEqual(
                typeDescriptor.getMetadata('typeWithInfo', 'permissionMode'),
                type.permissionMode
            );
        });

        it('Получаем режим работы с зонами доступа', () => {
            typeDescriptor.addType({
                typeId: 'typeWithPermissionMode',
                permissionMode: 1,
            });
            assert.equal(
                typeDescriptor.getPermissionsMode('typeWithPermissionMode'),
                1
            );
        });

        it('Получаем ошибку, если типа нет', () => {
            assert.throws(() => {
                typeDescriptor.getMetadata('type', 'title');
            }, 'Тип с идентификатором type отсутствует');
        });

        it('Получаем ошибку, если наследуемся от несуществующего типа', () => {
            typeDescriptor.addType({
                typeId: 'type',
                extends: ['type2'],
            });
            assert.throws(() => {
                typeDescriptor.getMetadata('type', 'title');
            }, 'Для типа type отсутствует родительский тип с идентификатором type2');
        });

        it('Получаем ошибку, если пытаемся добавить существующий тип', () => {
            typeDescriptor.addType({
                typeId: 'type',
            });
            assert.throws(() => {
                typeDescriptor.addType({ typeId: 'type' });
            }, 'Тип с идентификатором type уже существует');
        });
    });

    describe('.hasType()', () => {
        it('Должна вернуть false если запросить информацию о несуществующем типе.', () => {
            assert.isFalse(typeDescriptor.hasType('nonexistentType'));
        });
        it('Должна вернуть true если запросить информацию о существующем типе.', () => {
            typeDescriptor.addType({ typeId: 'type' });
            assert.isTrue(typeDescriptor.hasType('type'));
        });
    });

    describe('Source', () => {
        beforeEach(() => {
            typeDescriptor.addType({
                typeId: 'typeWithSource',
                source: {
                    key: {
                        reference: 'template',
                        arguments: { prop: 'prop' },
                    },
                },
            });
        });
        it('Получаем путь до конструктора или функции, который создает объект этого типа', () => {
            assert.equal(
                typeDescriptor.getSource('typeWithSource', 'key'),
                'template'
            );
        });
        it('Получаем путь до конструктора или функции, который создает объект этого типа с наследованием', () => {
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key2: {
                        reference: 'template2',
                    },
                },
                extends: ['typeWithSource'],
            });
            assert.equal(
                typeDescriptor.getSource('typeWithSource2', 'key'),
                'template'
            );
            assert.equal(
                typeDescriptor.getSource('typeWithSource2', 'key2'),
                'template2'
            );
        });
        it('Получаем путь до конструктора или функции, который создает объект этого типа с множественным наследованием', () => {
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key2: {
                        reference: 'template2',
                    },
                },
            });
            typeDescriptor.addType({
                typeId: 'typeWithSource3',
                extends: ['typeWithSource', 'typeWithSource2'],
            });
            assert.equal(
                typeDescriptor.getSource('typeWithSource3', 'key'),
                'template'
            );
            assert.equal(
                typeDescriptor.getSource('typeWithSource3', 'key2'),
                'template2'
            );
        });
        it('Получаем аргументы для конструктора или функции, переданные в reference', () => {
            assert.deepEqual(
                typeDescriptor.getSourceArguments('typeWithSource', 'key'),
                { prop: 'prop' }
            );
        });
        it('Получаем аргументы для конструктора или функции, переданные в reference с наследованием', () => {
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key2: {
                        reference: 'template',
                        arguments: { prop2: 'prop2' },
                    },
                },
                extends: ['typeWithSource'],
            });
            assert.deepEqual(
                typeDescriptor.getSourceArguments('typeWithSource2', 'key'),
                { prop: 'prop' }
            );
            assert.deepEqual(
                typeDescriptor.getSourceArguments('typeWithSource2', 'key2'),
                { prop2: 'prop2' }
            );
        });
        it('Получаем аргументы для конструктора или функции, переданные в reference с множественным наследованием', () => {
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key2: {
                        reference: 'template',
                        arguments: { prop2: 'prop2' },
                    },
                },
            });
            typeDescriptor.addType({
                typeId: 'typeWithSource3',
                extends: ['typeWithSource', 'typeWithSource2'],
            });
            assert.deepEqual(
                typeDescriptor.getSourceArguments('typeWithSource3', 'key'),
                { prop: 'prop' }
            );
            assert.deepEqual(
                typeDescriptor.getSourceArguments('typeWithSource3', 'key2'),
                { prop2: 'prop2' }
            );
        });

        it('Проверяем, что объекты в source корректно объединяются.', () => {
            const newArgs = { new: 'new' };
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key: {
                        arguments: newArgs,
                    },
                },
                extends: ['typeWithSource'],
            });
            assert.equal(
                typeDescriptor.getSource('typeWithSource2', 'key'),
                'template'
            );
            assert.equal(
                typeDescriptor.getSourceArguments('typeWithSource2', 'key'),
                newArgs
            );
        });
    });

    describe('getMetadata', () => {
        it('getMetadata', () => {
            const type: IType = {
                typeId: 'SimpleType',
                title: 'Type title',
                description: 'Type description',
                category: 'Type category',
                icon: 'Type icon',
                permissions: ['permission'],
                permissionMode: 1,
                meta: {
                    metaData: 'Some meta',
                },
            };

            typeDescriptor.addType(type);
            const assertMeta = (name: string, value: unknown) => {
                assert.strictEqual(
                    typeDescriptor.getMetadata('SimpleType', name),
                    value
                );
            };
            assertMeta('title', type.title);
            assertMeta('description', type.description);
            assertMeta('category', type.category);
            assertMeta('icon', type.icon);
            assertMeta('permissions', type.permissions);
            assertMeta('permissionMode', type.permissionMode);
            assertMeta('metaData', type.meta.metaData);
        });
    });

    describe('getPropertyMetadata', () => {
        it('getPropertyMetadata', () => {
            const type: IType = {
                typeId: 'SimpleType',
                properties: {
                    textProperty: {
                        type: 'string',
                        order: 0,
                        defaultValue: 'value',
                        propertyDescription: {
                            title: 'Property title',
                            description: 'Property description',
                            category: 'Property category',
                            icon: 'Property icon',
                            meta: {
                                metaData: 'Some meta',
                            },
                        },
                    },
                },
            };
            typeDescriptor.addType(type);
            const assertPropertyMeta = (name: string, value: unknown) => {
                assert.strictEqual(
                    typeDescriptor.getPropertyMetadata(
                        'SimpleType',
                        'textProperty',
                        name
                    ),
                    value
                );
            };
            const property = type.properties.textProperty;
            assertPropertyMeta('title', property.propertyDescription.title);
            assertPropertyMeta(
                'description',
                property.propertyDescription.description
            );
            assertPropertyMeta(
                'category',
                property.propertyDescription.category
            );
            assertPropertyMeta('icon', property.propertyDescription.icon);
            assertPropertyMeta(
                'metaData',
                property.propertyDescription.meta.metaData
            );
            assertPropertyMeta('defaultValue', property.defaultValue);
        });
    });

    describe('getPropertyType', () => {
        it('getPropertyType', () => {
            const type: IType = {
                typeId: 'SimpleType',
                properties: {
                    textProperty: {
                        type: 'string',
                        order: 0,
                    },
                },
            };
            typeDescriptor.addType(type);
            assert.strictEqual(
                typeDescriptor.getPropertyType('SimpleType', 'textProperty'),
                type.properties.textProperty.type
            );
        });
    });

    describe('Properties', () => {
        it('Получаем набор свойств', () => {
            typeDescriptor.addType({
                typeId: 'typeWithProperties',
                properties: {
                    name: {
                        type: 'type',
                        order: 1,
                    },
                },
            });
            assert.deepEqual(
                typeDescriptor.getProperties('typeWithProperties'),
                { name: { type: 'type', order: 1 } }
            );
        });
        it('Получаем набор свойств с наследованием', () => {
            typeDescriptor.addType({
                typeId: 'typeWithProperties',
                properties: {
                    name: {
                        type: 'type',
                        order: 1,
                    },
                },
            });
            typeDescriptor.addType({
                typeId: 'typeWithProperties2',
                properties: {
                    name2: {
                        type: 'type2',
                        order: 1,
                    },
                },
                extends: ['typeWithProperties'],
            });
            const expected = {
                name: {
                    order: 1,
                    type: 'type',
                },
                name2: {
                    order: 1,
                    type: 'type2',
                },
            };
            assert.deepEqual(
                typeDescriptor.getProperties('typeWithProperties2'),
                expected
            );
        });
        it('Получаем набор свойств', () => {
            typeDescriptor.addType({
                typeId: 'typeWithProperties',
                properties: {
                    name: {
                        type: 'type',
                        order: 1,
                    },
                },
            });
            typeDescriptor.addType({
                typeId: 'typeWithProperties2',
                properties: {
                    name2: {
                        type: 'type2',
                        order: 1,
                    },
                },
            });
            typeDescriptor.addType({
                typeId: 'typeWithProperties3',
                properties: {
                    name3: {
                        type: 'type3',
                        order: 1,
                    },
                },
                extends: ['typeWithProperties', 'typeWithProperties2'],
            });
            const expected = {
                name: {
                    type: 'type',
                    order: 1,
                },
                name2: {
                    type: 'type2',
                    order: 1,
                },
                name3: {
                    type: 'type3',
                    order: 1,
                },
            };
            assert.deepEqual(
                typeDescriptor.getProperties('typeWithProperties3'),
                expected
            );
        });
        it('Получаем набор свойств отсортированным массивом', () => {
            typeDescriptor.addType({
                typeId: 'typeWithProperties',
                properties: {
                    name: {
                        type: 'type',
                        order: 2,
                    },
                    name2: {
                        type: 'type2',
                        order: 1,
                    },
                },
            });
            const expected = [
                { name: 'name2', type: 'type2', order: 1 },
                { name: 'name', type: 'type', order: 2 },
            ];
            assert.deepEqual(
                typeDescriptor.getPropertiesArray('typeWithProperties'),
                expected
            );
        });
        it('Если несоответствуют типы у свойств с одинаковыми именами, то получаем ошибку', () => {
            typeDescriptor.addType({
                typeId: 'typeWithProperties',
                properties: {
                    name: {
                        type: 'type',
                        order: 1,
                    },
                },
            });
            typeDescriptor.addType({
                typeId: 'typeWithProperties2',
                properties: {
                    name: {
                        type: 'type2',
                        order: 1,
                    },
                },
                extends: ['typeWithProperties'],
            });
            assert.throws(() => {
                typeDescriptor.getProperties('typeWithProperties2');
            }, 'Не соответствуют типы для свойства с именем type в properties типа и родителя');
        });
    });
    describe('Permissions', () => {
        it('Получаем массив зон доступа', () => {
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            assert.deepEqual(
                typeDescriptor.getPermissions('typeWithPermissions'),
                ['permission']
            );
        });
        it('Получаем массив зон доступа с наследованием', () => {
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            typeDescriptor.addType({
                typeId: 'typeWithPermissions2',
                permissions: ['permission2'],
                extends: ['typeWithPermissions'],
            });
            assert.deepEqual(
                typeDescriptor.getPermissions('typeWithPermissions2'),
                ['permission2', 'permission']
            );
        });
        it('Получаем массив зон доступа с множественным наследованием', () => {
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            typeDescriptor.addType({
                typeId: 'typeWithPermissions2',
                permissions: ['permission2'],
            });
            typeDescriptor.addType({
                typeId: 'typeWithPermissions3',
                permissions: ['permission3'],
                extends: ['typeWithPermissions', 'typeWithPermissions2'],
            });
            assert.deepEqual(
                typeDescriptor.getPermissions('typeWithPermissions3'),
                ['permission3', 'permission', 'permission2']
            );
        });
        it('Получаем массив зон доступа с наследованием, зоны доступа должны быть уникальными', () => {
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            typeDescriptor.addType({
                typeId: 'typeWithPermissions2',
                permissions: ['permission'],
                extends: ['typeWithPermissions'],
            });
            assert.deepEqual(
                typeDescriptor.getPermissions('typeWithPermissions2'),
                ['permission']
            );
        });
    });
});
