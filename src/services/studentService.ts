// This file will create services for our ECS Cluster.

import {
  CreateServiceCommand,
  ListServicesCommand,
  DeleteServiceCommand,
  UpdateServiceCommand
} from '@aws-sdk/client-ecs';
import { ListEventSourceMappingsCommand } from '@aws-sdk/client-lambda';

import client from '../utils/ecsClient';

//This creates a service for a student with zero running tasks
// const input = {
//   data: {
//     cluster: process.env.CLUSTER,
//     serviceName: `${cohort}-${course}-${student}`,
//     taskDefinition: `${cohort}-${course}-${student}`,
//     desiredCount: 0,
//     deploymentConfiguration: {
//       maximumPercent: 100,
//       minimumHealthyPercent: 0
//     },
//   },
// };


export const createStudentService = async (
  serviceName: string,
  taskDefinition: string
) => {
  const input = {
    cluster: process.env.CLUSTER,
    serviceName,
    taskDefinition,
    desiredCount: 0,
    deploymentConfiguration: {
      "maximumPercent": 100,
      "minimumHealthyPercent": 0
  },
  };

  try {
    const command = new CreateServiceCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

// Retrieves all student services

export const getAllStudentServices = async () => {
  const input = {
    cluster: process.env.CLUSTER,
    maxResults: 100,
    sort: 'ASC',
    status: 'ACTIVE',
  };

  try {
    const command = new ListServicesCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}

//Deletes a service

export const deleteStudentService = async (
  service: string
) => {
  const input = {
    cluster: process.env.CLUSTER,
    service
  };

  try {
    const command = new DeleteServiceCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};


// Update service; can be used when student wants to access their workspace (run a task)
export const startStudentService = async (
  service: string,
) => {
  const input = {
    cluster: process.env.CLUSTER,
    service,
    desiredCount: 1,
    deploymentConfiguration: {
      "maximumPercent": 100,
      "minimumHealthyPercent": 0
  },
  };

  try {
    const command = new UpdateServiceCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

// Update service; can be used when student exits their workspace (stops the task)
export const stopStudentService = async (
  service: string,
) => {
  const input = {
    cluster: process.env.CLUSTER,
    service,
    desiredCount: 0,
    deploymentConfiguration: {
      "maximumPercent": 100,
      "minimumHealthyPercent": 0
  },
  };

  try {
    const command = new UpdateServiceCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};