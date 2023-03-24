import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Class for generating HTTP responses for API Gateway events.
 */
export class HttpResponse {
  /**
   * Generates a 200 OK HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  static ok<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(200, body);
  }

  /**
   * Generates a 201 Created HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  public static created<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(201, body);
  }

  /**
   * Generates a 204 No Content HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  public static noContent<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(204, body);
  }

  /**
   * Generates a 202 Accepted HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  public static accepted<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(202, body);
  }

  /**
   * Generates a 500 Internal Server Error HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  public static internalServerError<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(500, body);
  }

  /**
   * Generates a 400 Bad Request HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  public static badRequest<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(400, body);
  }

  /**
   * Generates a 401 Unauthorized HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  public static unauthorized<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(401, body);
  }

  /**
   * Generates a 404 Not Found HTTP response with an optional response body.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  public static notFound<T>(body?: T): APIGatewayProxyResult {
    return HttpResponse.createResponse(404, body);
  }

  /**
   * Helper function for creating an API Gateway response object.
   * @param statusCode - The HTTP status code for the response.
   * @param body - Optional response body.
   * @returns The generated API Gateway response.
   */
  private static createResponse<T>(
    statusCode: number,
    body?: T
  ): APIGatewayProxyResult {
    return { statusCode, body: body ? JSON.stringify(body) : '' };
  }
}
