import { IType, TypeDescriptor } from 'Types/reflect';

describe('Types/reflect', () => {
    let typeDescriptor: TypeDescriptor;

    beforeEach(() => {
        typeDescriptor = new TypeDescriptor();
    });

    describe('Проверки работы с типами (добавление, получение)', () => {
        test('Добавляем и получаем тип', () => {
            const type = {
                typeId: 'typeWithInfo',
                title: 'typeWithInfo',
                description: 'typeWithInfo',
                icon: 'typeWithInfo',
                category: 'typeWithInfo',
                permissionMode: 1,
            };
            //@ts-ignore
            typeDescriptor.addType(type);
            expect(typeDescriptor.getMetadata('typeWithInfo', 'title')).toBe(type.title);
            expect(typeDescriptor.getMetadata('typeWithInfo', 'description')).toBe(
                type.description
            );
            expect(typeDescriptor.getMetadata('typeWithInfo', 'icon')).toBe(type.icon);
            expect(typeDescriptor.getMetadata('typeWithInfo', 'category')).toBe(type.category);
            expect(typeDescriptor.getMetadata('typeWithInfo', 'permissionMode')).toBe(
                type.permissionMode
            );
        });

        test('Получаем режим работы с зонами доступа', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissionMode',
                permissionMode: 1,
            });
            expect(typeDescriptor.getPermissionsMode('typeWithPermissionMode')).toEqual(1);
        });

        test('Получаем ошибку, если типа нет', () => {
            expect(() => {
                typeDescriptor.getMetadata('type', 'title');
            }).toThrow();
        });

        test('Получаем ошибку, если наследуемся от несуществующего типа', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'type',
                extends: ['type2'],
            });
            expect(() => {
                typeDescriptor.getMetadata('type', 'title');
            }).toThrow();
        });

        test('Получаем ошибку, если пытаемся добавить существующий тип', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'type',
            });
            expect(() => {
                //@ts-ignore
                typeDescriptor.addType({ typeId: 'type' });
            }).toThrow();
        });
    });

    describe('.hasType()', () => {
        test('Должна вернуть false если запросить информацию о несуществующем типе.', () => {
            expect(typeDescriptor.hasType('nonexistentType')).toBe(false);
        });
        test('Должна вернуть true если запросить информацию о существующем типе.', () => {
            //@ts-ignore
            typeDescriptor.addType({ typeId: 'type' });
            expect(typeDescriptor.hasType('type')).toBe(true);
        });
    });

    describe('Source', () => {
        beforeEach(() => {
            //@ts-ignore
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
        test('Получаем путь до конструктора или функции, который создает объект этого типа', () => {
            expect(typeDescriptor.getSource('typeWithSource', 'key')).toEqual('template');
        });
        test('Получаем путь до конструктора или функции, который создает объект этого типа с наследованием', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key2: {
                        reference: 'template2',
                    },
                },
                extends: ['typeWithSource'],
            });
            expect(typeDescriptor.getSource('typeWithSource2', 'key')).toEqual('template');
            expect(typeDescriptor.getSource('typeWithSource2', 'key2')).toEqual('template2');
        });
        test('Получаем путь до конструктора или функции, который создает объект этого типа с множественным наследованием', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key2: {
                        reference: 'template2',
                    },
                },
            });
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithSource3',
                extends: ['typeWithSource', 'typeWithSource2'],
            });
            expect(typeDescriptor.getSource('typeWithSource3', 'key')).toEqual('template');
            expect(typeDescriptor.getSource('typeWithSource3', 'key2')).toEqual('template2');
        });
        test('Получаем аргументы для конструктора или функции, переданные в reference', () => {
            expect(typeDescriptor.getSourceArguments('typeWithSource', 'key')).toEqual({
                prop: 'prop',
            });
        });
        test('Получаем аргументы для конструктора или функции, переданные в reference с наследованием', () => {
            //@ts-ignore
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
            expect(typeDescriptor.getSourceArguments('typeWithSource2', 'key')).toEqual({
                prop: 'prop',
            });
            expect(typeDescriptor.getSourceArguments('typeWithSource2', 'key2')).toEqual({
                prop2: 'prop2',
            });
        });
        test('Получаем аргументы для конструктора или функции, переданные в reference с множественным наследованием', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key2: {
                        reference: 'template',
                        arguments: { prop2: 'prop2' },
                    },
                },
            });
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithSource3',
                extends: ['typeWithSource', 'typeWithSource2'],
            });
            expect(typeDescriptor.getSourceArguments('typeWithSource3', 'key')).toEqual({
                prop: 'prop',
            });
            expect(typeDescriptor.getSourceArguments('typeWithSource3', 'key2')).toEqual({
                prop2: 'prop2',
            });
        });

        test('Проверяем, что объекты в source корректно объединяются.', () => {
            const newArgs = { new: 'new' };
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithSource2',
                source: {
                    key: {
                        arguments: newArgs,
                    },
                },
                extends: ['typeWithSource'],
            });
            expect(typeDescriptor.getSource('typeWithSource2', 'key')).toEqual('template');
            expect(typeDescriptor.getSourceArguments('typeWithSource2', 'key')).toEqual(newArgs);
        });
    });

    describe('getMetadata', () => {
        test('getMetadata', () => {
            //@ts-ignore
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
                expect(typeDescriptor.getMetadata('SimpleType', name)).toBe(value);
            };
            assertMeta('title', type.title);
            assertMeta('description', type.description);
            assertMeta('category', type.category);
            assertMeta('icon', type.icon);
            assertMeta('permissions', type.permissions);
            assertMeta('permissionMode', type.permissionMode);
            //@ts-ignore
            assertMeta('metaData', type.meta.metaData);
        });
    });

    describe('getPropertyMetadata', () => {
        test('getPropertyMetadata', () => {
            const type: IType = {
                typeId: 'SimpleType',
                properties: {
                    textProperty: {
                        type: 'string',
                        order: 0,
                        defaultValue: 'value',
                        //@ts-ignore
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
                expect(typeDescriptor.getPropertyMetadata('SimpleType', 'textProperty', name)).toBe(
                    value
                );
            };
            const property = type.properties.textProperty;
            assertPropertyMeta('title', property.propertyDescription?.title);
            assertPropertyMeta('description', property.propertyDescription?.description);
            assertPropertyMeta('category', property.propertyDescription?.category);
            assertPropertyMeta('icon', property.propertyDescription?.icon);
            assertPropertyMeta('metaData', property.propertyDescription?.meta?.metaData);
            assertPropertyMeta('defaultValue', property.defaultValue);
        });
    });

    describe('getPropertyType', () => {
        test('getPropertyType', () => {
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
            expect(typeDescriptor.getPropertyType('SimpleType', 'textProperty')).toBe(
                type.properties.textProperty.type
            );
        });
    });

    describe('Properties', () => {
        test('Получаем набор свойств', () => {
            typeDescriptor.addType({
                typeId: 'typeWithProperties',
                properties: {
                    name: {
                        type: 'type',
                        order: 1,
                    },
                },
            });
            expect(typeDescriptor.getProperties('typeWithProperties')).toEqual({
                name: { type: 'type', order: 1 },
            });
        });
        test('Получаем набор свойств с наследованием', () => {
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
            expect(typeDescriptor.getProperties('typeWithProperties2')).toEqual(expected);
        });
        test('Получаем набор свойств', () => {
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
            expect(typeDescriptor.getProperties('typeWithProperties3')).toEqual(expected);
        });
        test('Получаем набор свойств отсортированным массивом', () => {
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
            expect(typeDescriptor.getPropertiesArray('typeWithProperties')).toEqual(expected);
        });
        test('Если несоответствуют типы у свойств с одинаковыми именами, то получаем ошибку', () => {
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
            expect(() => {
                typeDescriptor.getProperties('typeWithProperties2');
            }).toThrow();
        });
    });
    describe('Permissions', () => {
        test('Получаем массив зон доступа', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            expect(typeDescriptor.getPermissions('typeWithPermissions')).toEqual(['permission']);
        });
        test('Получаем массив зон доступа с наследованием', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions2',
                permissions: ['permission2'],
                extends: ['typeWithPermissions'],
            });
            expect(typeDescriptor.getPermissions('typeWithPermissions2')).toEqual([
                'permission2',
                'permission',
            ]);
        });
        test('Получаем массив зон доступа с множественным наследованием', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions2',
                permissions: ['permission2'],
            });
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions3',
                permissions: ['permission3'],
                extends: ['typeWithPermissions', 'typeWithPermissions2'],
            });
            expect(typeDescriptor.getPermissions('typeWithPermissions3')).toEqual([
                'permission3',
                'permission',
                'permission2',
            ]);
        });
        test('Получаем массив зон доступа с наследованием, зоны доступа должны быть уникальными', () => {
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions',
                permissions: ['permission'],
            });
            //@ts-ignore
            typeDescriptor.addType({
                typeId: 'typeWithPermissions2',
                permissions: ['permission'],
                extends: ['typeWithPermissions'],
            });
            expect(typeDescriptor.getPermissions('typeWithPermissions2')).toEqual(['permission']);
        });
    });
});
