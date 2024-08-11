const def = function () {
    return 'default-editor';
};
def._moduleName = 'MetaUnit/_types/tojson/editor';

export default def;

export function NamedEditor() {
    return 'named-editor';
}
NamedEditor._moduleName = 'MetaUnit/_types/tojson/editor:NamedEditor';
