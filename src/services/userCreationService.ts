import { AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';

import client from '../clients/cognitoClient';

// TODO: Start with one admin user already!

export const createUser = async (
  userType: string,
  username: string,
  firstName: string,
  lastName: string
) => {

    const input = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: username,
      UserAttributes: [
        {Name: 'custom:isAdmin', Value: `${userType === 'admin'}`},
        {Name: 'given_name', Value: `${firstName}`},
        {Name: 'family_name', Value: `${lastName}`}
      ],
      TemporaryPassword: 'Welcome2TheFleet!'
  }

  try {
    const command = new AdminCreateUserCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}

