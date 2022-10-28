// This file will create services for our ECS Cluster.

import {
  CreateServiceCommand
} from '@aws-sdk/client-ecs';

import client from '../utils/ecsClient';

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

//This creates a service for a student with zero running tasks


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