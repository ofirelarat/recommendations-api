import { createClient, RedisClientType } from 'redis';
import { promisify } from 'util';
import { IDataModel, IdType, ValueType, ObjectsMap, ValueToIdsMap, ValueCounts } from '../types';

export class RedisDataModel implements IDataModel {
    public client: RedisClientType;
    private getAsync: (key: string) => Promise<string | null>;
    private setAsync: (key: string, value: string) => Promise<string>;
    private getallAsync: (key: string) => Promise<{ [key: string]: string }>;

    constructor(redisConfig: any) {
        this.client = createClient(redisConfig);
        this.client.connect().catch(console.error);
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.getallAsync = promisify(this.client.hGetAll).bind(this.client);
    }

    async getObject(id: IdType): Promise<ValueType[] | undefined> {
        const result = await this.getAsync(`object:${id}`);
        return result ? JSON.parse(result) : undefined;
    }

    async setObject(id: IdType, values: ValueType[]): Promise<void> {
        await this.setAsync(`object:${id}`, JSON.stringify(values));
        for (const value of values) {
            await this.client.sAdd(`valueToIds:${value}`, id.toString());
            await this.client.hIncrBy(`valueCounts`, value.toString(), 1);
        }
    }

    async addValueToObject(id: IdType, value: ValueType): Promise<void> {
        const existingValues = await this.getObject(id);
        if (!existingValues) {
            await this.setObject(id, [value]);
            return;
        }

        if (!existingValues.includes(value)) {
            existingValues.push(value);
            await this.setAsync(`object:${id}`, JSON.stringify(existingValues));
            await this.client.sAdd(`valueToIds:${value}`, id.toString());
            await this.client.hIncrBy(`valueCounts`, value.toString(), 1);
        }
    }

    async getObjects(): Promise<ObjectsMap> {
        const result = await this.getallAsync('objects');
        const objects: ObjectsMap = {};
        for (const [key, value] of Object.entries(result)) {
            objects[key] = JSON.parse(value);
        }
        return objects;
    }

    async getValueToIds(): Promise<ValueToIdsMap> {
        const keys = await this.client.keys('valueToIds:*');
        const valueToIds: ValueToIdsMap = {};
        for (const key of keys) {
            const value = key.split(':')[1];
            const ids = await this.client.sMembers(key);
            valueToIds[value] = new Set(ids.map(id => (isNaN(Number(id)) ? id : Number(id))));
        }
        return valueToIds;
    }

    async getValueCounts(): Promise<ValueCounts> {
        const result = await this.getallAsync('valueCounts');
        const valueCounts: ValueCounts = {};
        for (const [key, value] of Object.entries(result)) {
            valueCounts[key] = parseInt(value, 10);
        }
        return valueCounts;
    }
}
