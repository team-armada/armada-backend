const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');

const config = {
  region: "us-east-1",
  accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID, 
  secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY, 
}

const client = new ECSClient(config); 

console.log(client); 


const runTask = async (count=1, taskDefinition) => {
  // {
  //   cluster: process.env.CLUSTER,
  //   taskDefinition: taskDefinition,
    
  // }
  const input = {
    cluster: process.env.CLUSTER,
    taskDefinition: taskDefinition
    
  }

  const command  = new RunTaskCommand(input); 
  
  try {
    // const data = await client.send(command)
    const data = await client.send(command); 
    return data;
    
  } catch (err) {
    console.error(err.message)
  }
}; 

module.exports = {
  runTask
}