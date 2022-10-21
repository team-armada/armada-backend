# Armada Backend

## Completed Todos

- [x] create ecs client and authenticate to AWS
- [x] run a workspace
- [x] stop workspace
- [x] create workspace template
- [x] get all workspace templates
- [x] delete workspace templates

#### Current tasks

- [ ] Delete a workspace
- [ ] Delete a workspace template
- [ ] Edit a workspace template
  - Limit running tasks
  - Reduce running tasks
  - Increase running tasks

---

## Brainstorming

- [ ] List all currently running tasks
- [ ] List all currently running tasks of a specific task definition
- [ ] List all task definitions
- [ ] Whitelist a student
  - Black list: have a list of student that don't have access
  - White list: have a list of student that have access
- [ ] Persist workspace files to a volume
  - Associate with a student ID
- [ ] Add database to the workspace (different type of task?)
- When admin clicks on `Create workspace template` template button
  - Create task definition
- When user clicks on `Launch workspace`
  - Run the task definition

## Useful Links

### ECS SDK docs

https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ecs/index.html

### ECS Docs

https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_Operations.html

### ECS CDK

https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ecs-readme.html

## Co-Author Emails

Co-authored-by: Author: Natalie Martos <natalie.martos@gmail.com>
Co-authored-by: Sergio Pichardo <sergiopichardo@users.noreply.github.com>
