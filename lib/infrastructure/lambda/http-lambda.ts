import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

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
    id: string;

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
     */
    codeFolder: string;

    /**
     * The runtime environment for the Lambda function.
     * Defaults to the latest Node.js runtime.
     */
    runtime?: lambda.Runtime;

    /**
     * Memory size for the Lambda function in MB. Defaults to 128 MB.
     */
    memorySize?: number;

    /**
     * An optional IAM role to associate with the Lambda function.
     * If not provided, a new role will be created automatically by CDK.
     */
    role?: iam.Role;

    /**
     * The VPC to associate with the Lambda function.
     * If provided, the Lambda function will be placed in this VPC.
     */
    vpc?: ec2.IVpc;

    /**
     * Security group to associate with the Lambda function.
     * If not provided, no security group is associated by default.
     */
    securityGroup?: ec2.ISecurityGroup;

    /**
     * Subnet selection for the Lambda function's VPC placement.
     * Default is private subnets with NAT.
     */
    subnetSelection?: ec2.SubnetSelection;

    /**
     * Optional environment variables to pass to the Lambda function.
     * These can be set during the CDK deployment or manually defined as key-value pairs.
     *
     * @example
     * environment: {
     *   DATABASE_URL: "mysql://example.com/db",
     *   STAGE: "production",
     *   API_KEY: "my-api-key"
     * }
     *
     */
    environment?: Record<string, string>;
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


    const lambdaFn = new NodejsFunction(api, id, {
        entry: path.join(codeFolder, "handler.ts"), // assumes handler.ts exports 'handler'
        handler: "main",
        runtime: runtime || lambda.Runtime.NODEJS_20_X,
        memorySize: memorySize || 128,
        role: params.role,
        environment: params.environment,

        vpc: params.vpc,
        vpcSubnets: params.subnetSelection,
        securityGroups: params.securityGroup ? [params.securityGroup] : [],

        bundling: {
            minify: true,
            sourceMap: true,
            externalModules: ["aws-sdk"],
            target: "node20",
        },
    });

    const pathSegments = endpointPath.split("/").filter(Boolean);
    let resource = api.root;
    pathSegments.forEach(segment => {
        resource = resource.addResource(segment);
    });

    resource.addMethod(method, new apigw.LambdaIntegration(lambdaFn));

    return { lambdaFn };
}
