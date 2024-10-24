/**
 * @kaizenZone 8024d986-a103-40a2-9572-c376c2c38fa5
 */
import { constants } from 'Env/Env';
import { EntityMarker } from 'Types/declarations';

const $destroyed = Symbol('destroyed');

function dontTouchDeads(): void {
    throw new ReferenceError('This class instance is destroyed.');
}

/**
 * Миксин, добавляющий аспект состояния "экземпляр разрушен".
 * @remark
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @public
 */
export default abstract class DestroyableMixin {
    [$destroyed]: boolean;

    readonly '[Types/_entity/DestroyableMixin]': EntityMarker = true;

    /**
     * Экземпляр был разрушен
     */
    get destroyed(): boolean {
        return Boolean(this[$destroyed]);
    }

    /**
     * Разрушает экземпляр
     * @remark
     * Метод следует вызывать в случае, когда экземпляр сущности больше не требуется и не должен использоваться в run-time.
     * При этом он помечается как destroyed, а также уничтожаются ссылки на все методы экземпляра — т.е. он станет физически неработоспособен, любая попытка вызвать метод будет выбрасывать исключение.
     * Будьте внимательны — вы должны точно знать, что делаете. Самый распространенный вариант использования destroy() - это композиция, когда уничтожаемый экземпляр класса существует только внутри контейнера и не выходит за его пределы.
     * В противном случае, если ваш код не владеет всем жизненным циклом объекта (не создает его, либо делает его доступным "снаружи"), то лучше не вызывать данный метод, т.к. вы можете спровоцировать ошибки других частях приложения, где хранится ссылка на уничтожаемый экземпляр.
     *
     * Наследники класса могут добавлять свою логику в смысл уничтожения экземпляра, например {@link Types/_entity/ObservableMixin} при вызове destroy() отписывает все обработчики событий уничтожаемого экземпляра.
     * Также метод может использоваться для помощи сборщику мусора — при уничтожении можно занулять все ссылки на объекты в 'this', что уменьшает число связей с объектом в куче памяти.
     */
    destroy(..._args: unknown[]): void {
        this[$destroyed] = true;

        if (constants.isProduction) {
            // На продуктиве нет смысла выводить предупреждения о доступе к полям разрушенного экземпляра.
            // Выполняется очень медленно:
            // https://online.sbis.ru/opendoc.html?guid=3a86926e-3f6a-4eaa-86ec-ba638628a0c9&client=3
            return;
        }

        // eslint-disable-next-line guard-for-in
        for (const key in this) {
            switch (key) {
                case 'destroy':
                case 'destroyed':
                case 'isDestroyed':
                    break;
                default:
                    if (typeof this[key] === 'function') {
                        //@ts-ignore
                        this[key] = dontTouchDeads;
                    }
            }
        }
    }

    /**
     * Возвращает признак, что экземпляр был разрушен
     * @deprecated
     * @private
     */
    protected isDestroyed(): boolean {
        return this.destroyed;
    }
}
Object.assign(DestroyableMixin.prototype, {
    '[Types/_entity/DestroyableMixin]': true,
});
