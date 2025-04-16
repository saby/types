/* import { WidgetType, ArrayMeta, UnionType, ObjectType, StringType, MetaClass } from 'Meta/types';

const JsonMLNodeType = new ArrayMeta<(object | string)[]>({
    is: MetaClass.array,
    id: 'array',
    arrayOf: UnionType.of([ObjectType, StringType]),
});

export const JsonMLType = UnionType.of([JsonMLNodeType, StringType]);

const WidgetPlayerType = WidgetType.id('Frame/player:WidgetPlayer')
    .title('Виджет плеера')
    .description('Виджет проигрывает фрейм в формате JSONML')
    .properties({
        frame: JsonMLType.defaultValue([]),
    });
 */
/* describe('ISSUE', () => {
    test('#1', () => {
        const result = [{
          defaultValue: [],
          id: '→485→247',
          inherits: [],
          is: 'primitive',
          required: true,
        },
        {
          properties: [],
          description: 'Виджет проигрывает фрейм в формате JSONML',
          id: 'Frame/player:WidgetPlayer',
          inherits: ['widget'],
          is: 'widget',
          required: true,
          title: 'Виджет плеера',
        }
      ];
        expect(WidgetPlayerType.saveMeta()).toEqual(result);
    });
}); */
