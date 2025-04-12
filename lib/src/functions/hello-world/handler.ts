import "reflect-metadata"

import {middyfy, ParsedApiGatewayEvent} from "../../client/middleware";
import {ok} from "../../client/response-utils";
import {getEnvVariable} from "../../client/env";

async function handler(event: ParsedApiGatewayEvent) {
    const response = {
        test: getEnvVariable("TESTERICA"),
        env: process.env
    };

    return ok(response)
}

export const main = middyfy(handler);