const {
  ECSClient,
  RunTaskCommand,
  RegisterTaskDefinitionCommand,
} = require("@aws-sdk/client-ecs");

const config = {
  region: "us-east-1",
  accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
};

const client = new ECSClient(config);

module.exports = client;
