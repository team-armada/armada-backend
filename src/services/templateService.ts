import {
  RegisterTaskDefinitionCommand,
  ListTaskDefinitionsCommand,
  DeregisterTaskDefinitionCommand,
} from '@aws-sdk/client-ecs';

import client from '../clients/ecsClient';

export interface PortSettings {
  containerPort: number;
  hostPort: number;
  protocol: string;
}

export interface IContainerSettings {
  name: string;
  image: string;
  memory: number;
  essential: boolean;
  portMappings?: PortSettings[];
  mountPoints?: IMountSettings[];
  links?: string[];
}

export interface IMountSettings {
  containerPath: string;
  sourceVolume: string;
}

export interface IContainerDefinition {
  containerDefinition: IContainerSettings[];
  family?: string;
  volumes?: IVolumes[];
  template?: string;
}

export interface IVolumes {
  efsVolumeConfiguration: {
    fileSystemId: string;
    rootDirectory: string;
  };
  name: string;
}

// {
//       efsVolumeConfiguration: {
//         fileSystemId: `${process.env.FILE_SYSTEM}`,
//         rootDirectory: `/${cohort}-${course}-${student}/coder`,
//       },
//       name: `coder`,
//     },

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
  containerDefinition: IContainerSettings[],
  family: string,
  volumes: IVolumes[]
) => {
  const input = {
    containerDefinitions: containerDefinition,
    family,
    volumes,
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
