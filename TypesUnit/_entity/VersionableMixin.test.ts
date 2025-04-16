import VersionableMixin, { VersionCallback } from 'Types/_entity/VersionableMixin';

class Entity extends VersionableMixin {
    constructor(callback?: VersionCallback) {
        super();
        //@ts-ignore
        this._$versionCallback = callback;
    }

    touch(): void {
        this._nextVersion();
    }
}

describe('Types/_entity/VersionableMixin', () => {
    describe('.versionLocked', () => {
        test('should return false by default', () => {
            const inst = new Entity();
            expect(inst.versionLocked).toBe(false);
        });
    });

    describe('.constructor()', () => {
        test('should use given version change handler', () => {
            let lastVersion: number;
            const handler = (version: number) => {
                return (lastVersion = version);
            };
            const inst = new Entity(handler);

            const initialVersion = (lastVersion = inst.getVersion());
            inst.touch();
            expect(lastVersion).not.toEqual(initialVersion);
        });
    });

    describe('.getVersion()', () => {
        test('should return 0 by default', () => {
            const inst = new Entity();
            expect(inst.getVersion()).toBe(0);
        });

        test('should return new version after a touch', () => {
            const inst = new Entity();
            const initialVersion = inst.getVersion();
            inst.touch();
            expect(inst.getVersion()).not.toEqual(initialVersion);
        });
    });

    describe('.lockVersion()', () => {
        test('should stop version change', () => {
            const inst = new Entity();

            expect(inst.getVersion()).toBe(0);
            inst.lockVersion();
            inst.touch();
            expect(inst.getVersion()).toBe(0);
        });

        test('should throw an error if already locked', () => {
            const inst = new Entity();
            inst.lockVersion();
            expect(() => {
                inst.lockVersion();
            }).toThrow();
        });
    });

    describe('.unlockVersion()', () => {
        test('should continue version chainge', () => {
            const inst = new Entity();

            inst.lockVersion();
            inst.unlockVersion();
            const initialVersion = inst.getVersion();
            inst.touch();
            expect(inst.getVersion()).not.toEqual(initialVersion);
        });

        test('should change version if an object has been touched while being locked', () => {
            const inst = new Entity();

            const initialVersion = inst.getVersion();
            inst.lockVersion();
            inst.touch();
            inst.unlockVersion();
            expect(inst.getVersion()).not.toEqual(initialVersion);
        });

        test("shouldn't change version in silent mode", () => {
            const inst = new Entity();

            const initialVersion = inst.getVersion();
            inst.lockVersion();
            inst.touch();
            inst.unlockVersion(true);
            expect(inst.getVersion()).toEqual(initialVersion);
        });

        test('should throw an error if already unlocked', () => {
            const inst = new Entity();
            expect(() => {
                inst.unlockVersion();
            }).toThrow();
        });
    });
});
