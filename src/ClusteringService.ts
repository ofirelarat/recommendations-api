import { ObjectWithValues } from './types';

export class ClusteringService {
    private objects: { [id: string]: string[] } = {};
    private valueToIds: { [value: string]: Set<string> } = {};

    constructor(objects: ObjectWithValues[]) {
        objects.forEach(obj => this.addObject(obj));
    }

    /**
     * Adds a new object and updates the mappings.
     * 
     * Efficiency:
     * - Time Complexity: O(m) where m is the number of values in the new object.
     * - Space Complexity: O(n + m) where n is the number of objects and m is the number of values.
     */
    addObject(newObject: ObjectWithValues): void {
        this.objects[newObject.id] = newObject.values;
        newObject.values.forEach(value => {
            if (!this.valueToIds[value]) {
                this.valueToIds[value] = new Set();
            }
            this.valueToIds[value].add(newObject.id);
        });
    }

    /**
     * Finds the most common values associated with a target value.
     * 
     * Efficiency:
     * - Time Complexity: O(n) where n is the number of values in the cluster containing the target value.
     * - Space Complexity: O(n) for storing the value counts.
     */
    findMostCommonValues(targetValue: string, numValuesToReturn: number): string[] {
        if (!this.valueToIds[targetValue]) {
            return [];
        }

        const valueCounts: { [key: string]: number } = {};
        this.valueToIds[targetValue].forEach(id => {
            this.objects[id].forEach(value => {
                if (value !== targetValue) {
                    valueCounts[value] = (valueCounts[value] || 0) + 1;
                }
            });
        });

        const sortedValues = Object.entries(valueCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([value]) => value);

        return sortedValues.slice(0, numValuesToReturn);
    }

    /**
     * Finds the most common values for a given ID that the object does not already have.
     * 
     * Efficiency:
     * - Time Complexity: O(n) where n is the number of values in the cluster containing the target object.
     * - Space Complexity: O(n) for storing the value counts.
     */
    findMostCommonValuesForId(objectId: string, numValuesToReturn: number): string[] {
        if (!this.objects[objectId]) {
            return [];
        }

        const targetValues = new Set(this.objects[objectId]);
        const valueCounts: { [key: string]: number } = {};
        this.objects[objectId].forEach(value => {
            this.valueToIds[value].forEach(id => {
                this.objects[id].forEach(val => {
                    if (!targetValues.has(val)) {
                        valueCounts[val] = (valueCounts[val] || 0) + 1;
                    }
                });
            });
        });

        const sortedValues = Object.entries(valueCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([value]) => value);

        return sortedValues.slice(0, numValuesToReturn);
    }

    /**
     * Finds the overall most common values.
     * 
     * Efficiency:
     * - Time Complexity: O(n) where n is the number of values in all objects.
     * - Space Complexity: O(n) for storing the value counts.
     */
    findOverallMostCommonValues(limit: number): string[] {
        const valueCounts: { [key: string]: number } = {};
        Object.values(this.objects).forEach(values => {
            values.forEach(value => {
                valueCounts[value] = (valueCounts[value] || 0) + 1;
            });
        });

        const sortedValues = Object.entries(valueCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([value]) => value);

        return sortedValues.slice(0, limit);
    }
}
