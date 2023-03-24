import handler from '../../../src/tasks/handlers/get-task-handler';
import { APIGatewayProxyResult, Callback } from 'aws-lambda';
import { HttpResponse } from '../../../src/http-util/http-response';
import {
  mockContext,
  mockEvent,
  mockRequestContext,
} from '../../fixtures/lambda-handler-fixtures';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const backupEnv = process.env;
const ddbMock = mockClient(DynamoDBClient);

describe('Get Task Handler Integration Tests', () => {
  beforeEach(() => {
    jest.resetModules();

    ddbMock.reset();
    process.env = {
      ...backupEnv,
      AWS_REGION: 'eu-west-1',
      DYNAMODB_TABLE_NAME: 'project-table',
    };
  });

  afterEach(() => {
    process.env = backupEnv;
  });

  test('Missing AWS_REGION should return internal server error', async () => {
    process.env.AWS_REGION = undefined;

    const res = await handler(
      mockEvent,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(
      HttpResponse.internalServerError(
        'AWS_REGION was not specified in the environment variables'
      )
    );
  });

  test('Missing DYNAMODB_TABLE_NAME should return internal server error', async () => {
    process.env.DYNAMODB_TABLE_NAME = undefined;

    const res = await handler(
      mockEvent,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(
      HttpResponse.internalServerError(
        'DYNAMODB_TABLE_NAME was not specified in the environment variables'
      )
    );
  });

  test('Missing Sub returns internal server error', async () => {
    const event = {
      ...mockEvent,
      requestContext: {
        ...mockRequestContext,
        authorizer: {
          claims: {
            sub: undefined,
          },
        },
      },
      pathParameters: {
        project_id: 'test-id',
      },
    };

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(
      HttpResponse.internalServerError('Something went wrong')
    );
  });

  test('Missing Task ID in URL Path Parameters returns Bad Request', async () => {
    const event = {
      ...mockEvent,
      requestContext: {
        ...mockRequestContext,
        authorizer: {
          claims: {
            sub: 'test-admin-id',
          },
        },
      },
      pathParameters: {
        project_id: 'test-project-id',
        task_id: undefined,
      },
    };

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(HttpResponse.badRequest('Task ID must be specified'));
  });

  test('Successfully returns Task', async () => {
    const event = {
      ...mockEvent,
      requestContext: {
        ...mockRequestContext,
        authorizer: {
          claims: {
            sub: 'test-admin-id',
          },
        },
      },
      pathParameters: {
        project_id: 'test-project-id',
        task_id: 'test-task-id',
      },
    };

    ddbMock.on(GetItemCommand).resolves({
      Item: {
        id: { S: 'test-task-id' },
        title: { S: 'test-name' },
        description: { S: 'test-description' },
        adminId: { S: 'test-admin-id' },
        dateTime: { S: 'test-task-date' },
        createdBy: { S: 'created-by' },
        state: { S: 'To-Do' },
      },
    });

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(
      HttpResponse.ok({
        id: 'test-task-id',
        title: 'test-name',
        description: 'test-description',
        adminId: 'test-admin-id',
        dateTime: 'test-task-date',
        createdBy: 'created-by',
        state: 'To-Do',
      })
    );
  });
});
