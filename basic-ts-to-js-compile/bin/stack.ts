import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicLambda = new lambda.Function(this, 'BasicLambdaFunction', {
      functionName: 'basic',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../dist')),
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    new cdk.CfnOutput(this, 'LambdaARN', {
      value: basicLambda.functionArn,
      description: 'ARN of the basic Lambda function',
    });
  }
}