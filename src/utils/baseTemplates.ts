import { IContainerDefinition } from '../services/templateService';

export interface IBaseTemplate {
  definition: IContainerDefinition;
  name: string;
}

// http://localhost/?folder=/home/root
export const coderServerOnly: IBaseTemplate = {
  definition: {
    containerDefinition: [
      {
        name: 'nginx',
        image: 'jdguillaume/nginx-armada',
        memory: 256,
        essential: true,
        portMappings: [
          {
            hostPort: 0,
            containerPort: 80,
            protocol: 'tcp',
          },
        ],
        links: ['code-server'],
      },
      {
        name: 'code-server',
        image: 'jdguillaume/base-code-server-no-auth',
        memory: 512,
        essential: true,
        mountPoints: [
          {
            containerPath: '/home/coder',
            sourceVolume: `coder`,
          },
        ],
      },
    ],
  },
  name: 'codeServerOnly',
};

export const codeServerPG: IBaseTemplate = {
  definition: {
    containerDefinition: [
      {
        name: 'nginx',
        image: 'jdguillaume/nginx-armada',
        memory: 256,
        essential: true,
        portMappings: [
          {
            hostPort: 0,
            containerPort: 80,
            protocol: 'tcp',
          },
        ],
        links: ['code-server'],
      },
      {
        name: 'code-server',
        image: 'jdguillaume/base-code-server-no-auth',
        memory: 512,
        essential: true,
        mountPoints: [
          {
            containerPath: '/home/coder',
            sourceVolume: `coder`,
          },
        ],
      },
      {
        name: 'postgres',
        image: 'postgres',
        memory: 512,
        essential: true,
        portMappings: [
          {
            containerPort: 3000,
            hostPort: 0,
            protocol: 'tcp',
          },
        ],
        mountPoints: [
          {
            containerPath: '/home/postgres',
            sourceVolume: 'postgres',
          },
        ],
      },
    ],
  },
  name: 'codeServerPG',
};

export const baseTemplates = [coderServerOnly, codeServerPG];
