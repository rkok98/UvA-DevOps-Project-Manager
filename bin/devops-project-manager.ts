#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { getEnv } from './util/get-env';
import { DevopsProjectManagerStack } from '../lib/devops-project-manager-stack';

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

const app = new App();

new DevopsProjectManagerStack(app, getEnv(app, 'DevOpsProjectStack'), {
  env: { account, region },
});
