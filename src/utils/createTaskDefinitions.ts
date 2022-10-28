import {
  createWorkspaceTemplate,
  IContainerDefinition,
} from './../services/templateService';

import { createEFSFolders } from './lambdaClient';

interface IStudent {
  username: string;
}

// Function Outline
// - Base template would start with "template-cohort-course-*"
//    - Display as cohort-course
// - Base-Template that has just code-server and then we'll add or reassign the values that need interpolated

// Additional Thoughts
// Retrieve task definition from ARN.
// ecsClient retrieve the baseTaskDefinition object from ECS
// Eventually pull out mountPoints.sourcceVolume for volumes in taskDefinition

export const coderServerOnly: IContainerDefinition = {
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
  ],
};

/*
Input: Array of student names, cohort, class, baseTaskDefintion
Output: Array of task definition objects for each student
*/

export function createBatchDefinitions(
  studentArray: IStudent[],
  cohort: string,
  course: string,
  baseTaskDefinition: IContainerDefinition
): string[] {
  // Return an Array of ARNs
  return studentArray.map(student => {
    return createStudentTaskDefinition(
      student.username,
      cohort,
      course,
      baseTaskDefinition
    );
  });
}

/*
Input: one student, cohort, class
Output: One task definition
*/

export function createStudentTaskDefinition(
  student: string,
  cohort: string,
  course: string,
  baseTaskDefinition: IContainerDefinition
): string {
  const baseTask: IContainerDefinition = JSON.parse(
    JSON.stringify(baseTaskDefinition)
  );

  if (!process.env.FILE_SYSTEM) {
    throw new Error('No file system ID was provided.');
  }

  baseTask.family = `${cohort}-${course}-${student}`;
  baseTask.volumes = [
    {
      efsVolumeConfiguration: {
        fileSystemId: process.env.FILE_SYSTEM,
        rootDirectory: `/${cohort}-${course}-${student}/coder`,
      },
      name: `coder`,
    },
  ];

  sendRequest(baseTask);

  // TODO: Update to work with multiple volumes via extracting them from container definitions.
  createEFSFolders(`/${cohort}-${course}-${student}/coder`);

  return baseTask.family;
}

async function sendRequest(baseTask: IContainerDefinition): Promise<void> {
  if (!baseTask.family) {
    throw new Error('The family task provided is incorrect.');
  }

  if (!baseTask.volumes) {
    throw new Error('The defined volume is incorrect.');
  }

  await createWorkspaceTemplate(
    baseTask.containerDefinition,
    baseTask.family,
    baseTask.volumes
  );
}

// console.log(
//   createStudentTaskDefinition(
//     'Natalie',
//     '2028',
//     'ArmadaSchool',
//     coderServerOnly
//   )
// );

// Call a lambda function that creates a top level folder and its sub folders (string, array of source volume)
// Create folder (cohort-course-student)
// Create subfolders (i.e., coder, postgres)
