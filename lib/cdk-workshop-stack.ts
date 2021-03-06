import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { Code, Runtime, Function as lambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';
import { Construct } from 'constructs';


export class CdkWorkshopStack extends Stack {
  public readonly hcViewerUrl: CfnOutput;
  public readonly hcEndpoint: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const hello = new lambdaFunction(this, 'HelloHandler', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('lambda'),
      handler: 'hello.handler'
    });

    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello
    });
    
    const gateway = new LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler
    });

    const tableViewer = new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits',
    });

    this.hcEndpoint = new CfnOutput(this, 'GatewayUrl', {
      value: gateway.url,
    });

    this.hcViewerUrl = new CfnOutput(this, 'TableViewerUrl', {
      value: tableViewer.endpoint,
    });
  }
}
