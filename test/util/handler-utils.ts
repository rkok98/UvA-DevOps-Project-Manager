import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventIdentity,
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
  Context,
} from 'aws-lambda';

export const mockRequestContext: APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext> =
  {
    accountId: '',
    apiId: '',
    authorizer: {},
    httpMethod: '',
    identity: {} as APIGatewayEventIdentity,
    path: '',
    protocol: '',
    requestId: '',
    requestTimeEpoch: 0,
    resourceId: '',
    resourcePath: '',
    stage: '',
  };

export const mockEvent: APIGatewayProxyEvent = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: '',
  isBase64Encoded: false,
  path: '',
  pathParameters: null,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  resource: '',
  requestContext: mockRequestContext,
};

export const mockContext: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: '',
  functionVersion: '',
  invokedFunctionArn: '',
  memoryLimitInMB: '',
  awsRequestId: '',
  logGroupName: '',
  logStreamName: '',
  getRemainingTimeInMillis: function (): number {
    throw new Error('Function not implemented.');
  },
  done: function (error?: Error | undefined, result?: any): void {
    throw new Error('Function not implemented.');
  },
  fail: function (error: string | Error): void {
    throw new Error('Function not implemented.');
  },
  succeed: function (messageOrObject: any): void {
    throw new Error('Function not implemented.');
  },
};

export default { mockEvent, mockContext, mockRequestContext };
