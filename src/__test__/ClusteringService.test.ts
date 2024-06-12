import { ClusteringService } from '../ClusteringService';
import { InMemoryDataModel } from '../repositories/InMemoryDataModel';
import { RedisDataModel } from '../repositories/RedisDataModel';
import { ObjectWithValues } from '../types';

describe('ClusteringService with InMemoryDataModel', () => {
    let objects: ObjectWithValues[];
    let clusteringService: ClusteringService;

    beforeEach(() => {
        objects = [
            { id: "1", values: ["a", "b", "c"] },
            { id: "2", values: ["b", "d"] },
            { id: "3", values: ["e"] },
            { id: "4", values: ["a", "f"] },
            { id: "5", values: ["g", "h"] },
        ];
        clusteringService = new ClusteringService(new InMemoryDataModel());
        objects.forEach(obj => clusteringService.addObject(obj));
    });

    test('should find most common values associated with a target value', async () => {
        const commonValues = await clusteringService.findMostCommonValues("a", 2);
        expect(commonValues).toEqual(expect.arrayContaining(["b", "c",]));
    });

    test('should find most common values for a given ID that the object does not already have', async () => {
        const commonValuesForId = await clusteringService.findMostCommonValuesForId("1", 2);
        expect(commonValuesForId).toEqual(expect.arrayContaining(["d", "f"]));
    });

    test('should find overall most common values', async () => {
        const overallCommonValues = await clusteringService.findOverallMostCommonValues(3);
        expect(overallCommonValues).toEqual(expect.arrayContaining(["a", "b", "c"]));
    });

    test('should add a new object and update mappings correctly', async () => {
        await clusteringService.addObject({ id: "6", values: ["a", "i"] });
        const commonValues = await clusteringService.findMostCommonValues("a", 5);
        expect(commonValues).toEqual(expect.arrayContaining(["b", "c", "f", "i"]));
    });

    test('should add range of values to an existing object correctly', async () => {
        await clusteringService.addRange("1", ["d", "e"]);
        const object = await clusteringService['dataModel'].getObject("1");
        expect(object).toEqual(expect.arrayContaining(["a", "b", "c", "d", "e"]));
    });

    test('should add range of values to a non-existing object correctly', async () => {
        await clusteringService.addRange("6", ["i", "j"]);
        const object = await clusteringService['dataModel'].getObject("6");
        expect(object).toEqual(expect.arrayContaining(["i", "j"]));
    });
});

describe('ClusteringService with RedisDataModel', () => {
    let objects: ObjectWithValues[];
    let clusteringService: ClusteringService;
    let redisDataModel: RedisDataModel;

    beforeEach(async () => {
        redisDataModel = new RedisDataModel({ url: 'redis://localhost:6379' });
        await redisDataModel.client.flushAll();
        clusteringService = new ClusteringService(redisDataModel);
        
        objects = [
            { id: "1", values: ["a", "b", "c"] },
            { id: "2", values: ["b", "d"] },
            { id: "3", values: ["e"] },
            { id: "4", values: ["a", "f"] },
            { id: "5", values: ["g", "h"] },
        ];
        await Promise.all(objects.map(obj => clusteringService.addObject(obj)));
    });

    afterAll(() => {
        return redisDataModel.client.quit();
    });

    test('should find most common values associated with a target value', async () => {
        const commonValues = await clusteringService.findMostCommonValues("a", 2);
        expect(commonValues).toEqual(expect.arrayContaining(["b", "c", "f"]));
    });

    test('should find most common values for a given ID that the object does not already have', async () => {
        const commonValuesForId = await clusteringService.findMostCommonValuesForId("1", 2);
        expect(commonValuesForId).toEqual(expect.arrayContaining(["d", "f"]));
    });

    test('should find overall most common values', async () => {
        const overallCommonValues = await clusteringService.findOverallMostCommonValues(3);
        expect(overallCommonValues).toEqual(expect.arrayContaining(["a", "b", "c"]));
    });

    test('should add a new object and update mappings correctly', async () => {
        await clusteringService.addObject({ id: "6", values: ["a", "i"] });
        const commonValues = await clusteringService.findMostCommonValues("a", 5);
        expect(commonValues).toEqual(expect.arrayContaining(["b", "c", "f", "i"]));
    });

    test('should add range of values to an existing object correctly', async () => {
        await clusteringService.addRange("1", ["d", "e"]);
        const object = await redisDataModel.getObject("1");
        expect(object).toEqual(expect.arrayContaining(["a", "b", "c", "d", "e"]));
    });

    test('should add range of values to a non-existing object correctly', async () => {
        await clusteringService.addRange("6", ["i", "j"]);
        const object = await redisDataModel.getObject("6");
        expect(object).toEqual(expect.arrayContaining(["i", "j"]));
    });
});
