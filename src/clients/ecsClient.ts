import { ECSClient } from '@aws-sdk/client-ecs';

const config = {
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
};

const client = new ECSClient(config);

export default client;
