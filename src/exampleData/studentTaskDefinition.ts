// cohort-class-student
// / 2022-introToJavaScript-jdguillaume
//   /coder
//   /postgres

// What information do we need from the user?
//  - Cohort
//  - Class
//  - Student User Name

// Templates
// - Bare Code-Server
// - Code-Server + Postgres (Docker Compose + Mapping PostgreSQL default directory)
// - Reach: Code-Server: JavaScript Setup (Node, ESLint, Prettier) (Alt Image)

// TODO: Figure out location of psql data or set it manually.

// These are the values that would need interpolated
// family
// Volumes, forEach efsVolumeConfiguration
//  -- reassign fileSystemId and RootDirectory

const input = {
  containerDefinition: [
    {
      name: 'code-server',
      image: 'jdguillaume/base-code-server-no-auth',
      memory: 256,
      portMappings: [
        {
          containerPort: 8080,
          hostPort: 8080,
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
      memory: 256,
      portMappings: [
        {
          containerPort: 5432,
          hostPort: 5432,
          protocol: 'tcp',
        },
      ],
      mountPoints: [
        {
          containerPath: '/usr/local/pgsql/data',
          sourceVolume: `postgres`,
        },
      ],
    },
  ],

  family: `${cohort}-${course}-${student}`,
  volumes: [
    {
      efsVolumeConfiguration: {
        fileSystemId: `${fileSystemId}`,
        rootDirectory: `/${cohort}-${course}-${student}/coder`,
      },
      name: `coder`,
    },
    {
      efsVolumeConfiguration: {
        fileSystemId: `${fileSystemId}`,
        rootDirectory: `/${cohort}-${course}-${student}/postgres`,
      },
      name: `postgres`,
    },
  ],
};

// Possible Additions
// - Coder
//  - Coder: 2 vCPUs
//  - RAM: 2048 MB (2GB)
// - PostgreSQL
//  - Coder: 0.25 vCPUs
//  - RAM: 512 MB (2GB)

// "requiresAttributes": [
//   {
//     "targetId": null,
//     "targetType": null,
//     "value": null,
//     "name": "ecs.capability.efs"
//   },
//   {
//     "targetId": null,
//     "targetType": null,
//     "value": null,
//     "name": "com.amazonaws.ecs.capability.docker-remote-api.1.25"
//   }
// ],
