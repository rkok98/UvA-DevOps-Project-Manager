import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { ProjectConstruct } from './project/project-stack';

export class DevopsProjectManagerStack extends Stack {
  public readonly api: RestApi;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.api = this.createAPIGateWay('project-management-api');
    new ProjectConstruct(this, 'project-construct', {
      api: this.api,
      region: 'eu-west-1',
    });
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
