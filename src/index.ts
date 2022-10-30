import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import * as dotenv from 'dotenv';
import morganBody from 'morgan-body';

import {
  getWorkspaces,
  runWorkspace,
  // stopWorkspace,
} from './services/workspaceService';

import {
  createWorkspaceTemplate,
  deleteWorkspaceTemplate,
  getAllWorkspaceTemplates,
  ContainerSettings,
  IVolumes,
} from './services/templateService';

import {
  createStudentService,
  deleteStudentService,
  getAllStudentServices,
  startStudentService,
  stopStudentService,
} from './services/studentService';

import {
  createStudentTaskDefinition,
  coderServerOnly,
} from './utils/createTaskDefinitions';

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
  const result = await getAllWorkspaceTemplates();

  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved workspace templates',
    result,
  });
});

/**
 * Get all student services
 */
app.get('/services', async (req, res) => {
  const result = await getAllStudentServices();

  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved all student services.',
    result,
  });
});

/**
 * Create a task definition (a template )
 */
app.post(
  '/templates',
  async (
    req: TypedRequestBody<{
      data: {
        containerDefinition: ContainerSettings[] | undefined;
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
 * Creates a student service based on student name, cohort, course, and version
 */
app.post(
  '/services',
  async (
    req: TypedRequestBody<{
      data: {
        studentName: string | undefined;
        cohort: string | undefined;
        course: string | undefined;
        version: number | undefined;
      };
    }>,
    res
  ) => {
    const { studentName, cohort, course, version } = req.body.data;

    if (!studentName) {
      return res.status(400).send('A student name is required.');
    }

    if (!cohort) {
      return res.status(400).send('A cohort is required.');
    }

    if (!course) {
      return res.status(400).send('A course name is required.');
    }

    if (!version) {
      return res.status(400).send('A version number is required');
    }

    const serviceName = await createStudentTaskDefinition(
      studentName,
      cohort,
      course,
      coderServerOnly
    );

    const result = await createStudentService(
      serviceName,
      `${serviceName}:${version}`
    );

    res.status(StatusCodes.CREATED).json({
      message: 'Success: Created a new student service',
      result,
    });
  }
);

/**
 * Delete a workspace template
 */
app.delete(
  '/templates',
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

/**
 * Delete a student service
 */
app.delete(
  '/services',
  async (
    req: TypedRequestBody<{
      service: string | undefined;
    }>,
    res
  ) => {
    const { service } = req.body;

    if (!service) {
      return res.status(400).send('A service name is required.');
    }

    const result = await deleteStudentService(service);

    res.status(StatusCodes.ACCEPTED).json({
      message: `Success: Deleted student service with name ${service}`,
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

/**
 * Stop a workspace
 */
// app.put(
//   '/workspaces',
//   async (
//     req: TypedRequestBody<{
//       data: {
//         taskID: string | undefined;
//         reason: string | undefined;
//       };
//     }>,
//     res
//   ) => {
//     const { taskID, reason } = req.body.data;

//     if (!taskID) {
//       return res.status(StatusCodes.BAD_REQUEST).send('A taskID is required.');
//     }

//     if (!reason) {
//       return res.status(StatusCodes.BAD_REQUEST).send('A reason is required.');
//     }

//     const result = await stopWorkspace(taskID, reason);

//     res.status(StatusCodes.OK).json({
//       message: 'Success: Stopped a workspace',
//       result,
//     });
//   }
// );

/**
 * Update a student service to run the workspace
 */
app.put(
  '/services',
  async (
    req: TypedRequestBody<{
      service: string | undefined;
    }>,
    res
  ) => {
    const { service } = req.body;

    if (!service) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A service name is required.');
    }

    const result = await startStudentService(service);

    res.status(StatusCodes.OK).json({
      message: 'Success: Updated a service; started the student workspace',
      result,
    });
  }
);

/**
 * Update a student service to stop running a task/workspace
 */
app.put(
  '/workspaces',
  async (
    req: TypedRequestBody<{
      service: string | undefined;
    }>,
    res
  ) => {
    const { service } = req.body;

    if (!service) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('A service name is required.');
    }

    const result = await stopStudentService(service);

    res.status(StatusCodes.OK).json({
      message: 'Success: Updated a service; stopped the student workspace',
      result,
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
