import { ObjectWithValues, IDataModel, IdType, ValueType, Recommendation } from './types';

export class ClusteringService {
  private dataModel: IDataModel;

  constructor(dataModel: IDataModel, private topLimit: number = 10) {
    this.dataModel = dataModel;
  }

  /**
   * Adds a new object and updates the mappings.
   * 
   * Efficiency:
   * - Time Complexity: O(m) where m is the number of values in the new object.
   * - Space Complexity: O(n + m) where n is the number of objects and m is the number of values.
   * 
   * @param {ObjectWithValues} newObject - The new object to add.
   * @returns {Promise<void>}
   */
  async addObject(newObject: ObjectWithValues): Promise<void> {
    const node = { id: newObject.id, values: new Set(newObject.values) };
    await this.dataModel.addNode(node);
    for (const value of newObject.values) {
      await this.dataModel.addEdge(newObject.id, value);
    }
    for (const value of newObject.values) {
      const recommendations = await this.dataModel.getRecommendations(value);
      if (recommendations.length === 0 || !recommendations.some(x => newObject.values.includes(x.value))) {
        const computedRecs = await this.dataModel.computeRecommendations(value);
        await this.dataModel.updateRecommendations(value, computedRecs);
      }
    }
  }

  /**
   * Adds an array of values to an existing key. If the key does not exist, it uses addObject.
   * 
   * Efficiency:
   * - Time Complexity: O(m) where m is the number of values being added.
   * - Space Complexity: O(m) for adding the values.
   * 
   * @param {IdType} id - The ID of the existing key.
   * @param {ValueType[]} values - The values to add.
   * @returns {Promise<void>}
   */
  async addRange(id: IdType, values: ValueType[]): Promise<void> {
    let node = await this.dataModel.getNode(id);
    if (!node) {
      node = { id, values: new Set() };
    }
    for (const value of values) {
      node.values.add(value);
      await this.dataModel.addEdge(id, value);
    }
    await this.dataModel.addNode(node);
    for (const value of values) {
      const recommendations = await this.dataModel.getRecommendations(value);
      if (recommendations.length === 0) {
        const computedRecs = await this.dataModel.computeRecommendations(value);
        await this.dataModel.updateRecommendations(value, computedRecs);
      }
    }
  }

  /**
   * Finds the most common values associated with a target value.
   * 
   * Efficiency:
   * - Time Complexity: O(1) due to direct access to precomputed recommendations.
   * 
   * @param {ValueType} targetValue - The target value to find recommendations for.
   * @param {number} numValuesToReturn - The number of recommendations to return.
   * @returns {Promise<ValueType[]>} - The list of most common values.
   */
  async findMostCommonValues(targetValue: ValueType, numValuesToReturn: number): Promise<ValueType[]> {
    const recommendations = await this.dataModel.getRecommendations(targetValue);
    if (!recommendations) {
      return [];
    }
    return recommendations.slice(0, numValuesToReturn).map(rec => rec.value);
  }

  /**
   * Finds the most common values for a given ID that the object does not already have.
   * 
   * Efficiency:
   * - Time Complexity: O(1) due to direct access to precomputed recommendations.
   * 
   * @param {IdType} objectId - The ID of the object to find recommendations for.
   * @param {number} numValuesToReturn - The number of recommendations to return.
   * @returns {Promise<ValueType[]>} - The list of most common values not already associated with the object.
   */
  async findMostCommonValuesForId(objectId: IdType, numValuesToReturn: number): Promise<ValueType[]> {
    const targetObject = await this.dataModel.getNode(objectId);
    if (!targetObject) {
      return [];
    }

    const targetValues = new Set(targetObject.values);
    const recommendations: ValueType[] = [];
    for (const value of targetObject.values) {
      const recs = await this.dataModel.getRecommendations(value);
      if (recs) {
        for (const rec of recs) {
          if (!targetValues.has(rec.value) && !recommendations.includes(rec.value)) {
            recommendations.push(rec.value);
          }
        }
      }
    }

    return recommendations.slice(0, numValuesToReturn);
  }

  /**
   * Finds the overall most common values.
   * 
   * Efficiency:
   * - Time Complexity: O(1) for accessing precomputed data.
   * - Space Complexity: O(k) for storing the top values.
   * 
   * @returns {Promise<ValueType[]>} - The list of overall most common values.
   */
  async findOverallMostCommonValues(): Promise<ValueType[]> {
    const recommendations = await this.dataModel.getTopOverallRecommendations();
    return recommendations.map(rec => rec.value);
  }
}
