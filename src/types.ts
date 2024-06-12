export type IdType = string | number;
export type ValueType = string | number;

export interface ObjectWithValues {
    id: IdType;
    values: ValueType[];
}

export interface ValueToIdsMap {
    [value: string | number]: Set<IdType>;
}

export interface ObjectsMap {
    [id: string | number]: ValueType[];
}

export interface ValueCounts {
    [value: string | number]: number;
}

export interface IDataModel {
  getObject(id: IdType): Promise<ValueType[] | undefined>;
  setObject(id: IdType, values: ValueType[]): Promise<void>;
  addValueToObject(id: IdType, value: ValueType): Promise<void>;
  getObjects(): Promise<ObjectsMap>;
  getValueToIds(): Promise<ValueToIdsMap>;
  getValueCounts(): Promise<ValueCounts>;
}