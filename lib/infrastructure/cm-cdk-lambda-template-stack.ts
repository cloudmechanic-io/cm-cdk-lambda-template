import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as apigw from "aws-cdk-lib/aws-apigateway";
import {helloWorld} from "../src/functions/hello-world";

export class CmCdkLambdaTemplateStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new apigw.RestApi(this, "HelloApi", {
            restApiName: "HelloApi",
        });

        helloWorld(api)
    }
}
