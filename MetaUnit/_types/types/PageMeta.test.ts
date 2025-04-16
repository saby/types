import { MetaClass, PageMeta } from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('PageMeta', () => {
        describe('constructor()', () => {
            test('использует параметры из аргумента', () => {
                const id = 'id1';
                const title = 'test';
                const description = 'test-description';
                const icon = 'test-icon';
                const category = 'test-category';
                const group = { name: 'test-group', uid: 'test-group-uid' };
                const order = 42;
                const kaidzen = 'test-kaidzen';
                const preview = 'test-preview';
                const url = 'test-url';
                const git = 'test-git';
                const design = 'test-design';
                const components = ['test-components'];
                const accessArea = ['test-accessArea'];
                const templates = ['test-templates1', 'test-templates2'];
                const prefetchConfig = {
                    customDataLoader: 'test-customDataLoader',
                    prepareExternalBindings: 'test-prepareExternalBindings',
                    getLoaderConfig: 'test-getLoaderConfig',
                };
                const constructorProps = {
                    previewButtonVisible: true,
                    shopConfig: {
                        viewMode: 'big',
                        items: ['test-items'],
                        detailedItems: ['test-detailedItems'],
                        groups: ['test-groups'],
                        hideExisted: false,
                    },
                    width: 100,
                    height: 100,
                    adaptiveConfig: {
                        items: [{}],
                    },
                    editorBackground: 'test-editorBackground',
                    metaTypes: [],
                    pageConstructors: [],
                    editorTemplateName: 'test-editorBackground',
                    headerToolbarItems: [],
                    tabsConfig: {
                        constructorTabTitle: 'test-constructorTabTitle',
                        metaTypes: [],
                    },
                    minimizedWidth: 0,
                    propStorageId: 'test-propStorageId',
                    fieldsConfig: {
                        endpoint: 'test-endpoint',
                    },
                };
                const pagexType = 'pagex-type';
                const result = new PageMeta({
                    is: MetaClass.page,
                    id,
                    info: {
                        title,
                        description,
                        icon,
                        category,
                        group,
                        order,
                        hidden: true,
                    },
                    kaidzen,
                    preview,
                    url,
                    git,
                    design,
                    components,
                    accessArea,
                    templates,
                    prefetchConfig,
                    constructorProps,
                    type: pagexType,
                });
                expect(result.getId()).toEqual(id);
                expect(result.getTitle()).toEqual(title);
                expect(result.getDescription()).toEqual(description);
                expect(result.getGroup()).toEqual(group);
                expect(result.getIcon()).toEqual(icon);
                expect(result.getCategory()).toEqual(category);
                expect(result.getOrder()).toEqual(order);
                expect(result.isHidden()).toEqual(true);
                expect(result.getKaidzen()).toEqual(kaidzen);
                expect(result.getPreview()).toEqual(preview);
                expect(result.getUrl()).toEqual(url);
                expect(result.getGit()).toEqual(git);
                expect(result.getDesign()).toEqual(design);
                expect(result.getComponents()).toEqual(components);
                expect(result.getAccessArea()).toEqual(accessArea);
                expect(result.getTemplates()).toEqual(templates);
                expect(result.getPrefetchConfig()).toEqual(prefetchConfig);
                expect(result.getConstructorProps()).toEqual(constructorProps);
                expect(result.getType()).toEqual(pagexType);
            });
        });
    });
});
