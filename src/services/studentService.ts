// This file will create services for our ECS Cluster.

import {
  CreateServiceCommand,
  DeleteServiceCommand,
  UpdateServiceCommand,
  DescribeServicesCommand,
  CreateServiceCommandInput,
} from '@aws-sdk/client-ecs';
import { DescribeLoadBalancersCommandOutput } from '@aws-sdk/client-elastic-load-balancing-v2';

import client from '../clients/ecsClient';
import {
  createALBTargetGroup,
  describeALB,
  getListener,
  createRule,
} from '../clients/elbv2Client';
import database from './databaseServices';
import { getRunningTask, stopWorkspace } from './workspaceService';

let loadBalancer: DescribeLoadBalancersCommandOutput;

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
  const defaultActions = listener.Listeners?.[0].DefaultActions;
  const defaultListenerArn = listener.Listeners?.[0].ListenerArn;

  if (!defaultListenerArn) {
    throw new Error('Listener could not be found.');
  }

  if (!defaultActions) {
    throw new Error('Unable to fetch target groups.');
  }

  const targetGroup = await createALBTargetGroup(
    serviceName,
    vpc,
    loadBalancerARN
  );

  const targetGroupArn = targetGroup.TargetGroups?.[0].TargetGroupArn;

  if (!targetGroupArn) {
    throw new Error('The Target Group could not be found.');
  }

  await createRule(defaultListenerArn, serviceName, targetGroupArn);

  const input: CreateServiceCommandInput = {
    cluster: 'ECS-Cluster',
    launchType: 'EC2',
    serviceName,
    taskDefinition,
    desiredCount: 0,
    deploymentConfiguration: {
      maximumPercent: 100,
      minimumHealthyPercent: 0,
    },
    deploymentController: { type: 'ECS' },
    schedulingStrategy: 'REPLICA',
    loadBalancers: [
      {
        targetGroupArn: targetGroupArn,
        containerName: 'nginx',
        containerPort: 80,
      },
    ],
  };

  try {
    const command = new CreateServiceCommand(input);
    const response = await client.send(command);

    const workspaceDetails = {
      uuid: serviceName,
      desiredCount: 0,
      userId,
      courseId: Number(courseId),
      website: `http://${DNSName}/${serviceName}/?folder=/home/coder`,
    };

    if (response) {
      database.workspaceActions.createWorkspace(workspaceDetails);
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err);
      console.log(err.message);
      return err.message;
    }
  }
};

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
