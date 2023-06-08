/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IPropertyEditorProps, ObjectMeta } from 'Types/_meta/meta';

type IDeleteEventHandler = (value: any) => void;
type ISelectEventHandler = (elementId?: string) => void;
export interface IControlDesignerProps<T> extends IPropertyEditorProps<T> {
    /** Мета-информация о текущем элементе */
    valueMeta: ObjectMeta<any>;

    /** Класс описания уровня выделения.
     * Для того что бы отобразить выделен ли редактор свойства сам
     *  или его внутренний элемент
     */
    className: string;

    /** Является виджет выделенным при наведении мыши */
    hovered: boolean;

    /** Является ли виджет выделенным в данный момент */
    selected: boolean;

    /** Является ли виджет в данный момент переносимым */
    dragged: boolean;

    /** Клик по элементу */
    onSelect: ISelectEventHandler;

    /** Наведение на элемент */
    onHover: ISelectEventHandler;

    /** Элемент удаляется */
    onDelete: IDeleteEventHandler;

    /** Запустить dragndrop для элемента элемента во фрейме */
    onDragStart: (elementId: string, e: MouseEvent) => void;

    /** Получение позиции и размера элемента */
    getElementBoundingRect: (element: HTMLElement | string) => {
        top: number;
        left: number;
        width: number;
        height: number;
    };
}
