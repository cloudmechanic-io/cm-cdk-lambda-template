import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import lodashCamelCase from "lodash.camelcase";

/**
 * Parameters for creating an HTTP Lambda function with API Gateway.
 */
export interface HTTPLambdaParams {
    /**
     * The API Gateway instance to attach the Lambda function to.
     */
    api: apigw.RestApi;

    /**
     * Unique ID for the Lambda function. If not provided, a default one is generated.
     */
    id?: string;

    /**
     * The API path to associate with the Lambda function.
     * Supports static paths (e.g., `"users/{id}"`) or greedy matching (`"{proxy+}"`).
     */
    endpointPath: string;

    /**
     * The HTTP method to support (e.g., `"GET"`, `"POST"`, or `"ANY"`).
     * `"ANY"` allows handling all methods.
     */
    method: string;

    /**
     * Folder containing the Lambda function code.
     * If not provided, defaults to the directory where this function is called.
     */
    codeFolder?: string;

    /**
     * The runtime environment for the Lambda function.
     * Defaults to the latest Node.js runtime.
     */
    runtime?: lambda.Runtime;

    /**
     * Memory size for the Lambda function in MB. Defaults to 128 MB.
     */
    memorySize?: number;
}

/**
 * Creates an AWS Lambda function and exposes it over API gateway.
 *
 * @param {HTTPLambdaParams} params - Configuration options for the Lambda function and API Gateway.
 * @returns {{ lambdaFn: lambda.Function }} - The created Lambda function.
 *
 * @example
 * // Create a Lambda function for GET /users/{id}
 * createHTTPLambda({
 *   api,
 *   endpointPath: "users/{id}",
 *   method: "GET",
 * });
 *
 * @example
 * // Create a Lambda function for ANY /{proxy+} (catch-all route)
 * createHTTPLambda({
 *   api,
 *   endpointPath: "{proxy+}",
 *   method: "ANY",
 *   codeFolder: path.join(__dirname, "../src/functions/router"),
 * });
 */
export function createHTTPLambda(params: HTTPLambdaParams) {
    const { api, id, endpointPath, method, runtime, memorySize, codeFolder } = params;

    const lambdaFn = new lambda.Function(api, id || lodashCamelCase(__dirname), {
        runtime: runtime || lambda.Runtime.NODEJS_LATEST,
        handler: "handler.main",
        memorySize: memorySize || 128,
        code: lambda.Code.fromAsset(codeFolder || __dirname),
    });

    // Split path and add each segment as a resource
    const pathSegments = endpointPath.split("/").filter(Boolean);
    let resource = api.root;
    pathSegments.forEach(segment => {
        resource = resource.addResource(segment);
    });

    // Attach the specified HTTP method (or "ANY") to the API Gateway resource
    resource.addMethod(method, new apigw.LambdaIntegration(lambdaFn));

    return { lambdaFn };
}
