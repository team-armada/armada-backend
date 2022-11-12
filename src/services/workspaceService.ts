import {
  RunTaskCommand,
  StopTaskCommand,
  ListTasksCommand,
} from '@aws-sdk/client-ecs';
import client from '../clients/ecsClient';

/**
 * Get All Workspace Templates
 */
export const getRunningTask = async (serviceName: string) => {
  const input = {
    cluster: 'ECS-Cluster',
    // containerInstance,
    // desiredStatus
    // family
    // launchType
    maxResults: 100,
    // nextToken: null,
    serviceName,
    // startedBy
    status: 'ACTIVE',
  };

  try {
    const command = new ListTasksCommand(input);
    const response = await client.send(command);

    if (!response) {
      throw new Error('No response received from AWS.');
    }

    const runningTasks = response?.taskArns;

    if (!runningTasks) {
      throw new Error('The service you provided does not exist.');
    }

    return runningTasks;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

/*
  Run a workspace
*/
export const runWorkspace = async (taskDefinitionArn: string) => {
  const input = {
    cluster: 'ECS-Cluster',
    taskDefinition: taskDefinitionArn,
    count: 1,
  };

  const command = new RunTaskCommand(input);

  try {
    const data = await client.send(command);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

/**
 * Stop a workspace
 * @param {string} service - service name
 *                        - e.g. "1dc5c17a-422b-4dc4-b493-371970c6c4d6"
 * @param {string} reason - reason for stopping workspace
 */
export const stopWorkspace = async (
  service: string,
  reason = 'SESSION_ENDED'
) => {
  const taskID = await getRunningTask(service);

  if (!taskID) {
    throw new Error('No tasks were found for the provided service.');
  }

  const input = {
    cluster: 'ECS-Cluster',
    reason,
    task: taskID[0],
  };

  const command = new StopTaskCommand(input);

  try {
    const data = await client.send(command);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
};

const workspaceServiceActions = {
  getRunningTask,
  runWorkspace,
  stopWorkspace,
};

export default workspaceServiceActions;
