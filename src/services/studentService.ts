// This file will create services for our ECS Cluster.

import {
  CreateServiceCommand,
  ListServicesCommand,
  DeleteServiceCommand,
  UpdateServiceCommand,
} from '@aws-sdk/client-ecs';

import client from '../clients/ecsClient';
import {retrieveALBTargetGroup} from '../clients/elbv2Client'
import { getRunningTask, stopWorkspace } from './workspaceService';

let targetGroupArn: string;

// import { stopWorkspace } from './workspaceService';

//This creates a service for a student with zero running tasks
// const input = {
//   data: {
//     cluster: 'ECS-Cluster',
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
  if (!targetGroupArn){
    targetGroupArn = await retrieveALBTargetGroup();

  }

  const input = {
    cluster: 'ECS-Cluster',
    LaunchType: 'EC2',
    serviceName,
    taskDefinition,
    desiredCount: 0,
    deploymentConfiguration: {
      maximumPercent: 100,
      minimumHealthyPercent: 0,
    },
    DeploymentController: 'ECS',
    SchedulingStrategy: 'REPLICA',
    loadBalancers: [{
      containerName: 'code-server',
      containerPort: 8080,
      targetGroupArn,
    }]
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
    cluster: 'ECS-Cluster',
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
};

//Deletes a service

export const deleteStudentService = async (service: string) => {
  const input = {
    cluster: 'ECS-Cluster',
    service,
  };

  // if the service has any running tasks, throw an error.
  // Retrieve running tasks for a service
  const tasks = await getRunningTask(service);

  if (!tasks){
    throw new Error('Response not received from AWS.')
  }

  if (tasks.length > 0){
    throw new Error(`Can't delete student service. All service tasks must be in a "stopped" state.`)
  }

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
export const startStudentService = async (service: string) => {
  const input = {
    cluster: 'ECS-Cluster',
    service,
    desiredCount: 1,
    deploymentConfiguration: {
      maximumPercent: 100,
      minimumHealthyPercent: 0,
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
export const stopStudentService = async (service: string) => {
  const input = {
    cluster: 'ECS-Cluster',
    service,
    desiredCount: 0,
    deploymentConfiguration: {
      maximumPercent: 100,
      minimumHealthyPercent: 0,
    },
  };

  // We need to stop any running tasks within that service.
  const stopWorkspaceResult= await stopWorkspace(service);

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
