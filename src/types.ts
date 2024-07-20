export type IdType = string | number;
export type ValueType = string | number;

export interface ObjectWithValues {
    id: IdType;
    values: ValueType[];
}

export interface Recommendation {
    value: ValueType;
    score: number;
}

export interface GraphNode {
    id: IdType;
    values: Set<ValueType>;
}

export interface Graph {
    [id: string]: GraphNode;
    [id: number]: GraphNode;
}

export interface IDataModel {
  getNode(id: IdType): Promise<GraphNode | undefined>;
  addNode(node: GraphNode): Promise<void>;
  addEdge(from: IdType, to: ValueType): Promise<void>;
  getRecommendations(value: ValueType): Promise<Recommendation[]>;
  getTopOverallRecommendations(): Promise<Recommendation[]>;
  updateRecommendations(value: ValueType, recommendations: Recommendation[]): Promise<void>;
  computeRecommendations(value: ValueType): Promise<Recommendation[]>;
  getAllNodeIds(): Promise<IdType[]>;
}


