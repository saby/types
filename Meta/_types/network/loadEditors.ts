// import { loadSync } from 'WasabyLoader/ModulesLoader';
import { Meta } from '../baseMeta';
import type { IComponent, ILoadedEditor, TmpMetaEditor } from '../components';
import { ObjectMeta } from '../object';
import { WidgetMeta } from '../widget';

async function loadAttributieEditors(type: ObjectMeta<unknown, {}>): Promise<unknown> {
    // TODO должно быть Promise.allSettled. Поправить в 24.1000
    return Promise.all(Object.values(type.getAttributes()).map(load));
}

async function loadStyleEditors(type: WidgetMeta<unknown, {}>): Promise<unknown> {
    // TODO должно быть Promise.allSettled. Поправить в 24.1000
    return Promise.all(Object.values(type.getStyles()).map(load));
}

/**
 * Функция выполняет загрузку редакторов метатипа
 * @param type Meta-тип
 * @returns Promise
 */
export default async function load(type: Meta<unknown>): Promise<void> {
    const editor = type.getEditor();
    if ((editor as TmpMetaEditor)?.loader) {
        return editor.load().then(() => undefined);
    }

    let originEditor;
    if (type.getOrigin()?.meta?.getEditor()) {
        originEditor = type
            .getOrigin()
            .meta.getEditor()
            .load()
            .then(() => undefined);
    }

    let styleEditors;
    if (type instanceof WidgetMeta) {
        styleEditors = loadStyleEditors(type);
    }

    let attrsEditors;
    if (type instanceof ObjectMeta) {
        attrsEditors = loadAttributieEditors(type);
    }

    return Promise.all([originEditor, styleEditors, attrsEditors]).then(() => undefined);
}

/**
 * Функция, которая возвращает по метатипу его редактор
 * @param meta Meta/types:Meta
 * @param defaultEditors объект загруженных редакторов
 * @returns Редактор
 */
export function getComponent(
    meta: Meta<unknown>,
    defaultEditors?: ILoadedEditor
): IComponent<unknown> | undefined {
    if (!meta) {
        return;
    }

    if (meta.getEditor().component) {
        return meta.getEditor().component;
    }

    if (defaultEditors?.[meta.getId()]) {
        return defaultEditors[meta.getId()];
    }

    const inheritsIds = meta.getInherits();
    let result;
    for (const id of inheritsIds) {
        if (defaultEditors?.[id]) {
            result = defaultEditors[id];
            break;
        }
    }
    return result as IComponent<unknown>;
}
