import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import database from '../services/databaseServices/index';
const router = Router();

/**
 * Get all cohorts from postgres database
 */
router.get('/all', async (req, res) => {
  const cohorts = await database.cohortActions.retrieveAllCohorts();

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all cohorts.',
    result: cohorts,
  });
});

/**
 *  Create a Cohort
 */
router.post(
  '/create',
  async (
    req: TypedRequestBody<{
      data: {
        name: string | undefined;
      };
    }>,
    res
  ) => {
    const { name } = req.body.data;

    if (!name) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A cohort name is required.');
    }

    const result = await database.cohortActions.createCohort(name);

    res.status(StatusCodes.OK).json({
      message: `Success: Created the ${name} cohort.`,
      result,
    });
  }
);

/**
 *  Display all courses for a given cohort.
 */

router.get('/:cohortId', async (req, res) => {
  const { cohortId } = req.params;
  const numberId = Number(cohortId);

  const courses = await database.courseActions.retrieveAllCoursesFromCohort(
    numberId
  );

  const cohort = await database.cohortActions.retrieveSpecificCohort(numberId);

  // TODO: Update to access names.
  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all courses for the given cohort.',
    result: {
      cohort,
      courses,
    },
  });
});

export default router;
