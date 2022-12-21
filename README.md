# Armada Backend

Armada's backend server is built with [Express](https://expressjs.com/) and
utilizes [Prisma](https://www.prisma.io/) and the Amazon Web Services' (AWS)
[Software Development Kit](https://aws.amazon.com/sdk-for-javascript/) (SDK) to
communicate with all the pieces of Armada's architecture, including the
[Relational Database Service](https://aws.amazon.com/rds/) (RDS), the
[Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html)
(ALB), the [Elastic Container Service](https://aws.amazon.com/ecs/) (ECS), and
more!

To get started:

1. Clone the GitHub repository.

```bash
gh repo clone team-armada/armada-backend
cd armada-backend
```

2. Set the appropriate environmental variables in a `.env` file.

```
PORT=3000
AWS_REGION=us-east-1
AWS_IAM_ACCESS_KEY_ID="your-access-key"
AWS_IAM_SECRET_ACCESS_KEY="your-secret-key"
DATABASE_URL="your-postgres-url"
USER_POOL_ID="aws-cognito-url"
USER_POOL_WEB_CLIENT_ID="aws-cognito-user-pool-url"
```

3. Install all dependencies.

```bash
npm install
```

4. Start the development server.

```
npm run dev
```

5. The `api` server will be available for requests based on the port set in
   `.env`.
