import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import * as dotenv from 'dotenv';
import morganBody from 'morgan-body';

import {
  getWorkspaces,
  runWorkspace,
  stopWorkspace,
} from './services/workspaceService';

import {
  createWorkspaceTemplate,
  deleteWorkspaceTemplate,
  getAllWorkspaceTemplates,
  ContainerSettings,
} from './services/templateService';

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

dotenv.config();

const app = express();
app.use(express.json());
morganBody(app);

const PORT = process.env.PORT;

app.use(cors());

/**
 * Get all task definitions
 */
app.get('/templates', async (req, res) => {
  // Plans for the future
  /*
    [
      {
        templateID: "asldkfjawoiejfa",
        title: family,
        workspacesCount: 20
      },
      {
        templateID: "asldkfjawoiejfa",
        title: family,
        workspacesCount: 20
      },
      {
        templateID: "asldkfjawoiejfa",
        title: family,
        workspacesCount: 20
      },
    ]
  */
  const result = await getAllWorkspaceTemplates();

  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved workspace templates',
    result,
  });
});

/**
 * Create a task definition
 */
app.post(
  '/templates',
  async (
    req: TypedRequestBody<{
      data: {
        containerDefinition: ContainerSettings[] | undefined;
        family: string | undefined;
      };
    }>,
    res
  ) => {
    const { containerDefinition, family } = req.body.data;

    if (!containerDefinition) {
      return res.status(400).send('A container definition is required.');
    }

    if (!family) {
      return res.status(400).send('A task family is required.');
    }

    const result = await createWorkspaceTemplate(containerDefinition, family);

    res.status(StatusCodes.CREATED).json({
      message: 'Success: Created a new task definition',
      result,
    });
  }
);

/**
 * Get all active workspaces (optionally filtering them.).
 */

// TODO: Implement filtering via params.
app.get('/workspaces', async (req, res) => {
  const result = await getWorkspaces();

  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved all active workspaces.',
    result,
  });
});

/**
 * Runs a workspace (an ECS task)
 */
app.post(
  '/workspaces',
  async (
    req: TypedRequestBody<{
      taskDefinition: string | undefined;
    }>,
    res
  ) => {
    const { taskDefinition } = req.body;

    if (!taskDefinition) {
      return res.status(400).send('A task definition is required.');
    }

    const result = await runWorkspace(taskDefinition);

    res.status(StatusCodes.CREATED).json({
      message: 'Success: Running new workspace',
      result,
    });
  }
);

/**
 * Stop a workspace
 */
app.put(
  '/workspaces',
  async (
    req: TypedRequestBody<{
      taskID: string | undefined;
      reason: string | undefined;
    }>,
    res
  ) => {
    const { taskID, reason } = req.body;

    if (!taskID) {
      return res.status(400).send('A taskID is required.');
    }

    if (!reason) {
      return res.status(400).send('A reason is required.');
    }

    const result = await stopWorkspace(taskID, reason);

    res.status(StatusCodes.OK).json({
      message: 'Success: Stopped a workspace',
      result,
    });
  }
);

/**
 * Delete a workspace template
 */
app.delete(
  '/workspaces',
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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
