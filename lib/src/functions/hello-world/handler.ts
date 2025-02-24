import {APIGatewayProxyEvent} from "aws-lambda";
import {RestApi} from "aws-cdk-lib/aws-apigateway";
import {createHTTPLambda} from "../../../infrastructure/lambda/http-lambda";

async function handler(event: APIGatewayProxyEvent) {
    const {resource, path, httpMethod, headers, queryStringParameters, body} = event;

    const response = {
        resource,
        path,
        httpMethod,
        headers,
        queryStringParameters,
        body,
    };

    return {
        body: JSON.stringify(response, null, 2),
        statusCode: 200,
    };
};

export const main = handler;