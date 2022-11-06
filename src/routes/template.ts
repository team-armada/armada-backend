import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import {
  createWorkspaceTemplate,
  deleteWorkspaceTemplate,
  getAllWorkspaceTemplates,
  IContainerSettings,
  IVolumes,
} from '../services/templateService';
import { baseTemplates } from '../utils/baseTemplates';
const router = Router();

/**
 * Get all task definitions
 */
router.get('/', async (req, res) => {
  const result = await getAllWorkspaceTemplates();

  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved workspace templates',
    result,
  });
});

/**
 * Create a task definition (a template )
 */
router.post(
  '/',
  async (
    req: TypedRequestBody<{
      data: {
        containerDefinition: IContainerSettings[] | undefined;
        family: string | undefined;
        volumes: IVolumes[] | undefined;
      };
    }>,
    res
  ) => {
    const { containerDefinition, family, volumes } = req.body.data;

    if (!containerDefinition) {
      return res.status(400).send('A container definition is required.');
    }

    if (!family) {
      return res.status(400).send('A task family is required.');
    }

    if (!volumes) {
      return res.status(400).send('A task volume is required.');
    }

    const result = await createWorkspaceTemplate(
      containerDefinition,
      family,
      volumes
    );

    res.status(StatusCodes.CREATED).json({
      message: 'Success: Created a new task definition',
      result,
    });
  }
);

/**
 * Retrieve base templates.
 */
router.get('/base', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved base templates',
    baseTemplates,
  });
});

/**
 * Delete a workspace template
 */
router.delete(
  '/',
  async (
    req: TypedRequestBody<{
      taskDefinitionArn: string | undefined;
    }>,
    res
  ) => {
    const { taskDefinitionArn } = req.body;

    if (!taskDefinitionArn) {
      return res.status(400).send('A task definition ARN is required.');
    }

    const result = await deleteWorkspaceTemplate(taskDefinitionArn);

    res.status(StatusCodes.ACCEPTED).json({
      message: `Success: Deleted workspace template with ARN ${taskDefinitionArn}`,
      result,
    });
  }
);

export default router;
