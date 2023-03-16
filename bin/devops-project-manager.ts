#!/usr/bin/env node

// Set up the full CDK (Cloud Development Kit) project environment (e.g., for the APIs, stacks, etc.).
// Used for management of the application according to AWS account and region.
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { getEnv } from './util/get-env';
import { DevopsProjectManagerStack } from '../lib/devops-project-manager-stack';

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION;

// Creation of application: Must include one main stack (here: multiple sub-stacks)
const app = new App();

new DevopsProjectManagerStack(app, getEnv(app, 'DevOpsProjectStack'), {
  env: { account, region },
});
