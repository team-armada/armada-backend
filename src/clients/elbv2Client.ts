import {
  ElasticLoadBalancingV2Client,
  DescribeTargetGroupsCommand
} from "@aws-sdk/client-elastic-load-balancing-v2";

const config = {
  region: process.env.AWS_REGION,
  Credentials: {
    AccessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    SecretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
};

const client = new ElasticLoadBalancingV2Client(config)

export async function retrieveALBTargetGroup(){
  const input = {
    Names: ['ArmadaTargetGroup']
  }

  const command = new DescribeTargetGroupsCommand(input);
  const response = await client.send(command);

  if (!response){
    throw new Error('No response received from AWS.')
    } else if (!response.TargetGroups) {
      throw new Error('No Target Groups located.')
    }

  const targetGroupArn = response.TargetGroups[0].TargetGroupArn

  if (targetGroupArn === undefined){
    throw new Error(
      'Armada Target Group ARN could not be found. Please ensure that all infrastructure was successfully created.'
    );
  }

  return targetGroupArn
}

export default client;