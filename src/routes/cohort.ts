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

  res.status(StatusCodes.OK).send({
    message: 'Success: Fetched all courses for the given cohort.',
    result: {
      cohort,
      courses,
    },
  });
});

router.put(
  '/:cohortId',
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
    const numberId = Number(cohortId);

    if (!numberId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid cohort id is required.');
    }

    if (!name) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A valid cohort name is required.');
    }

    const result = await database.cohortActions.updateCohort(numberId, name);

    res.status(StatusCodes.OK).send({
      message: `Success: The cohort with an id of ${cohortId} has been updated with the name ${name}.`,
      result,
    });
  }
);

router.delete('/:cohortId', async (req, res) => {
  const { cohortId } = req.params;
  const numberId = Number(cohortId);

  const result = await database.cohortActions.deleteCohort(numberId);

  res.status(StatusCodes.OK).send({
    message: `Success: Deleted cohort with the id of ${cohortId}.`,
    result,
  });
});

export default router;
