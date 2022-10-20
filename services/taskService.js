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

/*
Example request 
{
	"containerDefinition": [{
		"name": "exampleContainer",
		"image": "jdguillaume/base-code-server-no-auth",
		"memory": 512,
		"portMappings": [{
			"containerPort": 8080,
			"hostPort": 8080,
			"protocol": "tcp"
		}]
	}],
	"family": "SetupCodeServer",
  --
  
}
*/
const createTaskDefinition = async (containerDefinition, family) => {
  const input = {
    containerDefinitions: containerDefinition,
    family: family,
  };

  try {
    const command = new RegisterTaskDefinitionCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err) {
    console.log(err.message);
  }
};

/*
  Run a new task 

  example request: 
  {
    "count": 1,
    "taskDefinition": "hello_world",
    "student_id": "023jfaosdlfj"
  }
*/
const runTask = async (taskDefinitionARN) => {
  const input = {
    cluster: process.env.CLUSTER,
    taskDefinition: taskDefinitionARN,
    count: 1,
  };

  const command = new RunTaskCommand(input);

  try {
    const data = await client.send(command);
    return data;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  runTask,
  createTaskDefinition,
};
