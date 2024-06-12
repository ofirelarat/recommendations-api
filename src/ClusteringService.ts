import { ObjectWithValues, IDataModel, IdType, ValueType, ValueToIdsMap, ObjectsMap } from './types';

export class ClusteringService {
  private dataModel: IDataModel;

  constructor(dataModel: IDataModel) {
    this.dataModel = dataModel;
  }

  /**
   * Adds a new object and updates the mappings.
   * 
   * Efficiency:
   * - Time Complexity: O(m) where m is the number of values in the new object.
   * - Space Complexity: O(n + m) where n is the number of objects and m is the number of values.
   */
  async addObject(newObject: ObjectWithValues): Promise<void> {
    await this.dataModel.setObject(newObject.id, newObject.values);
  }

  /**
   * Adds an array of values to an existing key. If the key does not exist, it uses addObject.
   * 
   * Efficiency:
   * - Time Complexity: O(m) where m is the number of values being added.
   * - Space Complexity: O(m) for adding the values.
   */
  async addRange(id: IdType, values: ValueType[]): Promise<void> {
    for (const value of values) {
      await this.dataModel.addValueToObject(id, value);
    }
  }

  /**
   * Finds the most common values associated with a target value.
   * 
   * Efficiency:
   * - Time Complexity: O(n) where n is the number of values in the cluster containing the target value.
   * - Space Complexity: O(n) for storing the value counts.
   */
  async findMostCommonValues(targetValue: ValueType, numValuesToReturn: number): Promise<ValueType[]> {
    const valueToIds = await this.dataModel.getValueToIds();
    const objects = await this.dataModel.getObjects();
    return this.findCommonValues(valueToIds, objects, targetValue, numValuesToReturn, targetValue);
  }

  /**
   * Finds the most common values for a given ID that the object does not already have.
   * 
   * Efficiency:
   * - Time Complexity: O(n) where n is the number of values in the cluster containing the target object.
   * - Space Complexity: O(n) for storing the value counts.
   */
  async findMostCommonValuesForId(objectId: IdType, numValuesToReturn: number): Promise<ValueType[]> {
    const targetObject = await this.dataModel.getObject(objectId);
    if (!targetObject) {
      return [];
    }

    const targetValues = new Set(targetObject);
    const valueToIds = await this.dataModel.getValueToIds();
    const objects = await this.dataModel.getObjects();
    return this.findCommonValues(valueToIds, objects, targetValues, numValuesToReturn, targetValues);
  }

  /**
   * Helper method to find common values.
   * 
   * Efficiency:
   * - Time Complexity: O(n) where n is the number of values in the cluster containing the target.
   * - Space Complexity: O(n) for storing the value counts.
   */
  private findCommonValues(
    valueToIds: ValueToIdsMap,
    objects: ObjectsMap,
    target: IdType | Set<ValueType>,
    numValuesToReturn: number,
    excludeValues: IdType | Set<ValueType>
  ): ValueType[] {
    const isTargetValue = typeof target === 'string' || typeof target === 'number';
    const targetValues = isTargetValue ? valueToIds[target] : new Set<IdType>();

    if (!targetValues) {
      return [];
    }

    const valueCounts: { [key: string]: number } = {};

    const updateCounts = (values: ValueType[]) => {
      values.forEach(value => {
        if (!(excludeValues instanceof Set && excludeValues.has(value)) && value !== excludeValues) {
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        }
      });
    };

    if (isTargetValue) {
      valueToIds[target].forEach(id => updateCounts(objects[id]));
    } else {
      (target as Set<ValueType>).forEach(value => {
        valueToIds[value].forEach(id => updateCounts(objects[id]));
      });
    }

    const sortedValues = Object.entries(valueCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([value]) => value);

    return sortedValues.slice(0, numValuesToReturn);
  }

  /**
   * Finds the overall most common values.
   * 
   * Efficiency:
   * - Time Complexity: O(n log n) where n is the number of unique values.
   * - Space Complexity: O(n) for storing the sorted values.
   */
  async findOverallMostCommonValues(limit: number): Promise<ValueType[]> {
    const valueCounts = await this.dataModel.getValueCounts();
    const sortedValues = Object.entries(valueCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([value]) => value);

    return sortedValues.slice(0, limit);
  }
}
