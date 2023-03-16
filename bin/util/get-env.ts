import { Construct } from 'constructs';

export const getEnv = (scope: Construct, name: string): string => {
  if (
    process.env.CDK_ENVIRONMENT === 'PRODUCTION' &&
    scope.node.tryGetContext('PROD_ENV')
  ) {
    return `${scope.node.tryGetContext('PROD_ENV')}-${name}`;
  }

  // Find personal CDK environment if not in production
  if (scope.node.tryGetContext('CDK_ENVIRONMENT')) {
    return `${scope.node.tryGetContext('CDK_ENVIRONMENT')}-${name}`;
  }

  throw new Error('Environment not specified in CDK context');
};

export default { getEnv };
