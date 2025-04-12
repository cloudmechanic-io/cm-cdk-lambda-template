#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {ZeitOpsBeStack} from "../lib/infrastructure/zeitops-be-stack";

const app = new cdk.App();

const stage = app.node.tryGetContext('stage');
const region = app.node.tryGetContext(stage).region;


new ZeitOpsBeStack(app, `ZeitOpsBe-${stage}`, {
    env: {
        region
    }
});