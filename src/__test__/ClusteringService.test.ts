import { ClusteringService } from '../ClusteringService';
import { ObjectWithValues } from '../types';

describe('ClusteringService', () => {
    let objects: ObjectWithValues[];

    beforeEach(() => {
        objects = [
            { id: "1", values: ["a", "b", "c"] },
            { id: "2", values: ["b", "d"] },
            { id: "3", values: ["e"] },
            { id: "4", values: ["a", "f"] },
            { id: "5", values: ["g", "h"] },
        ];
    });

    test('should initialize and map objects correctly', () => {
        const clusteringService = new ClusteringService(objects);
        expect(Object.keys(clusteringService['objects']).length).toBe(5);
        expect(Object.keys(clusteringService['valueToIds']).length).toBeGreaterThan(0);
    });

    test('should find most common values associated with a target value', () => {
        const clusteringService = new ClusteringService(objects);
        const commonValues = clusteringService.findMostCommonValues("a", 2);
        expect(commonValues).toEqual(expect.arrayContaining(["b", "c",]));
    });

    test('should find most common values for a given ID that the object does not already have', () => {
        const clusteringService = new ClusteringService(objects);
        const commonValuesForId = clusteringService.findMostCommonValuesForId("1", 2);
        expect(commonValuesForId).toEqual(expect.arrayContaining(["d", "f"]));
    });

    test('should find overall most common values', () => {
        const clusteringService = new ClusteringService(objects);
        const overallCommonValues = clusteringService.findOverallMostCommonValues(3);
        expect(overallCommonValues).toEqual(expect.arrayContaining(["a", "b", "c"]));
    });

    test('should add a new object and update mappings correctly', () => {
        const clusteringService = new ClusteringService(objects);
        clusteringService.addObject({ id: "6", values: ["a", "i"] });
        expect(Object.keys(clusteringService['objects']).length).toBe(6);
        expect(clusteringService['valueToIds']["a"].has("6")).toBe(true);
    });

    test('should handle empty object array', () => {
        const emptyObjects: ObjectWithValues[] = [];
        const clusteringService = new ClusteringService(emptyObjects);
        expect(Object.keys(clusteringService['objects']).length).toBe(0);
        expect(Object.keys(clusteringService['valueToIds']).length).toBe(0);
    });

    test('should handle object with empty values array', () => {
        const objectsWithEmptyValues: ObjectWithValues[] = [
            { id: "1", values: [] },
            { id: "2", values: ["a", "b"] },
        ];
        const clusteringService = new ClusteringService(objectsWithEmptyValues);
        expect(Object.keys(clusteringService['objects']).length).toBe(2);
        expect(Object.keys(clusteringService['valueToIds']).length).toBeGreaterThan(0);
    });
});
