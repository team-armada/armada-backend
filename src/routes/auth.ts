import { DescribeLoadBalancersCommandOutput } from '@aws-sdk/client-elastic-load-balancing-v2';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

const router = Router();

/**
 * Get Cognito Auth Object
 */
router.get('/cognito', async (req, res) => {
  const result = {
    region: process.env.AWS_REGION,
    userPoolId: process.env.USER_POOL_ID,
    userPoolWebClientId: process.env.USER_POOL_WEB_CLIENT_ID,
    cookieStorage: {
      domain: `localhost`,
      path: '/',
      expires: 365,
      sameSite: 'strict',
      secure: false,
    },
    authenticationFlowType: 'USER_SRP_AUTH',
  };

  res.status(StatusCodes.OK).send({
    message: 'Cognito authentication fetches successfully.',
    result,
  });
});

export default router;
