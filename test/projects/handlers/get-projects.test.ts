import handler from '../../../src/projects/handlers/get-projects-handler';
import { APIGatewayProxyResult, Callback } from 'aws-lambda';
import { HttpResponse } from '../../../src/http-util/http-response';
import {
  mockContext,
  mockEvent,
  mockRequestContext,
} from '../../fixtures/lambda-handler-fixtures';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const backupEnv = process.env;
const ddbMock = mockClient(DynamoDBClient);

describe('Get Projects Handler Integration Tests', () => {
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

  test('Successfully returns empty list on no results', async () => {
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
      },
    };

    ddbMock.on(ScanCommand).resolves({
      Items: [],
    });

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(HttpResponse.ok([]));
  });

  test('Internal Server Error is returned when something goes wrong within DynamoDB', async () => {
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
      },
    };

    const errorMessage = 'Something goes wrong';

    ddbMock.on(ScanCommand).rejects(new Error(errorMessage));

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(HttpResponse.internalServerError(errorMessage));
  });

  test('Successfully returns Projects', async () => {
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
      },
    };

    ddbMock.on(ScanCommand).resolves({
      Items: [
        {
          id: { S: 'test-id-1' },
          name: { S: 'test-name-1' },
          description: { S: 'test-description-1' },
          adminId: { S: 'test-admin-id' },
        },
        {
          id: { S: 'test-id-2' },
          name: { S: 'test-name-2' },
          description: { S: 'test-description-2' },
          adminId: { S: 'test-admin-id' },
        },
      ],
    });

    const res = await handler(
      event,
      mockContext,
      {} as Callback<APIGatewayProxyResult>
    );

    expect(res).toEqual(
      HttpResponse.ok([
        {
          id: 'test-id-1',
          name: 'test-name-1',
          description: 'test-description-1',
          adminId: 'test-admin-id',
        },
        {
          id: 'test-id-2',
          name: 'test-name-2',
          description: 'test-description-2',
          adminId: 'test-admin-id',
        },
      ])
    );
  });
});
