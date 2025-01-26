import { DataObject, DataSet } from 'Types/source';
import { Model, adapter } from 'Types/entity';

const EXISTS_ID = '123';
const OBJECT_NAME = 'Employee';

describe('Types/source:DataObject', () => {
    let source: DataObject;
    let rpcSpy: jest.SpyInstance;
    let lastCallArgs: Record<string, unknown>;

    beforeEach(() => {
        source = new DataObject({
            objectName: OBJECT_NAME,
        });

        rpcSpy = jest
            // @ts-ignore
            .spyOn(DataObject.prototype, 'getSource')
            // @ts-ignore
            .mockReturnValue({
                // @ts-ignore
                call: (command: string, data: Record<string, unknown>, _: object) => {
                    lastCallArgs = data;
                    switch (command) {
                        case 'Read':
                            // @ts-ignore
                            if (data.ID === EXISTS_ID) {
                                // @ts-ignore
                                return Promise.resolve(
                                    new DataSet({
                                        rawData: new Model({
                                            format: {
                                                Id: { type: 'string', defaultValue: EXISTS_ID },
                                                Age: { type: 'integer', defaultValue: 18 },
                                            },
                                            adapter: new adapter.Sbis(),
                                            typeName: OBJECT_NAME,
                                        }).getRawData(),
                                        adapter: new adapter.Sbis(),
                                    })
                                );
                            }

                            return new Error('Employee not exists');
                        case 'Write':
                            return Promise.resolve();
                    }
                },
            });
    });

    afterEach(() => {
        // @ts-ignore
        source = undefined;
        rpcSpy.mockClear();
    });

    describe('.read()', () => {
        describe('when objectName exists', () => {
            it('should return valid model', async () => {
                return source.read(EXISTS_ID).then((dataSet) => {
                    const model = dataSet.getRow();
                    expect(model).toBeInstanceOf(Model);
                    expect(model?.getKey()).toEqual(EXISTS_ID);
                });
            });

            it('should generate a valid request', async () => {
                return source
                    .read(EXISTS_ID, {
                        fields: ['FullName', 'Age'],
                    })
                    .then(() => {
                        const args = lastCallArgs;
                        expect(args.Name).toEqual(OBJECT_NAME);

                        expect(args.ID).toEqual(EXISTS_ID);

                        expect(args.Properties).toHaveLength(2);
                        expect(args.Properties).toEqual(['FullName', 'Age']);
                    });
            });

            it('should require Id field for empty fields', async () => {
                return source
                    .read(EXISTS_ID, {
                        fields: [],
                    })
                    .then(() => {
                        const args = lastCallArgs;
                        expect(args.Properties).toHaveLength(1);
                        expect(args.Properties).toEqual(['Id']);
                    });
            });

            it('should pass additional parameters to call', async () => {
                return source
                    .read(EXISTS_ID, {
                        fields: ['SomeField'],
                        parameters: {
                            ServiceId: '111',
                            RegulationId: '222',
                            partial: true,
                        },
                    })
                    .then(() => {
                        const parameters = lastCallArgs?.Parameters as Model;
                        expect(parameters.get('ServiceId')).toEqual('111');
                        expect(parameters.get('RegulationId')).toEqual('222');
                        expect(parameters.get('partial')).toEqual(true);
                    });
            });

            it('should pass ServiceId to call', async () => {
                return source
                    .read(EXISTS_ID, {
                        fields: ['SomeField'],
                        parameters: {
                            ServiceId: '111',
                        },
                    })
                    .then(() => {
                        const parameters = lastCallArgs?.Parameters as Model;
                        expect(parameters.get('ServiceId')).toEqual('111');
                    });
            });

            it('should pass RegulationId to call', async () => {
                return source
                    .read(EXISTS_ID, {
                        fields: ['SomeField'],
                        parameters: {
                            RegulationId: '222',
                        },
                    })
                    .then(() => {
                        const parameters = lastCallArgs?.Parameters as Model;
                        expect(parameters.get('RegulationId')).toEqual('222');
                    });
            });

            it('should pass partial parameter to call', async () => {
                return source
                    .read(EXISTS_ID, {
                        fields: ['SomeField'],
                        parameters: {
                            partial: true,
                        },
                    })
                    .then(() => {
                        const parameters = lastCallArgs?.Parameters as Model;
                        expect(parameters.get('partial')).toEqual(true);
                    });
            });
        });

        describe("when objectName doesn't exists", () => {
            it('should throw error on read', () => {
                const service = new DataObject({
                    // @ts-ignore
                    objectName: undefined,
                });

                expect(() => {
                    service.read(EXISTS_ID);
                }).toThrowError('objectName not defined');
            });
        });
    });

    describe('.update()', () => {
        let updateModel: Model;

        beforeEach(() => {
            updateModel = new Model({
                format: {
                    Id: { type: 'string', defaultValue: EXISTS_ID },
                    Age: { type: 'integer', defaultValue: 18 },
                },
                keyProperty: 'Id',
                adapter: new adapter.Sbis(),
                typeName: OBJECT_NAME,
            });
        });

        afterEach(() => {
            // @ts-ignore
            updateModel = null;
        });
        describe('when objectName exists', () => {
            it('should update the model', async () => {
                return source.update(updateModel).then(() => {
                    const args = lastCallArgs;
                    expect(args.Properties).toBeInstanceOf(Model);
                    expect(args.Properties).toEqual(updateModel);
                });
            });

            it('should generate a valid request', async () => {
                return source.update(updateModel).then(() => {
                    const args = lastCallArgs;
                    expect(args.Name).toEqual(OBJECT_NAME);
                    expect(args.Properties).toBeInstanceOf(Model);
                });
            });

            it('should update only changed fields', async () => {
                updateModel.set('Age', 19);
                updateModel.addField({
                    name: 'MiddleName',
                    type: 'string',
                });
                updateModel.set('MiddleName', 'Иванович');
                return source
                    .update(updateModel, {
                        updateOnlyChanged: true,
                    })
                    .then(() => {
                        const args = lastCallArgs;
                        const model = args.Properties as Model;

                        const enumerator = model.getEnumerator();
                        const fields: string[] = [];

                        while (enumerator.moveNext()) {
                            fields.push(enumerator.getCurrent() as string);
                        }

                        expect(fields).toEqual(['Id', 'Age', 'MiddleName']);
                        expect(model.get('Age')).toEqual(19);
                        expect(model.get('MiddleName')).toEqual('Иванович');
                    });
            });

            it('should only update the id field if there are no other changed fields', async () => {
                return source
                    .update(updateModel, {
                        updateOnlyChanged: true,
                    })
                    .then(() => {
                        const args = lastCallArgs;
                        const model = args.Properties as Model;

                        const enumerator = model.getEnumerator();
                        const fields: string[] = [];

                        while (enumerator.moveNext()) {
                            fields.push(enumerator.getCurrent() as string);
                        }

                        expect(fields).toEqual(['Id']);
                    });
            });

            it('should pass partial parameter to update call', async () => {
                return source
                    .update(updateModel, {
                        parameters: {
                            ServiceId: '111',
                            RegulationId: '222',
                        },
                    })
                    .then(() => {
                        const parameters = lastCallArgs?.Parameters as Model;
                        expect(parameters).toBeInstanceOf(Model);
                        expect(parameters.get('ServiceId')).toEqual('111');
                        expect(parameters.get('RegulationId')).toEqual('222');
                    });
            });
        });
        describe('when objectName doesnt exists', () => {
            it('should throw error on update', () => {
                const service = new DataObject({
                    // @ts-ignore
                    objectName: undefined,
                });

                expect(() => {
                    service.update(updateModel);
                }).toThrowError('objectName not defined');
            });
        });
    });
});
