#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { WorkshipPipelineStack } from '../lib/pipeline-stack';

const app = new App();
new WorkshipPipelineStack(app, 'CdkWorkshopPipelineStack');
