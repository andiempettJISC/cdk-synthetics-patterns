import * as cdk from '@aws-cdk/core';
import * as synthetics from '@aws-cdk/aws-synthetics';
import {Alarm, ComparisonOperator} from '@aws-cdk/aws-cloudwatch';
import { SnsAction } from '@aws-cdk/aws-cloudwatch-actions';
import { Topic } from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import path = require('path');

export interface SyntheticsPatternsProps {
  /**
   * The amount of time in minutes the synthetic should check
   */
  checkInterval?: number,

  /**
   * The email address to send Fail notifications to
   */
  email: string
}

export class SyntheticsPatterns extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: SyntheticsPatternsProps) {
    super(scope, id);

    let checkInterval: number
    if (props.checkInterval === undefined) {
      checkInterval = 5
    } else {
      checkInterval = props.checkInterval
    }

    const canary = new synthetics.Canary(this, 'SimpleCanary', {
      schedule: synthetics.Schedule.rate(cdk.Duration.minutes(checkInterval)),
      test: synthetics.Test.custom({
        code: synthetics.Code.fromAsset(path.join(__dirname, '../../../', 'canary')),
        handler: 'index.handler',
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_2_0,
    });

    const CanaryTopic = new Topic(this, 'CanaryTopic')

    CanaryTopic.addSubscription(new EmailSubscription(props.email))

    new Alarm(this, 'CanaryAlarm', {
      metric: canary.metricSuccessPercent(),
      evaluationPeriods: 2,
      threshold: 90,
      comparisonOperator: ComparisonOperator.LESS_THAN_THRESHOLD,
    }).addAlarmAction(new SnsAction(CanaryTopic));

  }
}
