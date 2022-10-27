import {
  CloudFormationClient,
  DescribeStackResourcesCommand,
} from '@aws-sdk/client-cloudformation';

const config = {
  region: process.env.AWS_REGION,
  Credentials: {
    AccessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    SecretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
};

const client = new CloudFormationClient(config);

async function getStackResources() {
  const command = new DescribeStackResourcesCommand({
    StackName: 'ArmadaInfrastructureStack',
  });

  const response = await client.send(command);
  console.log(response);
}

getStackResources();

// export default client;
