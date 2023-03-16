import { APIGatewayProxyResult } from 'aws-lambda';

export class HttpResponse {
  static ok(body?: any): APIGatewayProxyResult {
    return HttpResponse.createResponse(200, body);
  }

  public static created(body?: any): APIGatewayProxyResult {
    return HttpResponse.createResponse(201, body);
  }

  public static accepted(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(202, body);
  }

  public static internalServerError(body?: any): APIGatewayProxyResult {
    return HttpResponse.createResponse(500, body);
  }

  public static badRequest(body?: any): APIGatewayProxyResult {
    return HttpResponse.createResponse(400, body);
  }

  public static unauthorized(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(401, body);
  }

  public static notFound(body?: any): APIGatewayProxyResult {
    return HttpResponse.createResponse(404, body);
  }

  private static createResponse(
    statusCode: number,
    body?: any
  ): APIGatewayProxyResult {
    return { statusCode, body: JSON.stringify(body) };
  }
}
