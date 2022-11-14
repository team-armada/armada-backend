import { AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

import client from '../clients/cognitoClient';
import database from './databaseServices';

export const createUser = async (
  userType: string,
  username: string,
  firstName: string,
  lastName: string,
  email: string
) => {
  const input = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: username,
    UserAttributes: [
      { Name: 'custom:isAdmin', Value: `${userType === 'admin'}` },
      { Name: 'given_name', Value: `${firstName}` },
      { Name: 'family_name', Value: `${lastName}` },
      { Name: 'email', Value: `${email}` },
    ],
    TemporaryPassword: 'Welcome2TheFleet!',
  };

  try {
    const command = new AdminCreateUserCommand(input);
    const response = await client.send(command);

    console.log(response);

    const attributes = response.User?.Attributes;
    const uuid = attributes?.find(attribute => attribute.Name === 'sub')?.Value;

    if (uuid !== undefined) {
      database.userActions.createUser({
        uuid,
        username,
        email,
        firstName,
        lastName,
        isAdmin: userType === 'admin',
      });
    }

    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
      console.log(err);
      return err.message;
    }
  }
};
