/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getMeta as getCustomMeta, getJson as getCustomJson } from './model/custom';
import { deserialize } from 'Meta/types';
import type { ArrayMeta, WidgetMeta, Meta } from 'Meta/types';
import { default as LoadedJSON } from './model/asJsonMock';
import { default as JSONArray } from './model/asJsonArray';

describe('Meta/_types/marshaling/deserializer', () => {
    test('Meta при десериализации всегда получает fiexedId === true', () => {
        const referenceMeta = getCustomMeta();
        const json = getCustomJson();
        const meta = deserialize(json);
        const descriptor = referenceMeta.toDescriptor();
        expect(meta.toDescriptor()).toEqual({ ...descriptor, fixedId: true });
    });

    describe('Десериализуется шаблонный meta из сервиса', () => {
        // @ts-ignore
        const result = deserialize(LoadedJSON) as WidgetMeta;
        test('Проврка десереализации осноного метода', () => {
            const sandart = LoadedJSON[2];
            expect(result.getId()).toEqual(sandart.id);
            expect(result.getDescription()).toEqual(sandart.description);
            expect(result.isRequired()).toEqual(sandart.required);
            expect(result.getTitle()).toEqual(sandart.title);
            expect(result.getDefaultValue()).toEqual(JSON.parse(sandart.defaultValue));
        });

        test('Проврка десереализации сложного атрибута', () => {
            // @ts-ignore
            const attr = result.getProperties().colors as Meta<never>;
            const sandart = LoadedJSON[1];
            expect(attr.getId()).toEqual(sandart.id);
            expect(attr.getDescription()).toEqual(sandart.description);
            expect(attr.isRequired()).toEqual(sandart.required);
            expect(attr.getTitle()).toEqual(sandart.title);
            expect(attr.getDefaultValue()).toEqual(JSON.parse(sandart.defaultValue));
            //@ts-ignore
            expect(attr.getGroup().uid).toEqual(JSON.parse(sandart.group)[0]);
            // expect(JSON.stringify(attr.toDescriptor().editor.props)).equal(sandart.order);
        });

        test('Проврка десереализации строкового атрибута', () => {
            // @ts-ignore
            const attr = result.getProperties().widgetTitle as Meta<never>;
            const sandart = LoadedJSON[0];
            expect(attr.getId()).toEqual(sandart.id);
            expect(attr.isRequired()).toEqual(sandart.required);
            expect(attr.isHidden()).toEqual(sandart.hidden);
            expect(attr.getDefaultValue()).toEqual(JSON.parse(sandart.defaultValue));
        });
    });

    describe('Десериализуется массив', () => {
        // @ts-ignore
        const result = deserialize(JSONArray) as ArrayMeta;
        test('Проврка десереализации строкового атрибута', () => {
            // @ts-ignore
            const itemMeta = result.getItemMeta();
            const sandart = JSONArray[0];
            expect(itemMeta.getId()).toEqual(sandart.arrayOf);
        });
    });
});
