// Creation of the API Gateway to catch/accept API calls (get, post, delete, etc.) used for managing the project stack.
import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ProjectConstruct } from './project/project-stack';
import { UserStack } from './user/user-stack';

// Creates two stacks within main stack
export class DevopsProjectManagerStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const region = process.env.CDK_DEFAULT_REGION ?? 'eu-west-1';

    this.api = this.createAPIGateWay('project-management-api');

    // Project stack: Functionalities and resources regarding projects
    new ProjectConstruct(this, 'project-construct', {
      api: this.api,
      region,
    });

    // User stack: Functionalities and resources regarding users
    new UserStack(this, 'user-construct');
  }

  // Creates Amazon API Gateway (RestAPI) for accepting all resource requests
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
