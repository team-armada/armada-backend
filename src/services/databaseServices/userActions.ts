import { prisma } from './index';
import { User, User_Cohort, User_Course } from '@prisma/client';

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

// Get a Specific User
export async function retrieveSpecificUser(uuid: string) {
  const user = await prisma.user.findUnique({
    where: { uuid },
  });

  return user;
}

// Update a Workspace
export async function updateUser(userDetails: User) {
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
export async function addUserToCohort(relationshipDetails: User_Cohort) {
  const { userId, cohortId } = relationshipDetails;

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
  retrieveAllUsers,
  retrieveSpecificUser,
  updateUser,
  addUserToCohort,
  addUsersToCohort,
  addUserToCourse,
  addUsersToCourse,
};

export default userActions;
