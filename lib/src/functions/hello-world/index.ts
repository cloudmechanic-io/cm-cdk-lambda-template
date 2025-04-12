import {createHTTPLambda} from "../../../infrastructure/lambda/http-lambda";
import {LambdaParams} from "../../../infrastructure/lambda/types";

export function helloWorld(lambdaParams: LambdaParams) {
    return createHTTPLambda({
        id: "HelloWorld",
        endpointPath: "hello-world/{name}",
        method: "GET",

        codeFolder: __dirname,
        ...lambdaParams
    })
}
