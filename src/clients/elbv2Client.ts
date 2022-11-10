import {
  ElasticLoadBalancingV2Client,
  DescribeTargetGroupsCommand,
  CreateTargetGroupCommand,
  DescribeLoadBalancersCommand,
  CreateTargetGroupCommandInput,
  ModifyTargetGroupAttributesCommandInput,
  ModifyTargetGroupAttributesCommand,
  DescribeListenersCommand,
  CreateRuleCommand,
  CreateRuleCommandInput,
  ModifyListenerCommandInput,
  ModifyListenerCommand,
  TargetGroupTuple,
  Action,
} from '@aws-sdk/client-elastic-load-balancing-v2';

const config = {
  region: process.env.AWS_REGION,
  Credentials: {
    AccessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    SecretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
};

const client = new ElasticLoadBalancingV2Client(config);

export async function describeALB() {
  const input = {
    Names: ['ArmadaLoadBalancer'],
  };
  const command = new DescribeLoadBalancersCommand(input);
  const response = await client.send(command);
  return response;
}

export async function retrieveALBTargetGroup() {
  const input = {
    Names: ['ArmadaTargetGroup'],
  };

  const command = new DescribeTargetGroupsCommand(input);
  const response = await client.send(command);

  if (!response) {
    throw new Error('No response received from AWS.');
  } else if (!response.TargetGroups) {
    throw new Error('No Target Groups located.');
  }

  const targetGroupArn = response.TargetGroups[0].TargetGroupArn;

  if (targetGroupArn === undefined) {
    throw new Error(
      'Armada Target Group ARN could not be found. Please ensure that all infrastructure was successfully created.'
    );
  }

  return targetGroupArn;
}

export async function createALBTargetGroup(name: string, vpc: string) {
  const input = {
    Name: name,
    HealthCheckPath: '/healthz',
    LoadBalancerArns: [
      'ArmadaLoadBalancer-1280959169.us-east-1.elb.amazonaws.com',
    ],
    Port: 80,
    Protocol: 'HTTP',
    VpcId: vpc,
  };

  const command = new CreateTargetGroupCommand(input);
  const response = await client.send(command);
  return response;
}

export async function getListener(LoadBalancerArn: string) {
  const input = {
    LoadBalancerArn,
  };

  const command = new DescribeListenersCommand(input);
  const response = await client.send(command);
  return response;
}

export async function createRule(
  ListenerArn: string,
  serviceName: string,
  targetGroupArn: string
) {
  const input: CreateRuleCommandInput = {
    Actions: [
      {
        Type: 'forward',
        TargetGroupArn: targetGroupArn,
      },
    ],
    Conditions: [
      {
        Field: 'path-pattern',
        PathPatternConfig: {
          Values: [`/${serviceName}*`],
        },
      },
    ],
    ListenerArn,
    Priority: 25,
  };

  const command = new CreateRuleCommand(input);
  const response = await client.send(command);
  return response;
}

export async function modifyListener(
  defaultActions: Action[],
  targetGroupArn: string,
  listenerArn: string
) {
  const input: ModifyListenerCommandInput = {
    DefaultActions: defaultActions,
    ListenerArn: listenerArn,
  };

  input.DefaultActions?.[0].ForwardConfig?.TargetGroups?.push({
    TargetGroupArn: targetGroupArn,
    Weight: 1,
  });

  const command = new ModifyListenerCommand(input);
  const response = await client.send(command);
  return response;
}

export default client;
