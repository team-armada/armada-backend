import * as dotenv from 'dotenv';
import clone from 'just-clone';

import {
  createWorkspaceTemplate,
  IContainerDefinition,
  IVolumes,
} from './../services/templateService';

import { createEFSFolders } from './lambdaClient';

interface IStudent {
  username: string;
}

dotenv.config();

// TODO: Test Dynamic Port Mapping via setting hostPort to 0
// Sample Base Template
export const coderServerOnly: IContainerDefinition = {
  containerDefinition: [
    {
      name: 'code-server',
      image: 'jdguillaume/base-code-server-no-auth',
      memory: 512,
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

// Function Outline
// - Base template would start with "template-cohort-course-*"
//    - Display as cohort-course
// - Base-Template that has just code-server and then we'll add or reassign the values that need interpolated

// Extracts the names of the sourceVolume folders that need to be created based on the template provided.
function extractFolderNames(
  containerDefinitions: IContainerDefinition
): string[] {
  return containerDefinitions.containerDefinition.map(definition => {
    return definition.mountPoints[0].sourceVolume;
  });
}

// Creates volume entries based on the taskName and folders passed in.
function createVolumeEntries(taskName: string, folders: string[]): IVolumes[] {
  const volumes: IVolumes[] = [];
  const fileSystemId = process.env.FILE_SYSTEM;

  if (!fileSystemId) {
    throw new Error('No file system ID was provided.');
  }

  folders.forEach(folder => {
    volumes.push({
      efsVolumeConfiguration: {
        fileSystemId,
        rootDirectory: `/${taskName}/${folder}`,
      },
      name: `${folder}`,
    });
  });

  return volumes;
}

/*
Input: Array of student names, cohort, class, and a baseTaskDefinition
Output: Array of task definition names for each student (formatted cohort-course-student)
*/

export function createBatchDefinitions(
  studentArray: IStudent[],
  cohort: string,
  course: string,
  baseTaskDefinition: IContainerDefinition
): Promise<string[]> {
  const resultArray = [];

  for (let count = 0; count < studentArray.length; count++) {
    resultArray.push(
      createStudentTaskDefinition(
        studentArray[count].username,
        cohort,
        course,
        baseTaskDefinition
      )
    );
  }

  return Promise.all(resultArray);
}

/*
Input: One Student, One Cohort, One Course, and a baseTaskDefinition
Output: A student-specific task-definition.
*/

export async function createStudentTaskDefinition(
  student: string,
  cohort: string,
  course: string,
  baseTaskDefinition: IContainerDefinition
): Promise<string> {
  const baseTask = clone(baseTaskDefinition);
  const taskName = `${cohort}-${course}-${student}`;
  const folders = extractFolderNames(baseTask);

  baseTask.family = taskName;

  baseTask.volumes = createVolumeEntries(taskName, folders);

  await sendRequest(baseTask);

  folders.forEach(async folder => {
    await createEFSFolders(`/${taskName}/${folder}`);
  });

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
