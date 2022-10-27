import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const config = {
  region: process.env.AWS_REGION,
  Credentials: {
    AccessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    SecretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
};

const client = new LambdaClient(config);

export async function createEFSFolders(payload: string) {
  try {
    const command = new InvokeCommand({
      FunctionName: 'createEFSFolders',
      Payload: new TextEncoder().encode(JSON.stringify({ directory: payload })),
    });
    const response = await client.send(command);

    // TODO: If we want the response, we'll have to parse it from TextEncoder
    // Example Solution: const responseObject = JSON.parse(new TextDecoder('utf-8').decode(result.Payload) || '{}');
    return response;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(err.message);
    }
  }
}

export default client;
