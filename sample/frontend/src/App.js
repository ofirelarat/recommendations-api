import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { WithContext as ReactTags } from 'react-tag-input';
import { JsonView, allExpanded, darkStyles, defaultStyles } from 'react-json-view-lite';
import './App.css';
import 'react-json-view-lite/dist/index.css';

const API_URL = 'http://localhost:5000';

const KeyCodes = {
  comma: 188,
  enter: 13
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

function App() {
  const [objectId, setObjectId] = useState('');
  const [tags, setTags] = useState([]);
  const [results, setResults] = useState(null);
  const [chartData, setChartData] = useState([]);

  const handleDelete = (i) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag) => {
    setTags([...tags, tag]);
  };

  const addObject = async () => {
    await axios.post(`${API_URL}/addObject`, { id: objectId, values: tags.map(tag => tag.text) });
    alert('Object added');
  };

  const addRange = async () => {
    await axios.post(`${API_URL}/addRange`, { id: objectId, values: tags.map(tag => tag.text) });
    alert('Values added to object');
  };

  const findMostCommonValues = async () => {
    const response = await axios.get(`${API_URL}/findMostCommonValues/${tags[0].text}/5`);
    setResults(response.data);
    setChartData(response.data.map(rec => ({ name: rec.value, score: rec.score })));
  };

  const findMostCommonValuesForId = async () => {
    const response = await axios.get(`${API_URL}/findMostCommonValuesForId/${objectId}/5`);
    setResults(response.data);
    setChartData(response.data.map(rec => ({ name: rec.value, score: rec.score })));
  };

  const findOverallMostCommonValues = async () => {
    const response = await axios.get(`${API_URL}/findOverallMostCommonValues`);
    setResults(response.data);
    setChartData(response.data.map(rec => ({ name: rec.value, score: rec.score })));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clustering Service Visualization</h1>
        <div className='container'>
          <div className='input-container'>
            <input
              type="text"
              placeholder="Object ID"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
            />
            <ReactTags
              tags={tags}
              delimiters={delimiters}
              handleDelete={handleDelete}
              handleAddition={handleAddition}
              inputFieldPosition="top"
              placeholder="Enter values and press enter"
              classNames={{
                tags: 'ReactTags__tags',
                tagInput: 'ReactTags__tagInput',
                tagInputField: 'ReactTags__tagInput input',
                selected: 'ReactTags__selected',
                tag: 'ReactTags__tag',
                remove: 'ReactTags__remove'
              }}
            />
            <button onClick={addObject}>Add Object</button>
            <button onClick={addRange}>Add Range</button>
          </div>
          <button onClick={findMostCommonValues}>Find Most Common Values</button>
          <button onClick={findMostCommonValuesForId}>Find Most Common Values for ID</button>
          <button onClick={findOverallMostCommonValues}>Find Overall Most Common Values</button>
        </div>
        {results && (
          <div>
            <hr />
            <h2>Results</h2>
            <div className='results-container'>
              <JsonView data={results} shouldExpandNode={allExpanded} style={darkStyles} />
              <BarChart
                width={600}
                height={300}
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" />
              </BarChart>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
