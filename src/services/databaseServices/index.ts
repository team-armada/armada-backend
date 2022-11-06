import { PrismaClient } from '@prisma/client';

import cohortActions from './cohortActions';
import courseActions from './courseActions';
import userActions from './userActions';
import workspaceActions from './workspaceActions';

export const prisma = new PrismaClient();

const database = {
  cohortActions,
  courseActions,
  userActions,
  workspaceActions,
};

export default database;
