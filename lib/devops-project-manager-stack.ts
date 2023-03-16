import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ProjectConstruct } from './project/project-stack';
import { UserStack } from './user/user-stack';
import { TaskConstruct } from './project/task-stack';

export class DevopsProjectManagerStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const region = process.env.CDK_DEFAULT_REGION ?? 'eu-west-1';

    this.api = this.createAPIGateWay('project-management-api');

    new ProjectConstruct(this, 'project-construct', {
      api: this.api,
      region,
    });

    new TaskConstruct(this, 'task-construct', {
      api: this.api,
      region,
    });

    new UserStack(this, 'user-construct');
  }

  private createAPIGateWay(id: string): RestApi {
    const api = new RestApi(this, id, {
      restApiName: 'rest-api',
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

    return api;
  }
}
