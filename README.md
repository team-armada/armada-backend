# Armada Backend

### Todos

- [x] Create API endpoint to _run a new task_
  - [x] Create an express server
  - [x] Install AWS ECS SDK
  - [x] Authenticate to AWS
  - [x] Connect to our running cluster
  - [x] Run a task using the ECS SDK

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
