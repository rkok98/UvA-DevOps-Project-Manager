import handler from '../../../src/tasks/handlers/delete-task-handler';
import { APIGatewayProxyResult, Callback } from 'aws-lambda';
import { HttpResponse } from '../../../src/http-util/http-response';
import {
  mockContext,
  mockEvent,
  mockRequestContext,
} from '../../fixtures/lambda-handler-fixtures';
import { mockClient } from 'aws-sdk-client-mock';
import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';

const backupEnv = process.env;
const ddbMock = mockClient(DynamoDBClient);

describe('Delete Task Handler Integration Tests', () => {
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

  test('Missing sub should return internal server error', async () => {
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

  test('Missing Project ID in URL Path Parameters returns Bad Request', async () => {
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
        project_id: undefined,
      },
    };

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(HttpResponse.badRequest('Project ID cannot be empty'));
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
        project_id: undefined,
        task_id: 'test-task-id',
      },
    };

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(HttpResponse.badRequest('Project ID cannot be empty'));
  });

  test('Successfully returns Deleted', async () => {
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
        project_id: 'test-id',
        task_id: 'test-task-id',
      },
    };

    ddbMock.on(DeleteItemCommand).resolves({});

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(HttpResponse.accepted());
  });
});
