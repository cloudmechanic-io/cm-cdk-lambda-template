import { APIGatewayProxyResult } from "aws-lambda";

export function ok<T>(body: T): APIGatewayProxyResult {
  return generateResponse(200, body);
}

export function badRequest<T>(body: T): APIGatewayProxyResult {
  return generateResponse(400, {
    ...body,
    isError: true,
  });
}

export function forbidden<T>(body: T): APIGatewayProxyResult {
  return generateResponse(403, {
    ...body,
    isError: true,
  });
}

export function unauthorized<T>(body: T): APIGatewayProxyResult {
  return generateResponse(401, {
    ...body,
    isError: true,
  });
}

export function notFound<T>(body: T): APIGatewayProxyResult {
  return generateResponse(404, {
    ...body,
    isError: true,
  });
}

export function generateResponse<T>(
  statusCode: number,
  body: T,
): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    headers: {
      "Content-type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: JSON.stringify(body),
  };
}
