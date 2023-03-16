import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { LambdaIntegration, Model, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { CreateTaskModel, GetTaskModel } from './task-models';

export interface TaskStackProps {
    region: string;
    api: RestApi;
}

export class TaskConstruct extends Construct {
    public readonly table: Table;
    public readonly createTaskHandler: NodejsFunction;
    public readonly getTaskHandler: NodejsFunction;

    constructor(scope: Construct, id: string, props: TaskStackProps) {
        super(scope, id);

        this.table = this.createTable('task-table');

        const projectsResources = props.api.root.getResource('projects');

        if (!projectsResources) {
            throw new Error('Project resources not defined');
        }

        this.createTaskHandler = this.createCreateTaskHandler(
            'create-task-handler',
            props.api,
            this.table
        );

        // const projectIdResources = projectsResources.getResource('{project_id}');
        //
        // if (!projectIdResources) {
        //     throw new Error('Project id resources are not defined');
        // }

        this.getTaskHandler = this.createGetTaskHandler(
            'get-task-handler',
            props.api,
            this.table
        )
    }

    private createTable(id: string): Table {
        const table = new Table(this, id, {
            tableName: 'tasks',
            billingMode: BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1,
            removalPolicy: RemovalPolicy.DESTROY,
            partitionKey: { name: 'id', type: AttributeType.STRING },
            pointInTimeRecovery: true,
        });

        return table;
    }
    private createCreateTaskHandler(
        id: string,
        api: RestApi,
        table: Table
    ): NodejsFunction {
        const handler = new NodejsFunction(this, id, {
            functionName: 'create-new-task',
            environment: {
                DYNAMODB_TABLE_NAME: table.tableName,
            },
            runtime: Runtime.NODEJS_18_X,
            entry: path.join(
                __dirname,
                '/../../src/projects/handlers/create-task-handler.ts'
            ),
        });

        table.grantReadWriteData(handler);

        const createTaskModel: Model = api.addModel(
            'CreateTaskModel',
            CreateTaskModel
        );


        api.root
            .addResource('{project_id}')
            .addResource('tasks')
            .addMethod('POST', new LambdaIntegration(handler), {
                requestModels: {
                    'application/json': createTaskModel,
                },
            });

        return handler;
    }

    private createGetTaskHandler(
        id: string,
        api: RestApi,
        table: Table
    ): NodejsFunction {
        const handler = new NodejsFunction(this, id, {
            functionName: 'get-tasks',
            environment: {
                DYNAMODB_TABLE_NAME: table.tableName,
            },
            runtime: Runtime.NODEJS_18_X,
            entry: path.join(
                __dirname,
                '/../../src/projects/handlers/get-task-handler.ts'
            ),
        });

        table.grantReadWriteData(handler);

        const getTaskModel: Model = api.addModel(
            'GetTaskModel',
            GetTaskModel
        );

        api.root.getResource('projects');
        api.root.getResource('{project_id}');

        api.root
            .addResource('tasks')
            .addMethod('GET', new LambdaIntegration(handler), {
                requestModels: {
                    'application/json': getTaskModel,
                },
            });

        return handler;
    }
}
