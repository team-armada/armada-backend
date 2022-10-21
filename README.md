# Armada Backend

### Todos

- [x] Create API endpoint to _run a new task_
  - [x] Create an express server
  - [x] Install AWS ECS SDK
  - [x] Authenticate to AWS
  - [x] Connect to our running cluster
  - [x] Run a task using the ECS SDK
  - [x] Create a task definition

---

#### Current tasks

- [x] Stop/pause a task (workspace)
- [ ] Delete a task (workspace)
- [ ] Delete a task definition (workspace template)
- [ ] Edit a task definition (workspace template)
  - Limit running tasks
  - Reduce running tasks
  - Increase running tasks

---

- [ ] List all currently running tasks
- [ ] List all currently running tasks of a specific task definition
- [ ] List all task definitions
- [ ] Whitelist a student
  - Black list: have a list of student that don't have access
  - White list: have a list of student that have access
- [ ] Persist workspace files to a volume
  - Associate with a student ID
- [ ] Add database to the workspace (different type of task?)

## Workflow

- When admin clicks on `Create workspace template` template button
  - Create task definition
- When user clicks on `Launch workspace`
  - Run the task definition

## Notes

## ECS Client

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ecs/classes/ecs.html

## ECS Client Config

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ecs/interfaces/ecsclientconfig.html

## API Run Task

https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RunTask.html

## Run Task

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ecs/classes/runtaskcommand.html

## Start a task

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ecs/interfaces/starttaskcommandinput.html

https://aws.amazon.com/premiumsupport/knowledge-center/iam-validate-access-credentials/

## Co-Author Emails

Co-authored-by: Author: Natalie Martos <natalie.martos@gmail.com>
Co-authored-by: Sergio Pichardo <sergiopichardo@users.noreply.github.com>
