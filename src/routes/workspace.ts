import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import { runWorkspace } from '../services/workspaceService';
const router = Router();

/**
 * Runs a workspace (an ECS task)
 */
router.post(
  '/',
  async (
    req: TypedRequestBody<{
      data: {
        taskDefinitionArn: string | undefined;
      };
    }>,
    res
  ) => {
    const { taskDefinitionArn } = req.body.data;

    if (!taskDefinitionArn) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A task definition is required.');
    }

    const result = await runWorkspace(taskDefinitionArn);

    res.status(StatusCodes.CREATED).json({
      message: 'Success: Running new workspace',
      result,
    });
  }
);
export default router;
