import {
  RunTaskCommand,
  StopTaskCommand,
  ListTasksCommand,
} from '@aws-sdk/client-ecs';
import client from '../utils/ecsClient';

/**
 * Get All Workspace Templates
 */

// TODO: Support filter via query string (task:group == family:lowMemory is how you search for a specific task definition).

// TODO: Make filter optional.
export const getWorkspaces = async () => {
  const input = {
    cluster: process.env.CLUSTER,
    // containerInstance,
    // desiredStatus
    // family
    // launchType
    maxResults: 100,
    // nextToken: null,
    // serviceName
    // startedBy
    status: 'ACTIVE',
  };

  try {
    const command = new ListTasksCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

/*
  Run a workspace

  example request: 
  {
    "count": 1,
    "taskDefinition": "hello_world",
    "student_id": "023jfaosdlfj"
  }
*/
export const runWorkspace = async (taskDefinitionArn: string) => {
  console.log(process.env.CLUSTER);

  const input = {
    cluster: process.env.CLUSTER,
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
 * @param {string} taskID - workspace id
 *                        - e.g. "1dc5c17a-422b-4dc4-b493-371970c6c4d6"
 * @param {string} reason - reason for stopping workspace
 */
export const stopWorkspace = async (
  taskID: string,
  reason = 'SESSION_ENDED'
) => {
  const input = {
    cluster: process.env.CLUSTER,
    reason,
    task: taskID,
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
  getWorkspaces,
  runWorkspace,
  stopWorkspace,
};

export default workspaceServiceActions;
