import { RedisDataModel } from '../repositories/RedisDataModel';
import { ObjectWithValues } from '../types';

describe('RedisDataModel', () => {
    let dataModel: RedisDataModel;

    beforeEach(() => {
        dataModel = new RedisDataModel({ url: 'redis://localhost:6379' });
        return dataModel.client.flushAll(); // Clear the Redis database before each test
    });

    afterAll(() => {
        return dataModel.client.quit(); // Close the Redis client connection after all tests
    });

    test('should store and retrieve objects correctly', async () => {
        const object: ObjectWithValues = { id: "1", values: ["a", "b", "c"] };
        await dataModel.setObject(object.id, object.values);
        expect(await dataModel.getObject(object.id)).toEqual(object.values);
    });

    test('should add values to an existing object', async () => {
        const object: ObjectWithValues = { id: "1", values: ["a", "b"] };
        await dataModel.setObject(object.id, object.values);
        await dataModel.addValueToObject(object.id, "c");
        expect(await dataModel.getObject(object.id)).toEqual(["a", "b", "c"]);
    });

    test('should update value counts correctly', async () => {
        const object1: ObjectWithValues = { id: "1", values: ["a", "b"] };
        const object2: ObjectWithValues = { id: "2", values: ["b", "c"] };
        await dataModel.setObject(object1.id, object1.values);
        await dataModel.setObject(object2.id, object2.values);
        expect(await dataModel.getValueCounts()).toEqual({ "a": 1, "b": 2, "c": 1 });
    });

    test('should update value to IDs mapping correctly', async () => {
        const object1: ObjectWithValues = { id: "1", values: ["a", "b"] };
        const object2: ObjectWithValues = { id: "2", values: ["b", "c"] };
        await dataModel.setObject(object1.id, object1.values);
        await dataModel.setObject(object2.id, object2.values);
        expect((await dataModel.getValueToIds())["b"]).toEqual(new Set(["1", "2"]));
        expect((await dataModel.getValueToIds())["a"]).toEqual(new Set(["1"]));
    });
});
