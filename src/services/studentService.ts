// This file will create services for our ECS Cluster.

import {
  CreateServiceCommand,
  ListServicesCommand,
  DeleteServiceCommand,
  UpdateServiceCommand,
  DescribeServicesCommand,
} from '@aws-sdk/client-ecs';
import { DescribeLoadBalancersCommandOutput } from '@aws-sdk/client-elastic-load-balancing-v2';

import client from '../clients/ecsClient';
import {
  createALBTargetGroup,
  retrieveALBTargetGroup,
  describeALB,
  getListener,
  createRule,
} from '../clients/elbv2Client';
import database from './databaseServices';
import { getRunningTask, stopWorkspace } from './workspaceService';

let loadBalancer: DescribeLoadBalancersCommandOutput;

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

export const describeStudentService = async (serviceName: string) => {
  const input = {
    cluster: 'ECS-Cluster',
    services: [serviceName],
  };

  try {
    const command = new DescribeServicesCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

export const createStudentService = async (
  serviceName: string,
  taskDefinition: string,
  userId: string,
  courseId: number
) => {
  if (!loadBalancer) {
    loadBalancer = await describeALB();
  }

  const DNSName = loadBalancer.LoadBalancers?.[0].DNSName;
  const loadBalancerARN = loadBalancer.LoadBalancers?.[0].LoadBalancerArn;
  const vpc = loadBalancer.LoadBalancers?.[0].VpcId;

  if (!DNSName) {
    throw new Error('ALB DNS Name could not be found.');
  }

  if (!vpc) {
    throw new Error('The VPC could not be found.');
  }

  if (!loadBalancerARN) {
    throw new Error('The load balancer could not be found.');
  }

  const listener = await getListener(loadBalancerARN);
  const defaultListenerArn = listener.Listeners?.[0].ListenerArn;

  if (!defaultListenerArn) {
    throw new Error('Listener could not be found.');
  }

  const targetGroup = await createALBTargetGroup(serviceName, vpc);

  console.log(targetGroup);

  const targetGroupARN = targetGroup.TargetGroups?.[0].TargetGroupArn;

  if (!targetGroupARN) {
    throw new Error('The Target Group could not be found.');
  }

  const makeRule = await createRule(
    defaultListenerArn,
    serviceName,
    targetGroupARN
  );

  const input = {
    cluster: 'ECS-Cluster',
    LaunchType: 'EC2',
    serviceName,
    taskDefinition,
    role: 'ecsServiceRole',
    desiredCount: 0,
    deploymentConfiguration: {
      maximumPercent: 100,
      minimumHealthyPercent: 0,
    },
    DeploymentController: 'ECS',
    SchedulingStrategy: 'REPLICA',
    loadBalancers: [
      {
        containerName: 'nginx',
        containerPort: 80,
        targetGroupARN,
      },
    ],
  };

  try {
    console.log('Entered Try Catch');
    const command = new CreateServiceCommand(input);
    const response = await client.send(command);
    console.log(response);

    const workspaceDetails = {
      uuid: serviceName,
      desiredCount: 0,
      userId,
      courseId: Number(courseId),
      // TODO: url: `http://${DNSName}/${serviceName}/?folder=/home/coder`,
    };

    if (response) {
      database.workspaceActions.createWorkspace(workspaceDetails);
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

// Retrieves all student services

// From AWS
// export const getAllStudentServices = async () => {
//   const input = {
//     cluster: 'ECS-Cluster',
//     maxResults: 100,
//     sort: 'ASC',
//     status: 'ACTIVE',
//   };

//   try {
//     const command = new ListServicesCommand(input);
//     const response = await client.send(command);
//     return response;
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       console.log(err.message);
//     }
//   }
// };

export const getAllStudentServices = async () => {
  const workspaces = await database.workspaceActions.retrieveAllWorkspaces();
  return workspaces;
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

  if (!tasks) {
    throw new Error('Response not received from AWS.');
  }

  if (tasks.length > 0) {
    throw new Error(
      `Can't delete student service. All service tasks must be in a "stopped" state.`
    );
  }

  try {
    const command = new DeleteServiceCommand(input);
    const response = await client.send(command);

    if (response) {
      database.workspaceActions.deleteWorkspace(service);
    }

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

    if (response) {
      database.workspaceActions.updateWorkspace(service, 1);
    }

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
  const stopWorkspaceResult = await stopWorkspace(service);

  try {
    const command = new UpdateServiceCommand(input);
    const response = await client.send(command);

    if (response) {
      database.workspaceActions.updateWorkspace(service, 0);
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};
