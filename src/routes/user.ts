import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import { createUser } from '../services/userCreationService';
import database from '../services/databaseServices/index';
import { IUserUpdates } from '../services/databaseServices/userActions';
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
 * Delete User
 */
router.delete('/delete', async (req, res) => {
  await database.userActions.deleteUser(req.body.uuid);

  res.status(StatusCodes.ACCEPTED).send({
    message: `Success: student with id ${req.body.uuid} was deleted`,
  });
});

/**
 * Retrieve Specified User
 */
router.get(
  '/',
  async (
    req: TypedRequestBody<{
      data: {
        userId: string | undefined;
      };
    }>,
    res
  ) => {
    const { userId } = req.body.data;

    if (!userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid user id is required.');
    }

    const user = await database.userActions.retrieveSpecificUser(userId);

    res.status(StatusCodes.OK).send({
      message: `Success: student with id ${userId} was retrieved`,
      result: user,
    });
  }
);

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
// app.post(
//   '/user',
//   async (
//     req: TypedRequestBody<{
//       data: {
//         relationshipDetails: User_Cohort {
//           userId: string | undefined;
//           cohortId: number | undefined;
//         }
//       };
//     }>,
//     res
//   ) => {
//     const { userActions } = database;
//     const { relationshipDetails } = req.body.data;

//     const relationship = await userActions.addUserToCohort(relationshipDetails);

//     res.status(StatusCodes.OK).send({
//       message: `Success: student with id ${userId} was added to cohort ${cohortId}`,
//       result: relationship,
//     });
//   }
// );

/**
 * Add multiple users to a cohort
 */

/**
 * Add user to a course
 */

/**
 * Add multiple users to a course
 */

export default router;
