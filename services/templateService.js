const client = require("../utils/ecsClient.js");

const {
  RegisterTaskDefinitionCommand,
  ListTaskDefinitionsCommand,
} = require("@aws-sdk/client-ecs");
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
}
*/
const createWorkspaceTemplate = async (containerDefinition, family) => {
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

/**
 * Get All Workspace Templates
 */
const getAllWorkspaceTemplates = async () => {
  const input = {
    // familyPrefix: null,
    maxResults: 100,
    // nextToken: null,
    sort: "ASC",
    status: "ACTIVE",
  };

  try {
    const command = new ListTaskDefinitionsCommand(input);
    const response = await client.send(command);
    return response;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  createWorkspaceTemplate,
  getAllWorkspaceTemplates,
};
