import { IDataModel, IdType, ValueType, GraphNode, Recommendation } from '../types';
import Redis from 'ioredis';

export class RedisDataModel implements IDataModel {
  private redis: Redis;
  private topLimit: number;

  constructor(redis: Redis, topLimit: number = 10) {
    this.redis = redis;
    this.topLimit = topLimit;
  }

  async getNode(id: IdType): Promise<GraphNode | undefined> {
    const values = await this.redis.smembers(`node:${id}:values`);
    if (values.length === 0) return undefined;
    return { id, values: new Set(values) };
  }

  async addNode(node: GraphNode): Promise<void> {
    await this.redis.sadd(`node:${node.id}:values`, ...node.values);
  }

  async addEdge(from: IdType, to: ValueType): Promise<void> {
    await this.redis.sadd(`node:${from}:values`, to);
    await this.updateOverallRecommendations(to);
  }

  async getRecommendations(value: ValueType): Promise<Recommendation[]> {
    const recommendations = await this.redis.lrange(`recommendations:${value}`, 0, -1);
    return recommendations.map(rec => JSON.parse(rec));
  }

  async updateRecommendations(value: ValueType, recommendations: Recommendation[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.del(`recommendations:${value}`);
    recommendations.forEach(rec => {
      pipeline.rpush(`recommendations:${value}`, JSON.stringify(rec));
    });
    await pipeline.exec();
  }

  async getTopOverallRecommendations(): Promise<Recommendation[]> {
    const recommendations = await this.redis.zrevrange('overallRecommendations', 0, this.topLimit - 1, 'WITHSCORES');
    const result: Recommendation[] = [];
    for (let i = 0; i < recommendations.length; i += 2) {
      result.push({ value: recommendations[i], score: parseInt(recommendations[i + 1], 10) });
    }
    return result;
  }

  private async updateOverallRecommendations(value: ValueType): Promise<void> {
    await this.redis.zincrby('overallRecommendations', 1, value);
    await this.redis.zremrangebyrank('overallRecommendations', 0, -this.topLimit - 1);
  }

  async computeRecommendations(value: ValueType): Promise<Recommendation[]> {
    const valueCounts: { [key: string]: number } = {};

    const keys = await this.redis.keys('node:*:values');
    for (const key of keys) {
      const nodeValues = await this.redis.smembers(key);
      if (nodeValues.includes(value.toString())) {
        nodeValues.forEach(val => {
          if (val !== value.toString()) {
            valueCounts[val] = (valueCounts[val] || 0) + 1;
          }
        });
      }
    }

    return Object.entries(valueCounts)
      .map(([val, score]) => ({ value: val as ValueType, score }))
      .sort((a, b) => b.score - a.score);
  }


  async getAllNodeIds(): Promise<IdType[]> {
    const keys = await this.redis.keys('node:*:values');
    return keys.map(key => key.split(':')[1]);
  }
}
