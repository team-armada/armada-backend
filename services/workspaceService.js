const { RunTaskCommand, StopTaskCommand } = require("@aws-sdk/client-ecs");
const client = require("../utils/ecsClient.js");

/*
  Run a workspace

  example request: 
  {
    "count": 1,
    "taskDefinition": "hello_world",
    "student_id": "023jfaosdlfj"
  }
*/
const runWorkspace = async (taskDefinitionARN) => {
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

/**
 * Stop a workspace
 * @param {string} taskID - workspace id
 *                        - e.g. "1dc5c17a-422b-4dc4-b493-371970c6c4d6"
 * @param {string} reason - reason for stopping workspace
 */
const stopWorkspace = async (taskID, reason = "SESSION_ENDED") => {
  const input = {
    cluster: process.env.CLUSTER,
    reason: reason,
    task: taskID,
  };

  const command = new StopTaskCommand(input);

  try {
    const data = await client.send(command);
    return data;
  } catch (err) {
    console.error(err.message);
  }
};

module.exports = {
  runWorkspace,
  stopWorkspace,
};
