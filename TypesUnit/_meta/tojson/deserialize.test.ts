/* eslint-disable @typescript-eslint/ban-ts-comment */
import { expect } from 'chai';
import {
    getMeta as getCustomMeta,
    getJson as getCustomJson
} from './model/custom';
import { deserialize } from 'Types/meta';
import type { WidgetMeta, Meta } from 'Types/meta';
import { default as LoadedJSON } from './model/asJsonMock';

describe('Types/_meta/marshaling/deserializer', () => {
    it('Meta при десериализации всегда получает fiexedId === true', () => {
        const referenceMeta = getCustomMeta();
        const json = getCustomJson();
        const meta = deserialize(json);
        const descriptor = referenceMeta.toDescriptor();
        expect(meta.toDescriptor()).deep.equal({ ...descriptor, fixedId: true });
    });

    describe('Десериализуется шаблонный meta из сервиса', () => {
        // @ts-ignore
        const result = deserialize(LoadedJSON) as WidgetMeta;
        it('Проврка десереализации осноного метода', () => {
            const sandart = LoadedJSON[2];
            expect(result.getId()).equal(sandart.id);
            expect(result.getDescription()).equal(sandart.description);
            expect(result.isRequired()).equal(sandart.required);
            expect(result.getTitle()).equal(sandart.title);
            expect(result.getDefaultValue()).deep.equal(JSON.parse(sandart.defaultValue));
        });

        it('Проврка десереализации сложного атрибута', () => {
            // @ts-ignore
            const attr = result.getAttributes().colors as Meta<never>;
            const sandart = LoadedJSON[1];
            expect(attr.getId()).equal(sandart.id);
            expect(attr.getDescription()).equal(sandart.description);
            expect(attr.isRequired()).equal(sandart.required);
            expect(attr.getTitle()).equal(sandart.title);
            expect(attr.getDefaultValue()).deep.equal(JSON.parse(sandart.defaultValue));
            expect(attr.getGroup().uid).equal(JSON.parse(sandart.group)[0]);
            // expect(JSON.stringify(attr.toDescriptor().editor.props)).equal(sandart.order);
        });

        it('Проврка десереализации строкового атрибута', () => {
            // @ts-ignore
            const attr = result.getAttributes().widgetTitle as Meta<never>;
            const sandart = LoadedJSON[0];
            expect(attr.getId()).equal(sandart.id);
            expect(attr.isRequired()).equal(sandart.required);
            expect(attr.isHidden()).equal(sandart.hidden);
            expect(attr.getDefaultValue()).deep.equal(JSON.parse(sandart.defaultValue));
        });

    });
});