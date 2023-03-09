import { APIGatewayProxyResult } from 'aws-lambda';

export class HttpResponse {
  public static created(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(201, body);
  }

  public static internalServerError(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(500, body);
  }

  public static badRequest(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(400, body);
  }

  private static createResponse(
    statusCode: number,
    body?: string
  ): APIGatewayProxyResult {
    return { statusCode, body: body ?? '' };
  }
}
