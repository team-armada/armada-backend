import { prisma } from './index';
import { Workspace } from '@prisma/client';

// Create a Workspace
export async function createWorkspace(workspaceDetails: Workspace) {
  const { uuid, desiredCount, userId, courseId, website } = workspaceDetails;

  const workspace = await prisma.workspace.create({
    data: {
      uuid,
      desiredCount,
      userId,
      courseId,
      website,
    },
  });

  return workspace;
}

// Delete a Workspace
export async function deleteWorkspace(uuid: string) {
  const workspace = await prisma.workspace.delete({
    where: { uuid },
  });

  return workspace;
}

// Get All Workspaces
export async function retrieveAllWorkspaces() {
  const workspaces = await prisma.workspace.findMany({
    include: {
      user: true,
      Course: {
        include: {
          cohort: true,
        },
      },
    },
  });
  return workspaces;
}

// Get a Specific Workspace
export async function retrieveSpecificWorkspace(uuid: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { uuid },
  });

  return workspace;
}

// Update a Workspace
export async function updateWorkspace(uuid: string, desiredCount: number) {
  const workspace = await prisma.workspace.update({
    where: { uuid },
    data: {
      desiredCount,
    },
  });

  return workspace;
}

const workspaceActions = {
  createWorkspace,
  deleteWorkspace,
  retrieveAllWorkspaces,
  retrieveSpecificWorkspace,
  updateWorkspace,
};

export default workspaceActions;
