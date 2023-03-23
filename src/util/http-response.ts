import { APIGatewayProxyResult } from 'aws-lambda';

export class HttpResponse {
  static ok<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(200, body);
  }

  public static created<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(201, body);
  }

  public static updated<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(204, body);
  }

  public static accepted<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(202, body);
  }

  public static internalServerError<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(500, body);
  }

  public static badRequest<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(400, body);
  }

  public static unauthorized<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(401, body);
  }

  public static notFound<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(404, body);
  }

  private static createResponse<T>(
    statusCode: number,
    body?: T
  ): APIGatewayProxyResult {
    return { statusCode, body: JSON.stringify(body) };
  }
}
