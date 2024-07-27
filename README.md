# Clustering Service with In-Memory and Redis Data Models

## Overview

This project provides a clustering service for managing objects and their associated values, leveraging both in-memory and Redis data models. It includes functionalities for adding objects, computing recommendations, and finding common values. The project also integrates linting with TSLint, testing with Jest, and continuous integration with GitHub Actions.

## Features

- Add objects and their associated values.
- Compute and update recommendations for values.
- Find the most common values associated with a target value or an object.
- In-memory and Redis-based data models.
- Continuous integration with GitHub Actions.
- Linting with TSLint.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Table of Contents](#table-of-contents)
- [Setup](#setup)
- [Usage](#usage)
- [Testing](#testing)
- [Linting](#linting)
- [Continuous Integration](#continuous-integration)
- [Contributing](#contributing)
- [License](#license)

## Setup

### Prerequisites

- Node.js (version 16.x or 18.x recommended)
- Redis (optional, for Redis data model)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ofirelarat/recommendations-api.git
   cd clustering-service
2. Install dependencies:
   ```bash
   npm install
3. Set up Redis (optional, if using Redis data model):
  - Install Redis locally or run it using Docker:
     ```bash
     docker run --name redis -p 6379:6379 -d redis:alpine

## Usage
### In-Memory Data Model
Example of using the clustering service with the in-memory data model:

```typescript
import { InMemoryDataModel } from './repositories/InMemoryDataModel';
import { ClusteringService } from './ClusteringService';

const dataModel = new InMemoryDataModel();
const clusteringService = new ClusteringService(dataModel);

// Add objects
await clusteringService.addObject({ id: '1', values: ['a', 'b', 'c'] });
await clusteringService.addObject({ id: '2', values: ['b', 'd'] });

// Add range of values
await clusteringService.addRange('1', ['d', 'e']);

// Find common values
const commonValues = await clusteringService.findMostCommonValues('a', 2);
console.log(commonValues);  // Output: ['b', 'c']
```

### Redis Data Model
Example of using the clustering service with the Redis data model:

```typescript
import Redis from 'ioredis';
import { RedisDataModel } from './repositories/RedisDataModel';
import { ClusteringService } from './ClusteringService';

const redisClient = new Redis();
const dataModel = new RedisDataModel(redisClient);
const clusteringService = new ClusteringService(dataModel);

// Add objects
await clusteringService.addObject({ id: '1', values: ['a', 'b', 'c'] });
await clusteringService.addObject({ id: '2', values: ['b', 'd'] });

// Add range of values
await clusteringService.addRange('1', ['d', 'e']);

// Find common values
const commonValues = await clusteringService.findMostCommonValues('a', 2);
console.log(commonValues);  // Output: ['b', 'c']

// Disconnect Redis
redisClient.disconnect();

```

## Testing

### Sample App
#### Running the Sample App with Docker Compose

1. Ensure Docker and Docker Compose are installed on your machine.
2. Navigate to `./sample/` dir
3. Run the following command to build and start the services:
```bash
docker-compose up --build
```
This command will build the Docker images for both the frontend and backend, start the services, and set up the necessary dependencies.

Accessing the Sample App
Backend API: The backend API will be accessible at http://localhost:5000.
Frontend Application: The frontend application will be accessible at http://localhost:3000.

If you would link to test changes in the src code using the sample app use `npm link` to create local version of the lib and run the backend manually with the new version using build & start commands

### Running Tests
To run the tests, use the following command:

```bash
npm test
```

### GitHub Actions
This project uses GitHub Actions for continuous integration. The workflow is defined in .github/workflows/test.yml.
`.github/workflows/test.yml`.

## Linting
### Running TSLint
To run TSLint, use the following command:

```bash
npm run lint
```

### TSLint Configuration

TSLint is configured in `tslint.json`. You can customize the linting rules according to your project's requirements.

## Continuous Integration
### GitHub Actions Workflow
The GitHub Actions workflow is set up to run on pull requests to the main branch. It includes steps for linting, building, and testing the project.

### Workflow File
The workflow file is located at .github/workflows/test.yml.


## Contributing
We welcome contributions to this project. To contribute:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

Please ensure your code adheres to the project's coding standards and passes all tests.


## License
This project is licensed under the MIT License. See the LICENSE file for details.