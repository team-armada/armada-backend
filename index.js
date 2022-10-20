const express = require("express");
const cors = require("cors");

const { StatusCodes } = require("http-status-codes");
const { runTask, createTaskDefinition } = require("./services/taskService");

const app = express();
app.use(express.json());

require("dotenv").config();
const PORT = process.env.PORT;

app.use(cors());

/**
 * Create a task definition
 */
app.post("/template", async (req, res) => {
  const { containerDefinition, family } = req.body;

  const result = await createTaskDefinition(containerDefinition, family);

  res.status(StatusCodes.CREATED).json({
    message: "Success: Created a new task definition",
    result: result,
  });
});

app.post("/task", async (req, res) => {
  const { count, taskDefinition } = req.body;
  // use `count` and `taskDefinition` to run task

  const result = await runTask(taskDefinition);

  res.status(StatusCodes.CREATED).json({
    message: "Success: Running new task",
    result: result,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
