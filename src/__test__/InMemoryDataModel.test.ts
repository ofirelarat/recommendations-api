import { InMemoryDataModel } from '../repositories/InMemoryDataModel';
import { GraphNode } from '../types';

describe('InMemoryDataModel', () => {
  let dataModel: InMemoryDataModel;
  let topLimit: number;

  beforeEach(() => {
    topLimit = 5;
    dataModel = new InMemoryDataModel(topLimit);
  });

  test('should add and retrieve a node correctly', async () => {
    const node: GraphNode = { id: '1', values: new Set(['a', 'b']) };
    await dataModel.addNode(node);
    const retrievedNode = await dataModel.getNode('1');
    expect(retrievedNode).toEqual(node);
  });

  test('should add edges correctly and update overall recommendations', async () => {
    await dataModel.addEdge('1', 'a');
    await dataModel.addEdge('1', 'b');
    await dataModel.addEdge('1', 'b');
    const retrievedNode = await dataModel.getNode('1');
    expect(retrievedNode).toEqual({ id: '1', values: new Set(['a', 'b']) });

    const topRecommendations = await dataModel.getTopOverallRecommendations();

    const expectedRecommendations = [
      { value: 'b', score: 2 },
      { value: 'a', score: 1 }
    ];

    expectedRecommendations.forEach(expected => {
      const match = topRecommendations.find(rec => rec.value === expected.value && rec.score === expected.score);
      expect(match).toBeDefined();
    });
  });

  test('should compute and update recommendations correctly', async () => {
    const node: GraphNode = { id: '1', values: new Set(['a', 'b']) };
    await dataModel.addNode(node);
    await dataModel.addEdge('1', 'a');
    await dataModel.addEdge('1', 'b');
    const recommendations = await dataModel.computeRecommendations('a');
    await dataModel.updateRecommendations('a', recommendations);
    const retrievedRecommendations = await dataModel.getRecommendations('a');
    expect(retrievedRecommendations).toEqual([{ value: 'b', score: 1 }]);
  });

  test('should maintain the heap size within the top limit', async () => {
    const values = ['a', 'b', 'c', 'd', 'e', 'f'];
    for (const [index, value] of values.entries()) {
      await dataModel.addEdge(index.toString(), value);
    }
    const topRecommendations = await dataModel.getTopOverallRecommendations();
    expect(topRecommendations).toHaveLength(topLimit);
  });
});
