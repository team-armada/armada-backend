const express = require("express");
const cors = require("cors");

const { StatusCodes } = require('http-status-codes');
const { runTask } = require('./services/runTaskService'); 

const app = express();
app.use(express.json());

require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors())


/*
  example request: 
  {
    "count": 1,
    "taskDefinition": "hello_world"
  }
*/
app.post('/task', async (req, res) => {
  const { count, taskDefinition } = req.body; 
  // use `count` and `taskDefinition` to run task 
  const result = await runTask(count, taskDefinition)
  

  res
    .status(StatusCodes.CREATED)
    .json({
      message: "Success: Running new task",
      result: result
    })
}); 

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})

