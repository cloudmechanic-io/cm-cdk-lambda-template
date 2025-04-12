import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as apigw from "aws-cdk-lib/aws-apigateway";

export interface LambdaParams {
    /**
     * The API Gateway instance to attach the Lambda function to.
     */
    api: apigw.RestApi;

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