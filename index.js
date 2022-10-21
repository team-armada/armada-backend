const express = require("express");
const cors = require("cors");

const { StatusCodes } = require("http-status-codes");

require("dotenv").config();

const { 
  runWorkspace, 
  stopWorkspace 
} = require("./services/workspaceService");

const {
  createWorkspaceTemplate,
  getAllWorkspaceTemplates,
} = require("./services/templateService");

const app = express();
app.use(express.json());

const PORT = process.env.PORT;

app.use(cors());

/**
 * Get all workspace templates
 */
app.get("/templates", async (req, res) => {
  // ARN
  /*
    [
      {
        templateID: "asldkfjawoiejfa", 
        title: family, 
        workspacesCount: 20 
      },
      {
        templateID: "asldkfjawoiejfa", 
        title: family, 
        workspacesCount: 20 
      },
      {
        templateID: "asldkfjawoiejfa", 
        title: family, 
        workspacesCount: 20 
      },
    ]
  */
  const result = await getAllWorkspaceTemplates();

  res.status(StatusCodes.OK).json({
    message: "Success: Retrieved workspace templates",
    result: result,
  });
});

app.get("/workspaces", () => {});

/**
 * Create a task definition
 */
app.post("/templates", async (req, res) => {
  const { containerDefinition, family } = req.body;

  const result = await createWorkspaceTemplate(containerDefinition, family);

  res.status(StatusCodes.CREATED).json({
    message: "Success: Created a new task definition",
    result: result,
  });
});

/**
 * Runs a workspace (an ECS task)
 */
app.post("/workspaces", async (req, res) => {
  const { taskDefinition } = req.body;

  const result = await runWorkspace(taskDefinition);

  res.status(StatusCodes.CREATED).json({
    message: "Success: Running new workspace",
    result: result,
  });
});

/**
 * Stop a workspace
 */
app.put("/workspaces", async (req, res) => {
  const { taskID, reason } = req.body;

  const result = await stopWorkspace(taskID, reason);

  res.status(StatusCodes.OK).json({
    message: "Success: Stopped a workspace",
    result: result,
  });
});

/**
 * Delete a workspace
 */
app.delete("/workspaces", async (req, res) => {
  const { taskID, reason } = req.body;

  const result = await deleteWorkspace(taskID, reason);

  res.status(StatusCodes.ACCEPTED).json({
    message: `Success: Deleted workspace with id ${taskID}`,
    result: result,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
