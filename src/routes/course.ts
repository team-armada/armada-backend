import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import database from '../services/databaseServices/index';
const router = Router();

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
