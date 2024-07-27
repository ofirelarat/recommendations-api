import { ClusteringService } from '../ClusteringService';
import { InMemoryDataModel } from '../repositories/InMemoryDataModel';
import { ObjectWithValues } from '../types';

describe('ClusteringService with InMemoryDataModel', () => {
  let objects: ObjectWithValues[];
  let clusteringService: ClusteringService;

  beforeEach(() => {
    objects = [
      { id: '1', values: ['a', 'b', 'c'] },
      { id: '2', values: ['b', 'd'] },
      { id: '3', values: ['e'] },
      { id: '4', values: ['a', 'f'] },
      { id: '5', values: ['g', 'h'] },
    ];
    clusteringService = new ClusteringService(new InMemoryDataModel());
    objects.forEach(obj => clusteringService.addObject(obj));
  });

  test('should find most common values associated with a target value', async () => {
    const commonValues = await clusteringService.findMostCommonValues('a', 2);
    const commonValueNames = commonValues.map(rec => rec.value);
    expect(commonValueNames).toEqual(expect.arrayContaining(['b', 'c']));
  });

  test('should find most common values for a given ID that the object does not already have', async () => {
    const commonValuesForId = await clusteringService.findMostCommonValuesForId('1', 2);
    const commonValueNames = commonValuesForId.map(rec => rec.value);
    expect(commonValueNames).toEqual(expect.arrayContaining(['d', 'f']));
  });

  test('should find overall most common values', async () => {
    const overallCommonValues = await clusteringService.findOverallMostCommonValues();
    const overallCommonValueNames = overallCommonValues.map(rec => rec.value);
    expect(overallCommonValueNames).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  test('should add a new object and update mappings correctly', async () => {
    await clusteringService.addObject({ id: '6', values: ['a', 'i'] });
    const commonValues = await clusteringService.findMostCommonValues('a', 5);
    const commonValueNames = commonValues.map(rec => rec.value);
    expect(commonValueNames).toEqual(expect.arrayContaining(['b', 'c', 'f', 'i']));
  });

  /* tslint:disable:no-string-literal  */
  test('should add range of values to an existing object correctly', async () => {
    await clusteringService.addRange('1', ['d', 'e']);
    const node = await clusteringService['dataModel'].getNode('1');
    expect(node?.values).toEqual(new Set(['a', 'b', 'c', 'd', 'e']));
  });

  /* tslint:disable:no-string-literal  */
  test('should add range of values to a non-existing object correctly', async () => {
    await clusteringService.addRange('6', ['i', 'j']);
    const node = await clusteringService['dataModel'].getNode('6');
    expect(node?.values).toEqual(new Set(['i', 'j']));
  });
});
