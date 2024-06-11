export interface ObjectWithValues {
  id: string;
  values: string[];
}

export interface Cluster {
  objects: ObjectWithValues[];
  values: string[];
}
