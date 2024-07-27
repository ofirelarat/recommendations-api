import { IDataModel, IdType, ValueType, Graph, GraphNode, Recommendation } from '../types';
import Heap from 'heap';

export class InMemoryDataModel implements IDataModel {
  private graph: Graph = {};
  private recommendations: { [key: string]: Recommendation[] } = {};
  private overallRecommendationsHeap: Heap<[ValueType, number]> = new Heap((a, b) => a[1] - b[1]);
  private overallRecommendationMap: { [key: string]: number } = {};
  private topLimit: number;

  constructor(topLimit: number = 10) {
    this.topLimit = topLimit;
  }

  async getNode(id: IdType): Promise<GraphNode | undefined> {
    return this.graph[id];
  }

  async addNode(node: GraphNode): Promise<void> {
    this.graph[node.id] = node;
  }

  async addEdge(from: IdType, to: ValueType): Promise<void> {
    if (!this.graph[from]) {
      this.graph[from] = { id: from, values: new Set() };
    }
    this.graph[from].values.add(to);
    await this.updateOverallRecommendations(to);
  }

  async getRecommendations(value: ValueType): Promise<Recommendation[]> {
    return this.recommendations[value] || [];
  }

  async updateRecommendations(value: ValueType, recommendations: Recommendation[]): Promise<void> {
    this.recommendations[value] = recommendations;
  }

  async getTopOverallRecommendations(): Promise<Recommendation[]> {
    const result: Recommendation[] = [];
    const heapCopy = this.overallRecommendationsHeap.copy();

    while (heapCopy.size() > 0 && result.length < this.topLimit) {
      const [value, score] = heapCopy.pop()!;
      result.push({ value, score });
    }

    return result.reverse();
  }

  private async updateOverallRecommendations(value: ValueType): Promise<void> {
    if (this.overallRecommendationMap[value] === undefined) {
      this.overallRecommendationMap[value] = 0;
    }
    this.overallRecommendationMap[value] += 1;

    const count = this.overallRecommendationMap[value];

    // Remove the old value if it exists
    const newHeap = new Heap<[ValueType, number]>((a, b) => a[1] - b[1]);
    let found = false;

    while (!this.overallRecommendationsHeap.empty()) {
      const [heapValue, heapCount] = this.overallRecommendationsHeap.pop()!;
      if (heapValue === value) {
        found = true;
        newHeap.push([value, count]);
      } else {
        newHeap.push([heapValue, heapCount]);
      }
    }

    if (!found) {
      newHeap.push([value, count]);
    }

    // Limit the size of the heap
    while (newHeap.size() > this.topLimit) {
      newHeap.pop();
    }

    this.overallRecommendationsHeap = newHeap;
  }

  /* tslint:disable:forin */
  async computeRecommendations(value: ValueType): Promise<Recommendation[]> {
    const valueCounts: { [key: string]: number } = {};

    // Iterate through all nodes in the graph
    for (const nodeId in this.graph) {
      const node = this.graph[nodeId];
      if (node.values.has(value)) {
        node.values.forEach(val => {
          if (val !== value) {
            valueCounts[val] = (valueCounts[val] || 0) + 1;
          }
        });
      }
    }

    return Object.entries(valueCounts)
      .map(([val, score]) => ({ value: val as ValueType, score }))
      .sort((a, b) => b.score - a.score);
  }
}
