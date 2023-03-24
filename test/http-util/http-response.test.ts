import { APIGatewayProxyResult } from 'aws-lambda';
import { HttpResponse } from '../../src/http-util/http-response';

describe('HttpResponse', () => {
  describe.each([
    [HttpResponse.ok, 200, 'OK'],
    [HttpResponse.created, 201, 'Created'],
    [HttpResponse.accepted, 202, 'Accepted'],
    [HttpResponse.noContent, 204, 'No Content'],
    [HttpResponse.badRequest, 400, 'Bad Request'],
    [HttpResponse.unauthorized, 401, 'Unauthorized'],
    [HttpResponse.notFound, 404, 'Not Found'],
    [HttpResponse.internalServerError, 500, 'Internal Server Error'],
  ])(
    '%p',
    (
      method: <T>(body?: T) => APIGatewayProxyResult,
      statusCode: number,
      message: string
    ) => {
      it(`should return a ${statusCode} status code and the provided body message ${message}`, () => {
        const body = { message };
        const expected: APIGatewayProxyResult = {
          statusCode,
          body: JSON.stringify(body),
        };
        expect(method(body)).toEqual(expected);
      });

      it(`should return a ${statusCode} status code and an empty body when no body is provided`, () => {
        const expected: APIGatewayProxyResult = {
          statusCode,
          body: '',
        };
        expect(method()).toEqual(expected);
      });
    }
  );
});
