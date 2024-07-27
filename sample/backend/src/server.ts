import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { InMemoryDataModel } from 'recommendations-api/dist/repositories/InMemoryDataModel';
import { ClusteringService } from 'recommendations-api/dist/ClusteringService';

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const dataModel = new InMemoryDataModel();
const clusteringService = new ClusteringService(dataModel);

app.post('/addObject', async (req, res) => {
  const { id, values } = req.body;
  await clusteringService.addObject({ id, values });
  res.sendStatus(200);
});

app.post('/addRange', async (req, res) => {
  const { id, values } = req.body;
  await clusteringService.addRange(id, values);
  res.sendStatus(200);
});

app.get('/findMostCommonValues/:value/:numValues', async (req, res) => {
  const { value, numValues } = req.params;
  const commonValues = await clusteringService.findMostCommonValues(value, parseInt(numValues, 10));
  res.json(commonValues);
});

app.get('/findMostCommonValuesForId/:id/:numValues', async (req, res) => {
  const { id, numValues } = req.params;
  const commonValues = await clusteringService.findMostCommonValuesForId(id, parseInt(numValues, 10));
  res.json(commonValues);
});

app.get('/findOverallMostCommonValues', async (req, res) => {
  const commonValues = await clusteringService.findOverallMostCommonValues();
  res.json(commonValues);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
