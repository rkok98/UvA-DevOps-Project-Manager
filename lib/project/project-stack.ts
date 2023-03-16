import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {
  IResource,
  LambdaIntegration,
  Model,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { CreateProjectModel } from './project-models';
import { getEnv } from '../../bin/util/get-env';

export interface ProjectStackProps {
  region: string;
  api: RestApi;
}

export class ProjectConstruct extends Construct {
  public readonly table: Table;
  public readonly createProjectHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: ProjectStackProps) {
    super(scope, id);

    const projectsResource = props.api.root.addResource('projects');

    this.table = this.createTable('project-table');

    this.createProjectHandler = this.createCreateProjectHandler(
      'create-project-handler',
      props.api,
      projectsResource,
      this.table
    );
  }

  private createTable(id: string): Table {
    return new Table(this, getEnv(this, id), {
      tableName: getEnv(this, 'projects'),
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });
  }

  private createCreateProjectHandler(
    id: string,
    api: RestApi,
    projectsResource: IResource,
    table: Table
  ): NodejsFunction {
    const handler = new NodejsFunction(this, getEnv(this, id), {
      functionName: getEnv(this, 'create-new-project'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        '/../../src/projects/handlers/create-project-handler.ts'
      ),
    });

    table.grantReadWriteData(handler);

    const createProjectModel: Model = api.addModel(
      'CreateProjectModel',
      CreateProjectModel
    );

    projectsResource.addMethod('POST', new LambdaIntegration(handler), {
      requestValidatorOptions: {
        validateRequestBody: true,
      },
      requestModels: {
        'application/json': createProjectModel,
      },
    });

    return handler;
  }
}
