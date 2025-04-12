import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";
import path from "path";
import lodashCamelCase from "lodash.camelcase";
import * as iam from "aws-cdk-lib/aws-iam";

/**
 * Parameters for creating a Lambda function that processes messages from an existing SQS queue.
 */
export interface SQSLambdaParams {
    /**
     * The CDK scope (typically `this` in a Stack or Construct).
     */
    scope: Construct;

    /**
     * The existing SQS queue that the Lambda function will consume messages from.
     * Either `queue` or `queueArn` must be provided.
     */
    queue?: sqs.IQueue;

    /**
     * The ARN of an existing SQS queue. If provided, the queue will be imported.
     * Either `queue` or `queueArn` must be provided.
     */
    queueArn?: string;

    /**
     * Unique identifier for the Lambda function. If not provided, a default one is generated.
     */
    lambdaId?: string;

    /**
     * Folder containing the Lambda function code.
     * Defaults to the directory where this function is called.
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

    /**
     * Maximum number of messages the Lambda function should process at once.
     * Defaults to 10.
     */
    batchSize?: number;
}

/**
 * Creates a Lambda function and connects it to an existing SQS queue (by object or ARN).
 *
 * @param {SQSLambdaParams} params - Configuration options for the Lambda function and SQS queue.
 * @returns {{ lambdaFn: lambda.Function }} - The created Lambda function.
 *
 * @example
 * // Example 1: Use an existing SQS queue
 * createSqsLambda({
 *   scope: this,
 *   queue: myQueue,
 *   codeFolder: path.join(__dirname, "../src/functions/sqs-handler"),
 * });
 *
 * @example
 * // Example 2: Import an SQS queue using ARN
 * createSqsLambda({
 *   scope: this,
 *   queueArn: "arn:aws:sqs:us-east-1:123456789012:MyQueue",
 *   codeFolder: path.join(__dirname, "../src/functions/sqs-handler"),
 * });
 */
export function createSqsLambda(params: SQSLambdaParams) {
    const { scope, queue, queueArn, lambdaId, codeFolder, runtime, memorySize, batchSize } = params;

    if (!queue && !queueArn) {
        throw new Error("Either 'queue' or 'queueArn' must be provided.");
    }

    // If only queueArn is provided, import the queue
    const sqsQueue = queue || sqs.Queue.fromQueueArn(scope, `ImportedQueue`, queueArn!);

    // Create the Lambda function
    const lambdaFn = new lambda.Function(scope, lambdaId || lodashCamelCase(sqsQueue.queueName), {
        runtime: runtime || lambda.Runtime.NODEJS_LATEST,
        handler: "index.main",
        memorySize: memorySize || 128,
        code: lambda.Code.fromAsset(codeFolder || __dirname),
    });

    // Grant Lambda permissions to consume messages from the queue
    sqsQueue.grantConsumeMessages(lambdaFn);

    // Configure the Lambda to be triggered by the SQS queue
    lambdaFn.addEventSource(new lambdaEventSources.SqsEventSource(sqsQueue, {
        batchSize: batchSize || 10,
    }));

    return { lambdaFn };
}
