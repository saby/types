/* import { WidgetType, ArrayMeta, UnionType, ObjectType, StringType, MetaClass } from 'Meta/types';
import { expect } from 'chai';

const JsonMLNodeType = new ArrayMeta<(object | string)[]>({
    is: MetaClass.array,
    id: 'array',
    arrayOf: UnionType.of([ObjectType, StringType]),
});

export const JsonMLType = UnionType.of([JsonMLNodeType, StringType]);

const WidgetPlayerType = WidgetType.id('Frame/player:WidgetPlayer')
    .title('Виджет плеера')
    .description('Виджет проигрывает фрейм в формате JSONML')
    .attributes({
        frame: JsonMLType.defaultValue([]),
    });
 */
/* describe('ISSUE', () => {
    it('#1', () => {
        const result = [{
          defaultValue: [],
          id: '→485→247',
          inherits: [],
          is: 'primitive',
          required: true,
        },
        {
          attributes: [],
          description: 'Виджет проигрывает фрейм в формате JSONML',
          id: 'Frame/player:WidgetPlayer',
          inherits: ['widget'],
          is: 'widget',
          required: true,
          title: 'Виджет плеера',
        }
      ];
        expect(WidgetPlayerType.toJSON()).deep.equal(result);
    });
}); */
