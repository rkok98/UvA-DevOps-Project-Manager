import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ProjectConstruct } from './project/project-stack';
import { UserStack } from './user/user-stack';
import { getEnv } from '../bin/util/get-env';

export class DevopsProjectManagerStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const region = process.env.CDK_DEFAULT_REGION ?? 'eu-west-1';

    this.api = this.createAPIGateWay('project-management-api');

    const userStack = new UserStack(this, 'user-construct');

    new ProjectConstruct(this, 'project-construct', {
      api: this.api,
      authorizer: userStack.authorizer,
      region,
    });
  }

  private createAPIGateWay(id: string): RestApi {
    return new RestApi(this, id, {
      restApiName: getEnv(this, 'rest-api'),
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    });
  }
}
