const def = function () {
    return 'default-editor';
};
def._moduleName = 'TypesUnit/_meta/tojson/editor';

export default def;

export function NamedEditor() {
    return 'named-editor';
}
NamedEditor._moduleName = 'TypesUnit/_meta/tojson/editor:NamedEditor';