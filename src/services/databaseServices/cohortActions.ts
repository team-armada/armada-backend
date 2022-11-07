import { prisma } from './index';

// Create a Cohort
export async function createCohort(name: string) {
  const cohort = await prisma.cohort.create({
    data: {
      name,
    },
  });

  return cohort;
}

// Delete a Cohort
export async function deleteCohort(id: number) {
  const cohort = await prisma.cohort.delete({
    where: { id },
  });

  return cohort;
}

// Get All Cohorts
export async function retrieveAllCohorts() {
  const cohorts = await prisma.cohort.findMany();
  return cohorts;
}

// Get Cohorts from List
export async function retrieveCohortsFromList(list: number[]) {
  const cohorts = await prisma.cohort.findMany({
    where: {
      id: { in: list },
    },
  });

  return cohorts;
}

// Get a Specific Cohort
export async function retrieveSpecificCohort(id: number) {
  const cohort = await prisma.cohort.findUnique({
    where: { id },
  });

  return cohort;
}

// Update a Workspace
export async function updateCohort(id: number, name: string) {
  const cohort = await prisma.cohort.update({
    where: { id },
    data: {
      name,
    },
  });

  return cohort;
}

const cohortActions = {
  createCohort,
  deleteCohort,
  retrieveAllCohorts,
  retrieveCohortsFromList,
  retrieveSpecificCohort,
  updateCohort,
};

export default cohortActions;
