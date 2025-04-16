import { ITypeDesc } from 'MetaUnit/sampleData/ServiceFormat';

const objectDesc: ITypeDesc = {
    Id: '',
    TypeId: 'TableInfo',
    MetaType: 'object',
    Version: '25.2000',
    Inherits: [],
    InheritsHierarchy: [],
    HasOverrides: false,
    MetaAttributes: [
        {
            Name: 'title',
            Type: 'title',
            Value: {
                value: 'Таблица',
            },
        },
        {
            Name: 'description',
            Type: 'description',
            Value: {
                value: '',
            },
        },
        {
            Name: 'complexeditors',
            Type: 'complexeditors',
            Value: {
                value: [
                    {
                        name: 'Controls-editors/editors:NameDescription',
                        properties: ['Comments', 'Name'],
                    },
                ],
            },
        },
    ],
    Properties: [
        {
            Id: '',
            Name: 'Name',
            Type: 'string→TableInfo→Name',
            MetaType: 'primitive',
            IsArray: false,
            MetaAttributes: [
                {
                    Name: 'order',
                    Type: 'order',
                    Value: {
                        value: 0,
                    },
                },
            ],
        },
        {
            Id: '',
            Name: 'Deprecated',
            Type: 'boolean→TableInfo→Deprecated',
            MetaType: 'primitive',
            IsArray: false,
            MetaAttributes: [
                {
                    Name: 'order',
                    Type: 'order',
                    Value: {
                        value: 10,
                    },
                },
            ],
        },
        {
            Id: '',
            Name: 'CreationDate',
            Type: 'date→TableInfo→CreationDate',
            MetaType: 'primitive',
            IsArray: false,
            MetaAttributes: [
                {
                    Name: 'order',
                    Type: 'order',
                    Value: {
                        value: 20,
                    },
                },
            ],
        },
        {
            Id: '',
            Name: 'Author',
            Type: 'Person',
            MetaType: 'object',
            IsArray: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Автор',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Автор, создавший таблицу',
                    },
                },
                {
                    Name: 'category',
                    Type: 'category',
                    Value: {
                        value: 'Мета-информация',
                    },
                },
                {
                    Name: 'hidden',
                    Type: 'hidden',
                    Value: {
                        value: false,
                    },
                },
                {
                    Name: 'validators',
                    Type: 'validators',
                    Value: {
                        value: [],
                    },
                },
                {
                    Name: 'required',
                    Type: 'required',
                    Value: {
                        value: true,
                    },
                },
                {
                    Name: 'order',
                    Type: 'order',
                    Value: {
                        value: 30,
                    },
                },
                {
                    Name: 'defaultValue',
                    Type: 'defaultValue',
                    Value: {
                        value: '{"FirstName":"Иван","LastName":"Иванов"}',
                    },
                },
            ],
        },
    ],
    ComplexTypes: [
        {
            Id: '',
            TypeId: 'string→TableInfo→Name',
            MetaType: 'primitive',
            Version: '25.2000',
            Inherits: ['string'],
            InheritsHierarchy: [],
            HasOverrides: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Имя',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Название таблицы',
                    },
                },
                {
                    Name: 'category',
                    Type: 'category',
                    Value: {
                        value: 'Базовые свойства',
                    },
                },
                {
                    Name: 'hidden',
                    Type: 'hidden',
                    Value: {
                        value: false,
                    },
                },
                {
                    Name: 'validators',
                    Type: 'validators',
                    Value: {
                        value: ['not_empty'],
                    },
                },
                {
                    Name: 'editor',
                    Type: 'editor',
                    Value: {
                        value: 'Controls-Input/inputConnected:Text',
                    },
                },
                {
                    Name: 'editorProps',
                    Type: 'editorProps',
                    Value: {
                        value: '{"font-size":"14px"}',
                    },
                },
                {
                    Name: 'required',
                    Type: 'required',
                    Value: {
                        value: true,
                    },
                },
                {
                    Name: 'defaultValue',
                    Type: 'defaultValue',
                    Value: {
                        value: '"Безымяная таблица"',
                    },
                },
            ],
        },
        {
            Id: '',
            TypeId: 'boolean→TableInfo→Deprecated',
            MetaType: 'primitive',
            Version: '25.2000',
            Inherits: ['boolean'],
            InheritsHierarchy: [],
            HasOverrides: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Устаревшая',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Устаревшая таблица',
                    },
                },
                {
                    Name: 'category',
                    Type: 'category',
                    Value: {
                        value: 'Базовые свойства',
                    },
                },
                {
                    Name: 'hidden',
                    Type: 'hidden',
                    Value: {
                        value: true,
                    },
                },
                {
                    Name: 'validators',
                    Type: 'validators',
                    Value: {
                        value: ['not_empty'],
                    },
                },
                {
                    Name: 'editor',
                    Type: 'editor',
                    Value: {
                        value: 'Controls-Input/inputConnected:Boolean',
                    },
                },
                {
                    Name: 'editorProps',
                    Type: 'editorProps',
                    Value: {
                        value: '{"font-size":"14px"}',
                    },
                },
                {
                    Name: 'required',
                    Type: 'required',
                    Value: {
                        value: false,
                    },
                },
            ],
        },
        {
            Id: '',
            TypeId: 'date→TableInfo→CreationDate',
            MetaType: 'primitive',
            Version: '25.2000',
            Inherits: ['date'],
            InheritsHierarchy: [],
            HasOverrides: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Дата создания',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Дата создания таблицы',
                    },
                },
                {
                    Name: 'category',
                    Type: 'category',
                    Value: {
                        value: 'Базовые свойства',
                    },
                },
                {
                    Name: 'hidden',
                    Type: 'hidden',
                    Value: {
                        value: false,
                    },
                },
                {
                    Name: 'validators',
                    Type: 'validators',
                    Value: {
                        value: ['not_empty'],
                    },
                },
                {
                    Name: 'editor',
                    Type: 'editor',
                    Value: {
                        value: 'Controls-Input/dateConnected:Date',
                    },
                },
                {
                    Name: 'editorProps',
                    Type: 'editorProps',
                    Value: {
                        value: '{"font-size":"14px"}',
                    },
                },
                {
                    Name: 'required',
                    Type: 'required',
                    Value: {
                        value: true,
                    },
                },
                {
                    Name: 'readonly',
                    Type: 'readonly',
                    Value: {
                        value: true,
                    },
                },
                {
                    Name: 'defaultValue',
                    Type: 'defaultValue',
                    Value: {
                        value: '"2025-01-01T09:00:00.000Z"',
                    },
                },
            ],
        },
        {
            Id: '',
            TypeId: 'Person',
            MetaType: 'object',
            Version: '25.2000',
            Inherits: ['Person'],
            InheritsHierarchy: [],
            HasOverrides: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Персона',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Ссылка на персону',
                    },
                },
                {
                    Name: 'editor',
                    Type: 'editor',
                    Value: {
                        value: 'Controls-Name/nameConnected:Editor',
                    },
                },
                {
                    Name: 'editorProps',
                    Type: 'editorProps',
                    Value: {
                        value: '{"font-weight":"bold"}',
                    },
                },
                {
                    Name: 'defaultValue',
                    Type: 'defaultValue',
                    Value: {
                        value: '{"FirstName":"Иван", "LastName":"Иванов"}',
                    },
                },
            ],
            Properties: [
                {
                    Id: '',
                    Name: 'FirstName',
                    Type: 'string→TableInfo→Author→FirstName',
                    MetaType: 'primitive',
                    IsArray: false,
                    MetaAttributes: [
                        {
                            Name: 'order',
                            Type: 'order',
                            Value: {
                                value: 0,
                            },
                        },
                    ],
                },
                {
                    Id: '',
                    Name: 'LastName',
                    Type: 'string→TableInfo→Author→LastName',
                    MetaType: 'primitive',
                    IsArray: false,
                    MetaAttributes: [
                        {
                            Name: 'order',
                            Type: 'order',
                            Value: {
                                value: 1,
                            },
                        },
                    ],
                },
            ],
        },
        {
            Id: '',
            TypeId: 'string→TableInfo→Author→LastName',
            MetaType: 'primitive',
            Version: '25.2000',
            Inherits: ['string'],
            InheritsHierarchy: ['string'],
            HasOverrides: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Фамилия',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Фамилия персоны',
                    },
                },
                {
                    Name: 'category',
                    Type: 'category',
                    Value: {
                        value: '',
                    },
                },
                {
                    Name: 'hidden',
                    Type: 'hidden',
                    Value: {
                        value: true,
                    },
                },

                {
                    Name: 'required',
                    Type: 'required',
                    Value: {
                        value: false,
                    },
                },
                {
                    Name: 'defaultValue',
                    Type: 'defaultValue',
                    Value: {
                        value: '"Иванов"',
                    },
                },
                {
                    Name: 'editorProps',
                    Type: 'editorProps',
                    Value: {
                        value: '{"font-weight":"bold"}',
                    },
                },
            ],
        },
        {
            Id: '',
            TypeId: 'string→TableInfo→Author→FirstName',
            MetaType: 'primitive',
            Version: '25.2000',
            Inherits: ['string'],
            InheritsHierarchy: ['string'],
            HasOverrides: false,
            MetaAttributes: [
                {
                    Name: 'title',
                    Type: 'title',
                    Value: {
                        value: 'Имя',
                    },
                },
                {
                    Name: 'description',
                    Type: 'description',
                    Value: {
                        value: 'Имя персоны',
                    },
                },
                {
                    Name: 'category',
                    Type: 'category',
                    Value: {
                        value: '',
                    },
                },
                {
                    Name: 'hidden',
                    Type: 'hidden',
                    Value: {
                        value: false,
                    },
                },
                {
                    Name: 'required',
                    Type: 'required',
                    Value: {
                        value: false,
                    },
                },
                {
                    Name: 'order',
                    Type: 'order',
                    Value: {
                        value: 0,
                    },
                },
                {
                    Name: 'defaultValue',
                    Type: 'defaultValue',
                    Value: {
                        value: '"Иван"',
                    },
                },
                {
                    Name: 'editor',
                    Type: 'editor',
                    Value: {
                        value: 'Controls-Input/textConnected:String',
                    },
                },
                {
                    Name: 'editorProps',
                    Type: 'editorProps',
                    Value: {
                        value: '{"font-weight":"bold"}',
                    },
                },
            ],
        },
    ],
};

export { objectDesc };
