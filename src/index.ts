import express from 'express';
import cors from 'cors';
import { StatusCodes } from 'http-status-codes';
import * as dotenv from 'dotenv';
import morganBody from 'morgan-body';

import {
  getRunningTask,
  runWorkspace,
  stopWorkspace,
} from './services/workspaceService';

import {
  createWorkspaceTemplate,
  deleteWorkspaceTemplate,
  getAllWorkspaceTemplates,
  IContainerSettings,
  IVolumes,
} from './services/templateService';

import {
  createStudentService,
  deleteStudentService,
  describeStudentService,
  getAllStudentServices,
  startStudentService,
  stopStudentService,
} from './services/studentService';

import {
  createBatchDefinitions,
  createStudentTaskDefinition,
  coderServerOnly,
} from './utils/createTaskDefinitions';

import { baseTemplates, IBaseTemplate } from './utils/baseTemplates';
import { createUser } from './services/userCreationService';

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
 * Get all student services
 */
app.get('/service/:service', async (req, res) => {
  const { service } = req.params;
  const result = await describeStudentService(service);

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

app.get('/templates/base', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved base templates',
    baseTemplates,
  });
});

/**
 * Creates a student service based on student name, cohort, course, and version
 */
app.post(
  '/services',
  async (
    req: TypedRequestBody<{
      data: {
        studentNames: string[] | undefined;
        cohort: string | undefined;
        course: string | undefined;
        template: string | undefined;
      };
    }>,
    res
  ) => {
    const { studentNames, cohort, course, template } = req.body.data;

    if (!studentNames) {
      return res.status(400).send('An array of student names is required.');
    }

    if (!cohort) {
      return res.status(400).send('A cohort is required.');
    }

    if (!course) {
      return res.status(400).send('A course name is required.');
    }

    if (!template) {
      return res.status(400).send('A template is required');
    }

    // Get base task definition from template string
    // Have a separate folder with a javascript object that contains our container definitions
    const baseTemplate = baseTemplates.filter(
      baseContainer => baseContainer.name === template
    )[0];

    const serviceNames = await createBatchDefinitions(
      studentNames,
      cohort,
      course,
      baseTemplate.definition
    );

    // return an object
    // - serviceName = family
    // - revision

    const promiseHolder = [];

    for (let count = 0; count < serviceNames.length; count++) {
      const currentStudent = serviceNames[count];
      promiseHolder.push(
        createStudentService(
          currentStudent.family,
          `${currentStudent.family}:${currentStudent.revision}`
        )
      );
    }

    const result = await Promise.all(promiseHolder);

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
    console.log(req.body);
    const { service } = req.body;

    if (!service) {
      return res.status(400).send('A service name is required.');
    }

    const stopServiceResult = await stopStudentService(service);

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
// app.get('/workspaces', async (req, res) => {
//   const result = await getWorkspaces();

//   res.status(StatusCodes.OK).json({
//     message: 'Success: Retrieved all active workspaces.',
//     result,
//   });
// });

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
  '/services/start',
  async (
    req: TypedRequestBody<{
      data: {
        service: string | undefined;
      };
    }>,
    res
  ) => {
    const { service } = req.body.data;

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
  '/services/stop',
  async (
    req: TypedRequestBody<{
      data: {
        service: string | undefined;
      };
    }>,
    res
  ) => {
    const { service } = req.body.data;

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

// Create Users
app.post(
  '/users/create',
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

// TODO: Add redirect route for refresh with React Router.
app.get('/*', (req, res) => {
  res.sendFile(
    // Specify route to entry point for front-end build.
    '',
    err => {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
