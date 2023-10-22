import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codeBuild from 'aws-cdk-lib/aws-codebuild';
import * as codePipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codePipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class AttackerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceBucket = new s3.Bucket(this, 'AttackerSourceBucket', {
      bucketName: 'k6-attacker-source-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: true,
    });

    const resultBucket = new s3.Bucket(this, 'AttackerResultBucket', {
      bucketName: 'k6-attacker-result-bucket',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const sourceOutput = new codePipeline.Artifact();
    const attackOutput = new codePipeline.Artifact();

    const sourceAction = new codePipelineActions.S3SourceAction({
      actionName: 'Source',
      bucket: sourceBucket,
      bucketKey: 'scenario.zip',
      output: sourceOutput,
      trigger: codePipelineActions.S3Trigger.POLL,
    });

    const project =new codeBuild.PipelineProject(this, 'AttackerProject', {
      buildSpec: codeBuild.BuildSpec.fromAsset('./buildspecs/buildspec.yml'),
      environment: {
        buildImage: codeBuild.LinuxBuildImage.STANDARD_7_0,
        privileged: true,
        computeType: codeBuild.ComputeType.SMALL,
      },
    });

    const attackAction =new codePipelineActions.CodeBuildAction({
      actionName: 'Attack',
      project: project,
      input: sourceOutput,
      outputs: [attackOutput],
    });

    const deployAction = new codePipelineActions.S3DeployAction({
      actionName: 'Deploy',
      bucket: resultBucket,
      input: attackOutput,
    });

    new codePipeline.Pipeline(this, 'AttackerPipeline', {
      pipelineName: 'k6-attacker-pipeline',
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Attack',
          actions: [attackAction],
        },
        {
          stageName: 'Deploy',
          actions: [deployAction],
        },
      ],
    });
  }
}


