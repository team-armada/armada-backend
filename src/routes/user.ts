import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import { createUser } from '../services/userCreationService';
import database from '../services/databaseServices/index';
import { IUserUpdates } from '../services/databaseServices/userActions';
import { User_Cohort, User_Course } from '@prisma/client';

const router = Router();

// Create User
router.post(
  '/create',
  async (
    req: TypedRequestBody<{
      data: {
        userType: 'admin' | 'student' | undefined;
        username: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        email: string | undefined;
      };
    }>,
    res
  ) => {
    const { userType, username, firstName, lastName, email } = req.body.data;

    if (!username) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid username is required.');
    }

    if (!userType) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid userType is required.');
    }

    if (!firstName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid firstName is required.');
    }

    if (!lastName) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid lastName is required.');
    }

    if (!email) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid email is required.');
    }

    const result = await createUser(
      userType,
      username,
      firstName,
      lastName,
      email
    );

    res.status(StatusCodes.OK).json({
      message: 'Success: Created a user!',
      result,
    });
  }
);

/**
 * Get all users from postgres database
 */
router.get('/all', async (req, res) => {
  const users = await database.userActions.retrieveAllUsers();

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all users',
    result: users,
  });
});

/**
 * Get all admin users from postgres database
 */
router.get('/allAdmins', async (req, res) => {
  const users = await database.userActions.retrieveAllAdmins();

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all admin users.',
    result: users,
  });
});

/**
 * Get all students from postgres database
 */
router.get('/allStudents', async (req, res) => {
  const users = await database.userActions.retrieveAllStudents();

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all student users.',
    result: users,
  });
});

/**
 * Get all students in a specific cohort.
 */
router.get('/allStudentsInCohort/:cohortId', async (req, res) => {
  const { cohortId } = req.params;

  if (!cohortId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send('The requested cohort could not be found.');
  }

  const users = await database.userActions.retrieveAllStudentsInCohort(
    Number(cohortId)
  );

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all student users.',
    result: users,
  });
});

/**
 * Get all students not in cohort.
 */
router.get('/allStudentsNotInCohort/:cohortId', async (req, res) => {
  const { cohortId } = req.params;

  if (!cohortId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send('The user you requested could not be found.');
  }

  const users = await database.userActions.retrieveAllStudentsNotInCohort(
    Number(cohortId)
  );

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all student users.',
    result: users,
  });
});

/**
 * Get all students from cohort that are not in the current course.
 */
router.get('/allStudentsNotInCourse/:cohortId/:courseId', async (req, res) => {
  const { courseId, cohortId } = req.params;

  if (!courseId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send('The course you requested could not be found.');
  }

  if (!cohortId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send('The cohort you requested could not be found.');
  }

  const users =
    await database.userActions.retrieveAllStudentsInCohortNotInCourse(
      Number(cohortId),
      Number(courseId)
    );

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all student users.',
    result: users,
  });
});

/**
 * Get all students who don't have a workspace for a given course.
 */
router.get('/allStudentsWithoutWorkspaces/:courseId', async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send('The requested course could not be found.');
  }

  const users =
    await database.userActions.retrieveCourseStudentsWithoutWorkspaces(
      Number(courseId)
    );

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all student users.',
    result: users,
  });
});

/**
 * Delete User
 */
router.delete('/delete/:uuid', async (req, res) => {
  const { uuid } = req.params;
  await database.userActions.deleteUser(uuid);

  res.status(StatusCodes.ACCEPTED).send({
    message: `Success: student with id ${req.body.uuid} was deleted`,
  });
});

/**
 * Retrieve Specified User
 */
router.get('/:username', async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send('A valid username is required.');
  }

  const user = await database.userActions.retrieveSpecificUser(username);

  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .send('The user you requested could not be found.');
  }

  res.status(StatusCodes.OK).send({
    message: `Success: ${username} was retrieved`,
    result: user,
  });
});

/**
 * Update a user
 */
router.put(
  '/',
  async (
    req: TypedRequestBody<{
      data: {
        uuid: string | undefined;
        username: string | undefined;
        email: string | undefined;
        firstName: string | undefined;
        lastName: string | undefined;
        isAdmin: boolean | undefined;
      };
    }>,
    res
  ) => {
    const { data } = req.body;

    if (!data.uuid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid user id is required.');
    }

    const userDetails: IUserUpdates = {
      uuid: data.uuid,
    };

    data.username && (userDetails.username = data.username);
    data.email && (userDetails.email = data.email);
    data.firstName && (userDetails.firstName = data.firstName);
    data.lastName && (userDetails.lastName = data.lastName);
    data.isAdmin && (userDetails.isAdmin = data.isAdmin);

    const user = await database.userActions.updateUser(userDetails);

    res.status(StatusCodes.OK).send({
      message: `Success: student with id ${data.uuid} was retrieved`,
      result: user,
    });
  }
);

/**
 * Add A specific user to cohort
 */
router.post(
  '/addToCohort',
  async (
    req: TypedRequestBody<{
      data: {
        userId: string | undefined;
        cohortId: number | undefined;
      };
    }>,
    res
  ) => {
    const { userId, cohortId } = req.body.data;

    if (!userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid user id is required.');
    }

    if (!cohortId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid cohort id is required.');
    }

    const relationship = await database.userActions.addUserToCohort(
      userId,
      cohortId
    );

    res.status(StatusCodes.OK).send({
      message: `Success: Student with id ${userId} was added to cohort ${cohortId}`,
      result: relationship,
    });
  }
);

/**
 * Add multiple users to a cohort
 */
router.post(
  '/addUsersToCohort',
  async (
    req: TypedRequestBody<{
      data: User_Cohort[] | undefined;
    }>,
    res
  ) => {
    const data = req.body.data;

    if (!data) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid user id is required.');
    }

    const relationship = await database.userActions.addUsersToCohort(data);

    res.status(StatusCodes.OK).send({
      message: `Success: All cohort-student relationships were successfully defined.`,
      result: relationship,
    });
  }
);

/**
 * Add user to a course
 */
router.post(
  '/addUserToCourse',
  async (
    req: TypedRequestBody<{
      data: {
        userId: string | undefined;
        courseId: number | undefined;
      };
    }>,
    res
  ) => {
    const { userId, courseId } = req.body.data;

    if (!userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid user id is required.');
    }

    if (!courseId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid cohort id is required.');
    }

    const relationship = await database.userActions.addUserToCourse({
      userId,
      courseId,
    });

    res.status(StatusCodes.OK).send({
      message: `Success: Student with id ${userId} was added to course with id ${courseId}`,
      result: relationship,
    });
  }
);

/**
 * Add multiple users to a course
 */

router.post(
  '/addUsersToCourse',
  async (
    req: TypedRequestBody<{
      data: User_Course[] | undefined;
    }>,
    res
  ) => {
    const { data } = req.body;

    if (!data) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid user id is required.');
    }

    const relationship = await database.userActions.addUsersToCourse(data);

    res.status(StatusCodes.OK).send({
      message: `Success: All course-student relationships were successfully defined.`,
      result: relationship,
    });
  }
);

export default router;
