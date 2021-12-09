import { Template, Capture } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { HitCounter }  from '../lib/hitcounter';

const mockHitCounter = (stack: cdk.Stack, readCapacity?: number) => {
  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    }),
    ...(readCapacity && { readCapacity })
  });
}

test('DynamoDB Table Created', () => {
  const stack = new cdk.Stack();
  mockHitCounter(stack);
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
});

test('DynamoDB Table Created With Encryption', () => {
  const stack = new cdk.Stack();
  mockHitCounter(stack);
  const template = Template.fromStack(stack);
  template.hasResourceProperties("AWS::DynamoDB::Table", {
    SSESpecification: {
      SSEEnabled: true,
    },
  });
});

test('read capacity can be configured', () => {
  const stack = new cdk.Stack();
  expect(() => { mockHitCounter(stack, 3) }).toThrowError("readCapacity must be greater than 5 and less than 20");
});

test('Lambda Has Env Variables', () => {
  const stack = new cdk.Stack();
  mockHitCounter(stack);
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });
  expect(envCapture.asObject()).toEqual(
    {
      Variables: {
        DOWNSTREAM_FUNCTION_NAME: {
          Ref: "TestFunction22AD90FC"
        },
        HITS_TABLE_NAME: {
          Ref: "MyTestConstructHits24A357F0",
        },
      },
    },
  );
});