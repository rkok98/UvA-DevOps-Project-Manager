import { APIGatewayProxyResult } from 'aws-lambda';
import { Project } from '../projects/models/project';

export class HttpResponse {
  // TODO: Remove, or make for getRequest handler "ok" response
  static ok(body?: string): APIGatewayProxyResult {
      return HttpResponse.createResponse(200, body);
  }

  public static created(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(201, body);
  }

  public static internalServerError(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(500, body);
  }

  public static badRequest(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(400, body);
  }

  public static notFound(body?: string): APIGatewayProxyResult {
    return HttpResponse.createResponse(404, body);
  }

  private static createResponse(
    statusCode: number,
    body?: string
  ): APIGatewayProxyResult {
    return { statusCode, body: body ?? '' };
  }
}
