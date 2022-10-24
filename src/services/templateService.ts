import {
  RegisterTaskDefinitionCommand,
  ListTaskDefinitionsCommand,
  DeregisterTaskDefinitionCommand,
} from '@aws-sdk/client-ecs';

import client from '../utils/ecsClient';

export interface PortSettings {
  containerPort: number;
  hostPost: number;
  protocol: string;
}

export interface ContainerSettings {
  name: string;
  image: string;
  memory: number;
  portMappings: PortSettings[];
}

export interface IContainerDefinition {
  containerDefinition: ContainerSettings[];
}

/*
Example request
input: {
	"containerDefinition": [{
		"name": "exampleContainer",
		"image": "jdguillaume/base-code-server-no-auth",
		"memory": 512,
		"portMappings": [{
			"containerPort": 8080,
			"hostPort": 8080,
			"protocol": "tcp"
		}]
	}],
	"family": "SetupCodeServer"
}
*/
export const createWorkspaceTemplate = async (
  containerDefinition: ContainerSettings[],
  family: string
) => {
  const input = {
    containerDefinitions: containerDefinition,
    family,
  };

  try {
    const command = new RegisterTaskDefinitionCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

/**
 * Get All Workspace Templates
 */
export const getAllWorkspaceTemplates = async () => {
  const input = {
    // familyPrefix: null,
    maxResults: 100,
    // nextToken: null,
    sort: 'ASC',
    status: 'ACTIVE',
  };

  try {
    const command = new ListTaskDefinitionsCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

/**
 * Deregister a workspace template
 */
export const deleteWorkspaceTemplate = async (taskDefinitionARN: string) => {
  const input = {
    taskDefinition: taskDefinitionARN,
  };

  const command = new DeregisterTaskDefinitionCommand(input);

  try {
    const data = await client.send(command);
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
};

const templateActions = {
  createWorkspaceTemplate,
  getAllWorkspaceTemplates,
  deleteWorkspaceTemplate,
};

export default templateActions;
