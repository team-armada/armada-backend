import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TypedRequestBody } from '../index';
import {
  createStudentService,
  deleteStudentService,
  describeStudentService,
  getAllStudentServices,
  startStudentService,
  stopStudentService,
} from '../services/studentService';
import { baseTemplates } from '../utils/baseTemplates';
import { createBatchDefinitions } from '../utils/createTaskDefinitions';
const router = Router();

interface IStudentObject {
  username: string;
  uuid: string;
}

/**
 * Get all student services
 */
router.get('/all', async (req, res) => {
  const result = await getAllStudentServices();

  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved all student services.',
    result,
  });
});

/**
 * Get a specific student service.
 */
router.get('/:service', async (req, res) => {
  const { service } = req.params;
  const result = await describeStudentService(service);

  res.status(StatusCodes.OK).json({
    message: 'Success: Retrieved all student services.',
    result,
  });
});

/**
 * Creates a student service based on student name, cohort, course, and version
 */
router.post(
  '/create',
  async (
    req: TypedRequestBody<{
      data: {
        studentNames: IStudentObject[] | undefined;
        cohort: string | undefined;
        course: string | undefined;
        template: string | undefined;
        courseId: number | undefined;
      };
    }>,
    res
  ) => {
    const { studentNames, cohort, course, template, courseId } = req.body.data;

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

    if (!courseId) {
      return res.status(400).send('A course name is required.');
    }

    // Get base task definition from template string
    // Have a separate folder with a javascript object that contains our container definitions
    const baseTemplate = baseTemplates.filter(
      baseContainer => baseContainer.name === template
    )[0];

    const onlyStudentNames = studentNames.map(student => student.username);

    const serviceNames = await createBatchDefinitions(
      onlyStudentNames,
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
          `${currentStudent.family}:${currentStudent.revision}`,
          studentNames[count].uuid,
          courseId
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
 * Delete a student service
 */
router.delete(
  '/',
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

    const stopServiceResult = await stopStudentService(service);

    const result = await deleteStudentService(service);

    res.status(StatusCodes.ACCEPTED).json({
      message: `Success: Deleted student service with name ${service}`,
      result,
    });
  }
);

/**
 * Update a student service to run the workspace
 */
router.put(
  '/start',
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
router.put(
  '/stop',
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

export default router;
