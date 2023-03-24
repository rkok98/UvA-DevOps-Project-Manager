// The project stack: Creation of a project object, a table for project objects,
// and API handler for: creation of a new project, deleting a new project*, and updating a new project*.

import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {
  CognitoUserPoolsAuthorizer,
  IResource,
  LambdaIntegration,
  Model,
  RequestValidator,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { CreateProjectModel, UpdateProjectModel } from './project-models';
import { getEnv } from '../../bin/util/get-env';

export interface ProjectStackProps {
  region: string;
  api: RestApi;
  authorizer: CognitoUserPoolsAuthorizer;
}

// Creates general project table and creates API handler for accessing the project table
export class ProjectConstruct extends Construct {
  public readonly table: Table;
  public readonly createProjectHandler: NodejsFunction;
  public readonly deleteProjectHandler: NodejsFunction;
  public readonly getProjectHandler: NodejsFunction;
  public readonly getProjectsHandler: NodejsFunction;
  public readonly updateProjectHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: ProjectStackProps) {
    super(scope, id);

    const projectsResource = props.api.root.addResource('projects');
    const projectsIdResource = projectsResource.addResource('{project_id}');

    this.table = this.createTable('project-table');

    this.createProjectHandler = this.createCreateProjectHandler(
      'create-project-handler',
      props.api,
      projectsResource,
      props.authorizer,
      this.table
    );

    this.deleteProjectHandler = this.createDeleteProjectHandler(
      'delete-project-handler',
      projectsIdResource,
      props.authorizer,
      this.table
    );

    this.getProjectHandler = this.createGetProjectHandler(
      'get-project-handler',
      projectsIdResource,
      props.authorizer,
      this.table
    );

    this.getProjectsHandler = this.createGetProjectsHandler(
      'get-projects-handler',
      projectsResource,
      props.authorizer,
      this.table
    );

    this.updateProjectHandler = this.createUpdateProjectHandler(
      'update-project-handler',
      props.api,
      projectsIdResource,
      props.authorizer,
      this.table
    );
  }

  // Creation of the general table containing all projects
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

  // API handler for actions regarding projects in the table in DynamoDB (the resource)
  // Note: For configuring the API model, `addResource` and `addMethod` are used -> API will automatically
  // be deployed and accessible from a public endpoint.
  private createCreateProjectHandler(
    id: string,
    api: RestApi,
    projectsResource: IResource,
    authorizer: CognitoUserPoolsAuthorizer,
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
      tracing: Tracing.ACTIVE,
    });

    table.grantReadWriteData(handler);

    const createProjectModel: Model = api.addModel(
      'CreateProjectModel',
      CreateProjectModel
    );

    const validator = new RequestValidator(this, 'create-project-validator', {
      validateRequestBody: true,
      restApi: api,
    });

    projectsResource.addMethod('POST', new LambdaIntegration(handler), {
      requestValidator: validator,
      requestModels: {
        'application/json': createProjectModel,
      },
      authorizer,
    });

    return handler;
  }

  private createDeleteProjectHandler(
    id: string,
    projectsResource: IResource,
    authorizer: CognitoUserPoolsAuthorizer,
    table: Table
  ): NodejsFunction {
    const handler = new NodejsFunction(this, getEnv(this, id), {
      functionName: getEnv(this, 'delete-new-project'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        '/../../src/projects/handlers/delete-project-handler.ts'
      ),
      tracing: Tracing.ACTIVE,
    });

    table.grantReadWriteData(handler);

    projectsResource.addMethod('DELETE', new LambdaIntegration(handler), {
      authorizer,
    });

    return handler;
  }

  private createGetProjectHandler(
    id: string,
    projectsResource: IResource,
    authorizer: CognitoUserPoolsAuthorizer,
    table: Table
  ): NodejsFunction {
    const handler = new NodejsFunction(this, getEnv(this, id), {
      functionName: getEnv(this, 'get-project'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        '/../../src/projects/handlers/get-project-handler.ts'
      ),
      tracing: Tracing.ACTIVE,
    });

    table.grantReadWriteData(handler);

    projectsResource.addMethod('GET', new LambdaIntegration(handler), {
      authorizer,
    });

    return handler;
  }

  private createGetProjectsHandler(
    id: string,
    projectsResource: IResource,
    authorizer: CognitoUserPoolsAuthorizer,
    table: Table
  ): NodejsFunction {
    const handler = new NodejsFunction(this, getEnv(this, id), {
      functionName: getEnv(this, 'get-projects'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        '/../../src/projects/handlers/get-projects-handler.ts'
      ),
      tracing: Tracing.ACTIVE,
    });

    table.grantReadWriteData(handler);

    projectsResource.addMethod('GET', new LambdaIntegration(handler), {
      authorizer,
    });

    return handler;
  }

  private createUpdateProjectHandler(
    id: string,
    api: RestApi,
    updateProjectsResource: IResource,
    authorizer: CognitoUserPoolsAuthorizer,
    table: Table
  ): NodejsFunction {
    const handler = new NodejsFunction(this, getEnv(this, id), {
      functionName: getEnv(this, 'update-project'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        '/../../src/projects/handlers/update-project-handler.ts'
      ),
      tracing: Tracing.ACTIVE,
    });

    table.grantReadWriteData(handler);

    const updateProjectModel: Model = api.addModel(
      'UpdateProjectModel',
      UpdateProjectModel
    );

    const validator = new RequestValidator(this, 'update-project-validator', {
      validateRequestBody: true,
      restApi: api,
    });

    updateProjectsResource.addMethod('PUT', new LambdaIntegration(handler), {
      requestValidator: validator,
      requestModels: {
        'application/json': updateProjectModel,
      },
      authorizer,
    });

    return handler;
  }
}
