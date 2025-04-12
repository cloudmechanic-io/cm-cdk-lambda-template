import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";

import {helloWorld} from "../src/functions/hello-world";
import {LambdaParams} from "./lambda/types";
import {dbMigrations} from "../src/functions/db-migrations";

export class ZeitOpsBeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        const lambdaParams = this.configureLambdaParams("ZeitOpsBe");

        helloWorld(lambdaParams);
        dbMigrations(lambdaParams);
    }

    private configureLambdaParams(serviceName: string): LambdaParams {
        const stage = this.node.tryGetContext('stage');
        const environment = this.node.tryGetContext(stage)?.lambdaEnvironmentVariables || {};

        const api = new apigw.RestApi(this, serviceName, {
            restApiName: `${stage}-${serviceName}`,
        });

        const role = new iam.Role(this, "AdminLambdaRole", {
            assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
            ],
        });

        const vpcId = this.node.tryGetContext(stage).vpcId
        const privateSubnet1 = this.node.tryGetContext(stage).privateSubnet1;
        const privateSubnet2 = this.node.tryGetContext(stage).privateSubnet2

        const vpc = ec2.Vpc.fromVpcAttributes(this, 'VPC', {
            vpcId: vpcId!!,
            privateSubnetIds: [privateSubnet1, privateSubnet2],
            availabilityZones: [`${cdk.Aws.REGION}a`, `${cdk.Aws.REGION}b`]
        });

        const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'LambdaSecurityGroup', {
            vpc,
            securityGroupName: `${stage}-${serviceName}-security-group`,
            description: `Security group for Lambdas in ${serviceName} API`,
            allowAllOutbound: true,
        });

        return {
            api,
            environment,
            role,
            vpc,
            securityGroup: lambdaSecurityGroup,
            subnetSelection: {subnets: vpc.privateSubnets},
        };
    }
}
