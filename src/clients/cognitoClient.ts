import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

const config = {
  region: process.env.AWS_REGION,
  Credentials: {
    AccessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    SecretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
};

const client = new CognitoIdentityProviderClient(config);

export default client;