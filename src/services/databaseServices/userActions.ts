import { prisma } from './index';
import { User, User_Cohort, User_Course } from '@prisma/client';

export interface IUserUpdates {
  uuid: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

// Create a User
async function createUser(userDetails: User) {
  const { uuid, username, email, firstName, lastName, isAdmin } = userDetails;

  const user = await prisma.user.create({
    data: {
      uuid,
      username,
      email,
      firstName,
      lastName,
      isAdmin,
    },
  });

  return user;
}

// Create Multiple Users
async function createUsers(userDetailsArray: User[]) {
  const users = await prisma.user.createMany({
    data: userDetailsArray,
  });

  return users;
}

// Delete a User
async function deleteUser(uuid: string) {
  const user = await prisma.user.delete({
    where: { uuid },
  });

  return user;
}

// Get All Users
export async function retrieveAllUsers() {
  const users = await prisma.user.findMany();
  return users;
}

// Get All Admins
export async function retrieveAllAdmins() {
  const users = await prisma.user.findMany({
    where: { isAdmin: true },
  });

  return users;
}

// Get All Students
export async function retrieveAllStudents() {
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    include: {
      user_cohort: {
        include: {
          cohort: true,
        },
      },
      user_course: {
        include: {
          course: true,
        },
      },
    },
  });

  return users;
}

// Get All Users in a Specific Cohort
export async function retrieveAllStudentsInCohort(cohortId: number) {
  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
      user_cohort: {
        some: {
          cohortId,
        },
      },
    },
  });

  return users;
}

// Get All Students Not in a Specific Cohort
export async function retrieveAllStudentsNotInCohort(cohortId: number) {
  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
      user_cohort: {
        none: {
          cohortId,
        },
      },
    },
  });

  return users;
}

// Get All Students In a Specific Cohort that aren't in the current class.
export async function retrieveAllStudentsInCohortNotInCourse(
  cohortId: number,
  courseId: number
) {
  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
      user_cohort: {
        some: {
          cohortId,
        },
      },
      user_course: {
        none: {
          courseId,
        },
      },
    },
  });

  return users;
}

// Get All Students from a Course that don't have a workspace for that course.
export async function retrieveCourseStudentsWithoutWorkspaces(
  courseId: number
) {
  const users = await prisma.user.findMany({
    where: {
      isAdmin: false,
      workspaces: {
        none: {
          courseId,
        },
      },
      user_course: {
        some: {
          courseId,
        },
      },
    },
  });

  return users;
}

// Get a Specific User
export async function retrieveSpecificUser(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      user_cohort: {
        include: {
          cohort: true,
        },
      },
      user_course: {
        include: {
          course: {
            include: {
              cohort: true,
            },
          },
        },
      },
      workspaces: {
        include: {
          Course: {
            include: {
              cohort: true,
            },
          },
        },
      },
    },
  });

  return user;
}

// Update a Workspace
export async function updateUser(userDetails: IUserUpdates) {
  const { uuid } = userDetails;

  const user = await prisma.user.update({
    where: { uuid },
    data: {
      ...userDetails,
    },
  });

  return user;
}

// Add User to Cohort
export async function addUserToCohort(userId: string, cohortId: number) {
  const relationship = await prisma.user_Cohort.create({
    data: {
      userId,
      cohortId,
    },
  });

  return relationship;
}

// Add Users to Cohort
export async function addUsersToCohort(
  relationshipDetailsArray: User_Cohort[]
) {
  const relationships = await prisma.user_Cohort.createMany({
    data: relationshipDetailsArray,
  });

  return relationships;
}

// Add User to Course
export async function addUserToCourse(relationshipDetails: User_Course) {
  const { userId, courseId } = relationshipDetails;

  const relationship = await prisma.user_Course.create({
    data: {
      userId,
      courseId,
    },
  });

  return relationship;
}

// Add Users to Course
export async function addUsersToCourse(
  relationshipDetailsArray: User_Course[]
) {
  const relationships = await prisma.user_Course.createMany({
    data: relationshipDetailsArray,
  });

  return relationships;
}

const userActions = {
  createUser,
  createUsers,
  deleteUser,
  retrieveCourseStudentsWithoutWorkspaces,
  retrieveAllUsers,
  retrieveAllAdmins,
  retrieveAllStudents,
  retrieveAllStudentsInCohort,
  retrieveAllStudentsNotInCohort,
  retrieveAllStudentsInCohortNotInCourse,
  retrieveSpecificUser,
  updateUser,
  addUserToCohort,
  addUsersToCohort,
  addUserToCourse,
  addUsersToCourse,
};

export default userActions;
