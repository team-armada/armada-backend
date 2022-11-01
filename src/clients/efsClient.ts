import { EFSClient, DescribeFileSystemsCommand } from '@aws-sdk/client-efs';

const config = {
  region: process.env.AWS_REGION,
  Credentials: {
    AccessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    SecretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
};

const client = new EFSClient(config);

export async function retrieveActiveFileSystems() {
  const input = {};
  const command = new DescribeFileSystemsCommand(input);
  const response = await client.send(command);
  return response;
}

export async function retrieveFileSystemId(): Promise<string> {
  const efsVolumes = await retrieveActiveFileSystems();
  const id = efsVolumes.FileSystems?.filter(
    filesystem => filesystem.Name === 'ArmadaPermanentStorage'
  )[0].FileSystemId;

  if (!id) {
    throw new Error(
      'Armada Permanent Storage could not be found. Please ensure that all infrastructure was successfully created.'
    );
  }

  return id;
}

export default client;
