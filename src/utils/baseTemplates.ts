import { IContainerDefinition } from "../services/templateService";

export interface IBaseTemplate {
  definition: IContainerDefinition;
  name: string
}

export const coderServerOnly: IBaseTemplate = {
  definition: {
    containerDefinition: [
    {
      name: 'code-server',
      image: 'jdguillaume/base-code-server-no-auth',
      memory: 512,
      portMappings: [
        {
          containerPort: 8080,
          hostPort: 0,
          protocol: 'tcp',
        },
      ],
      mountPoints: [
        {
          containerPath: '/home/coder',
          sourceVolume: `coder`,
        },
      ],
    },
  ],
},
name: 'codeServerOnly'
};

export const codeServerPG: IBaseTemplate = {
  definition: {
    containerDefinition: [
    {
      name: 'code-server',
      image: 'jdguillaume/base-code-server-no-auth',
      memory: 512,
      portMappings: [
        {
          containerPort: 8080,
          hostPort: 0,
          protocol: 'tcp',
        },
      ],
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
      portMappings: [
        {
          containerPort: 3000,
          hostPort: 0,
          protocol: 'tcp',
        }
      ],
      mountPoints: [
        {
          containerPath: '/home/postgres',
          sourceVolume: 'postgres'
        }
      ]
    }
  ],
},
name: 'codeServerPG'
};




export const baseTemplates = [coderServerOnly, codeServerPG];

