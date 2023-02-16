#!/usr/bin/env node
import 'source-map-support/register';
import { DevopsProjectManagerStack } from '../lib/devops-project-manager-stack';
import { App } from 'aws-cdk-lib';
import { getEnv } from './util/get-env';

const app = new App();
new DevopsProjectManagerStack(app, getEnv('DevopsProjectManagerStack'), {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
