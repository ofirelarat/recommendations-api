import { IDataModel, IdType, ValueType, ObjectsMap, ValueToIdsMap, ValueCounts } from '../types';

export class InMemoryDataModel implements IDataModel {
  private objects: ObjectsMap = {};
  private valueToIds: ValueToIdsMap = {};
  private valueCounts: ValueCounts = {};

  getObject(id: IdType): Promise<ValueType[] | undefined> {
    return new Promise((resolve, reject) => {
      resolve(this.objects[id]);
    })
  }

  async setObject(id: IdType, values: ValueType[]): Promise<void> {
    this.objects[id] = values;
    values.forEach(value => {
      if (!this.valueToIds[value]) {
        this.valueToIds[value] = new Set();
      }
      this.valueToIds[value].add(id);
      this.valueCounts[value] = (this.valueCounts[value] || 0) + 1;
    });
  }

  async addValueToObject(id: IdType, value: ValueType): Promise<void> {
    if (!this.objects[id]) {
      this.setObject(id, [value]);
      return;
    }

    const existingValues = this.objects[id];
    if (!existingValues.includes(value)) {
      existingValues.push(value);
      if (!this.valueToIds[value]) {
        this.valueToIds[value] = new Set();
      }
      this.valueToIds[value].add(id);
      this.valueCounts[value] = (this.valueCounts[value] || 0) + 1;
    }
  }

  getObjects(): Promise<ObjectsMap> {
    return new Promise((resolve, reject) => {
      resolve(this.objects);
    })
  }

  getValueToIds(): Promise<ValueToIdsMap> {
    return new Promise((resolve, reject) => {
      resolve(this.valueToIds);
    })
  }

  getValueCounts(): Promise<ValueCounts> {
    return new Promise((resolve, reject) => {
      resolve(this.valueCounts);
    })
  }
}
