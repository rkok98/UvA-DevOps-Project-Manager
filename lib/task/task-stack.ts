// The task stack: Creation of a task object, a table for task objects,
// and API handler for: creation of a new task, deleting a new task*, and updating a new task*.

import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import {
  CognitoUserPoolsAuthorizer,
  IResource,
  LambdaIntegration,
  Model, RequestValidator,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { CreateTaskModel } from './task-models';
import { getEnv } from '../../bin/util/get-env';

export interface TaskStackProps {
  region: string;
  api: RestApi;
  authorizer: CognitoUserPoolsAuthorizer;
}

// Creates general task table and creates API handler for accessing the task table
export class TaskConstruct extends Construct {
  public readonly table: Table;
  public readonly createTaskHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props: TaskStackProps) {
    super(scope, id);

    const tasksResource = props.api.root.getResource('projects')
        ?.getResource('{project_id}')
        ?.addResource('tasks');

    if (!tasksResource) {
      throw new Error('projects/{project_id}/tasks not defined');
    }

    this.table = this.createTable('task-table');

    this.createTaskHandler = this.createCreateTaskHandler(
      'create-task-handler',
      props.api,
      tasksResource,
      props.authorizer,
      this.table
    );
  }

  // Creation of the general table containing all tasks
  private createTable(id: string): Table {
    return new Table(this, getEnv(this, id), {
      tableName: getEnv(this, 'tasks'),
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      pointInTimeRecovery: true,
    });
  }

  // API handler for actions regarding tasks in the table in DynamoDB (the resource)
  // Note: For configuring the API model, `addResource` and `addMethod` are used -> API will automatically
  // be deployed and accessible from a public endpoint.
  private createCreateTaskHandler(
    id: string,
    api: RestApi,
    tasksResource: IResource,
    authorizer: CognitoUserPoolsAuthorizer,
    table: Table
  ): NodejsFunction {
    const handler = new NodejsFunction(this, getEnv(this, id), {
      functionName: getEnv(this, 'create-new-task'),
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      },
      runtime: Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        '/../../src/tasks/handlers/create-task-handler.ts'
      ),
    });

    table.grantReadWriteData(handler);

    const createTaskModel: Model = api.addModel(
      'CreateTaskModel',
      CreateTaskModel
    );

    const validator = new RequestValidator(this, 'create-task-validator', {
      validateRequestBody: true,
      restApi: api
    });

    tasksResource.addMethod('POST', new LambdaIntegration(handler), {
      requestValidator: validator,
      requestModels: {
        'application/json': createTaskModel,
      },
      authorizer,
    });

    return handler;
  }
}
