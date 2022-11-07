import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import database from '../services/databaseServices/index';
const router = Router();

/**
 * Get all courses from postgres database
 */
router.get('/all', async (req, res) => {
  const courses = await database.courseActions.retrieveAllCourses();

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all courses.',
    result: courses,
  });
});

/**
 * Get all students for a specific course.
 */

router.get('/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const numberId = Number(courseId);

  const course = await database.courseActions.retrieveSpecificCourse(numberId);
  const students =
    await database.courseActions.retrieveAllUsersFromSpecificCourse(numberId);

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all students for a specific course.',
    result: {
      course,
      students,
    },
  });
});

router.post(
  '/create',
  async (
    req: TypedRequestBody<{
      data: {
        name: string | undefined;
        cohortId: number | undefined;
      };
    }>,
    res
  ) => {
    const { name, cohortId } = req.body.data;

    if (!name) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A course name is required.');
    }

    if (!cohortId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A cohort id is required.');
    }

    const result = await database.courseActions.createCourse(name, cohortId);

    res.status(StatusCodes.OK).json({
      message: `Success: Created the ${name} course in the cohort ${cohortId}.`,
      result,
    });
  }
);

export default router;
