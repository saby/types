export default [
    {
        attributes: [],
        defaultValue: '"Счётчик компаний"',
        hidden: true,
        id: 'string→405→600',
        inherits: ['string'],
        is: 'primitive',
        required: true
    }, {
        attributes: [],
        defaultValue: '{"marker":"success","background":"success","title":"label"}',
        description: 'Цвет маркера, фона и заголовка виджета дашборда',
        editorProps: '{"markerItems":[{"id":"primary"},{"id":"brand"},{"id":"info"},{"id":"danger"},{"id":"success"},{"id":"unaccented"},{"id":"warning"}],"backgroundItems":[{"id":"default"},{"id":"primary"},{"id":"brand"},{"id":"info"},{"id":"danger"},{"id":"success"},{"id":"unaccented"},{"id":"warning"}],"titleItems":[{"id":"label"},{"id":"primary"},{"id":"secondary"},{"id":"info"},{"id":"danger"},{"id":"success"},{"id":"unaccented"},{"id":"warning"}],"backgroundCaption":"Фон","markerCaption":"Иконка","titleCaption":"Заголовок"}',
        group: '["dashboard_widget_group",""]',
        id: 'IDashboardColorsType.counterColors',
        inherits: ['colors'],
        is: 'primitive',
        order: 1005,
        required: true,
        title: 'Цвет маркера, фона и заголовка виджета дашборда'
    }, {
        attributes: [
            ['IDashboardColorsType.counterColors', 'colors'],
            ['string→405→600', 'widgetTitle']
        ],
        defaultValue: '{"colors":{"marker":"success","background":"success","title":"label"},"widgetTitle":"Счётчик компаний"}',
        description: 'Отображает общее количество компаний, добавленных в аккаунт',
        designtimeEditorProps: '{}',
        id: 'BillingAccountContractorPublic/companies:Widget',
        inherits: ['widget'],
        is: 'widget',
        required: true,
        title: 'Счётчик компаний'
    }
];