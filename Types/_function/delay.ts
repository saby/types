/**
 * @kaizenZone 07d798b9-6bba-4f43-a8ed-177079803df9
 */
type HiddenOptions = 'hidden' | 'msHidden' | 'webkitHidden';

interface SabyDocument extends Document {
    msHidden?: boolean;
    webkitHidden?: boolean;
}

const hiddenPossibleNames: HiddenOptions[] = ['hidden', 'msHidden', 'webkitHidden'];
const win = typeof window !== 'undefined' ? window : null;
const doc: SabyDocument | null = typeof document !== 'undefined' ? document : null;
const getHiddenName = (): HiddenOptions | undefined => {
    if (!doc) {
        return undefined;
    }

    return hiddenPossibleNames.find((name) => {
        return typeof doc[name] !== 'undefined';
    });
};
const hiddenName = getHiddenName();

/**
 * Метод Вызывает функцию асинхронно, через requestAnimationFrame, или на крайний случай setTimeout.
 * @remark
 * Если вкладка скрыта, то есть окно браузера свёрнуто или активна другая вкладка развёрнутого окна, requestAnimationFrame выполнится только когда вкладка снова станет видимой. В этом случае тоже используем setTimeout, чтобы функция выполнилась прямо на скрытой вкладке, и очередь асинхронных функций не копилась.
 *
 * @param original Исходная функция, вызов которой нужно асинхронно
 * @returns Результирующая функция
 * @public
 */
export default function delay(original: Function): void {
    if (win?.requestAnimationFrame && !(hiddenName && doc?.[hiddenName])) {
        win.requestAnimationFrame(original as FrameRequestCallback);
    } else {
        setTimeout(original, 0);
    }
}
