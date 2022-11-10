import clone from 'just-clone';
import { retrieveFileSystemId } from '../clients/efsClient';

import { createEFSFolders } from '../clients/lambdaClient';
import {
  createWorkspaceTemplate,
  IContainerDefinition,
  IVolumes,
} from './../services/templateService';

interface ITaskResult {
  family: string;
  revision: number;
}

let fileSystemId: string;

async function setFileSystemId(): Promise<void> {
  fileSystemId = await retrieveFileSystemId();
}

// Function Outline
// - Base template would start with "template-cohort-course-*"
//    - Display as cohort-course
// - Base-Template that has just code-server and then we'll add or reassign the values that need interpolated

// Extracts the names of the sourceVolume folders that need to be created based on the template provided.
function extractFolderNames(
  containerDefinitions: IContainerDefinition
): string[] {
  const volumes: string[] = [];

  containerDefinitions.containerDefinition.forEach(definition => {
    const retrievedMountPoint = definition.mountPoints?.[0].sourceVolume;

    if (retrievedMountPoint !== undefined) volumes.push(retrievedMountPoint);
  });

  return volumes;
}

// Creates volume entries based on the taskName and folders passed in.
function createVolumeEntries(taskName: string, folders: string[]): IVolumes[] {
  const volumes: IVolumes[] = [];

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
  studentArray: string[],
  cohort: string,
  course: string,
  baseTaskDefinition: IContainerDefinition
): Promise<ITaskResult[]> {
  const resultArray = [];

  for (let count = 0; count < studentArray.length; count++) {
    resultArray.push(
      createStudentTaskDefinition(
        studentArray[count],
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
): Promise<ITaskResult> {
  const baseTask = clone(baseTaskDefinition);
  const taskName = `${cohort}-${course}-${student}`;
  const folders = extractFolderNames(baseTask);

  baseTask.family = taskName;

  if (!fileSystemId) await setFileSystemId();
  baseTask.volumes = createVolumeEntries(taskName, folders);

  const task = await sendRequest(baseTask);

  folders.forEach(async folder => {
    await createEFSFolders(`/${taskName}/${folder}`);
  });

  const revision = task?.taskDefinition?.revision;
  const family = task?.taskDefinition?.family;

  if (revision === undefined || family === undefined) {
    throw new Error('Task Definition Not found.');
  }

  return { revision, family };
}

async function sendRequest(baseTask: IContainerDefinition) {
  if (!baseTask.family) {
    throw new Error('The family task provided is incorrect.');
  }

  if (!baseTask.volumes) {
    throw new Error('The defined volume is incorrect.');
  }

  const response = await createWorkspaceTemplate(
    baseTask.containerDefinition,
    baseTask.family,
    baseTask.volumes
  );

  return response;
}
