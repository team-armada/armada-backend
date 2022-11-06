import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import database from '../services/databaseServices/index';
const router = Router();

// Create a Cohort
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

export default router;
