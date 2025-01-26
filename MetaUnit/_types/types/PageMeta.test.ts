import { expect } from 'chai';
import { MetaClass, PageMeta } from 'Meta/types';

describe('Meta/_types/meta', () => {
    describe('PageMeta', () => {
        describe('constructor()', () => {
            it('использует параметры из аргумента', () => {
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
                expect(result.getId()).equal(id);
                expect(result.getTitle()).equal(title);
                expect(result.getDescription()).equal(description);
                expect(result.getGroup()).equal(group);
                expect(result.getIcon()).equal(icon);
                expect(result.getCategory()).equal(category);
                expect(result.getOrder()).equal(order);
                expect(result.isHidden()).equal(true);
                expect(result.getKaidzen()).equal(kaidzen);
                expect(result.getPreview()).equal(preview);
                expect(result.getUrl()).equal(url);
                expect(result.getGit()).equal(git);
                expect(result.getDesign()).equal(design);
                expect(result.getComponents()).equal(components);
                expect(result.getAccessArea()).equal(accessArea);
                expect(result.getTemplates()).equal(templates);
                expect(result.getPrefetchConfig()).equal(prefetchConfig);
                expect(result.getConstructorProps()).equal(constructorProps);
                expect(result.getType()).equal(pagexType);
            });
        });
    });
});
