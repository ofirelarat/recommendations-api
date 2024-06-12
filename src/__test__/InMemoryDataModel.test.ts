import { InMemoryDataModel } from '../repositories/InMemoryDataModel';
import { ObjectWithValues } from '../types';

describe('InMemoryDataModel', () => {
    let dataModel: InMemoryDataModel;

    beforeEach(() => {
        dataModel = new InMemoryDataModel();
    });

    test('should store and retrieve objects correctly', async () => {
        const object: ObjectWithValues = { id: "1", values: ["a", "b", "c"] };
        dataModel.setObject(object.id, object.values);
        expect(await dataModel.getObject(object.id)).toEqual(object.values);
    });

    test('should add values to an existing object', async () => {
        const object: ObjectWithValues = { id: "1", values: ["a", "b"] };
        dataModel.setObject(object.id, object.values);
        dataModel.addValueToObject(object.id, "c");
        expect(await dataModel.getObject(object.id)).toEqual(["a", "b", "c"]);
    });

    test('should update value counts correctly', async () => {
        const object1: ObjectWithValues = { id: "1", values: ["a", "b"] };
        const object2: ObjectWithValues = { id: "2", values: ["b", "c"] };
        dataModel.setObject(object1.id, object1.values);
        dataModel.setObject(object2.id, object2.values);
        expect(await dataModel.getValueCounts()).toEqual({ "a": 1, "b": 2, "c": 1 });
    });

    test('should update value to IDs mapping correctly', async () => {
        const object1: ObjectWithValues = { id: "1", values: ["a", "b"] };
        const object2: ObjectWithValues = { id: "2", values: ["b", "c"] };
        await dataModel.setObject(object1.id, object1.values);
        await dataModel.setObject(object2.id, object2.values);

        const bValueToIds = (await dataModel.getValueToIds())["b"]
        expect(bValueToIds).toEqual(new Set(["1", "2"]));
        const aValueToIds = (await dataModel.getValueToIds())["a"]
        expect(aValueToIds).toEqual(new Set(["1"]));
    });
});
