import { Construct } from "constructs";
import { App, TerraformStack, AssetType, TerraformAsset } from "cdktf";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import * as path from "path";

class LambdaStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, "AWS", {
      region: "us-west-1", // Change to your desired region
    });

    // Create Lambda asset from bundled output
    const lambdaAsset = new TerraformAsset(this, "lambda-asset", {
      path: path.resolve(__dirname, "../dist"),
      type: AssetType.ARCHIVE,
    });

    const lambdaRole = new IamRole(this, "lambda-role", {
      name: "basic-lambda-role",
      assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Action: "sts:AssumeRole",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
            Effect: "Allow",
            Sid: "",
          },
        ],
      }),
    });

    new IamRolePolicyAttachment(this, "lambda-managed-policy", {
      policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
      role: lambdaRole.name,
    });

    new LambdaFunction(this, "basic-lambda", {
      filename: lambdaAsset.path,
      functionName: "basic",
      handler: "index.handler",
      role: lambdaRole.arn,
      runtime: "nodejs20.x",
      timeout: 30,
      memorySize: 128,
      environment: {
        variables: {
          NODE_OPTIONS: "--enable-source-maps",
        },
      },
    });
  }
}

const app = new App();
new LambdaStack(app, "basic-lambda-stack");
app.synth();