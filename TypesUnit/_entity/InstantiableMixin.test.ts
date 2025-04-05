import InstantiableMixin from 'Types/_entity/InstantiableMixin';
import { constants } from 'Env/Env';

describe('Types/_entity/InstantiableMixin', () => {
    describe('.getInstanceId()', () => {
        test('should return various prefix on client and server', () => {
            const id = InstantiableMixin.prototype.getInstanceId();

            if (constants.isBrowserPlatform) {
                expect(id.startsWith('client-id-')).toBeTruthy();
            } else {
                expect(id.startsWith('server-id-')).toBeTruthy();
            }
        });
    });
});
