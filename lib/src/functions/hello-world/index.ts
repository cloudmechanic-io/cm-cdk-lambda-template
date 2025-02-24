import {RestApi} from "aws-cdk-lib/aws-apigateway";
import {createHTTPLambda} from "../../../infrastructure/lambda/http-lambda";

export function helloWorld(apiGateway: RestApi) {
    return createHTTPLambda({
        api: apiGateway,
        endpointPath: "hello-world/{name}",
        method: "GET",
    })
}
