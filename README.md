# CDK sythetics patterns

This is a CDK construct that simplifies the creation of aws Cloudwatch Synthetics tests.

# Usage

make sure cdk is installed `npm install -g aws-cdk`

```
mkdir my-cool-app && cd my-cool-app
cdk init --language typescript
npm install synthetics-patterns
```

Navigate to `lib/index.ts` and add this:

```
new SyntheticsPatterns(this, 'simpleSynthetic', {
      email: 'my-email@example.com'
    })
```

This construct depends on a lambda function you need to create. first create the below directories and an index.js file where your lambda handler and code will live.

```
canary
└── nodejs
    └── node_modules
        └── index.js
```

This lambda needs to be a special synthetics lambda. You may use and adapt one of the blueprints that AWS provides in the console or use the [Cloudwatch Synthetics recorder chrome extension](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries_Recorder.html).
More information on Cloudwatch Synthetics can be found [here](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries_Create.html).

# An example of a simple lambda function:

```
var synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

const recordedScript = async function () {
  let page = await synthetics.getPage();
  
  const navigationPromise = page.waitForNavigation()
  
  await synthetics.executeStep('Goto_0', async function() {
    await page.goto("http://example.com/", {waitUntil: 'domcontentloaded', timeout: 60000})
  })
  
  await page.setViewport({ width: 1533, height: 801 })
  
  await navigationPromise
  
  await synthetics.executeStep('Click_1', async function() {
    await page.waitForSelector('body > div > p > a')
    await page.click('body > div > p > a')
  })
  
  await navigationPromise
  
};
exports.handler = async () => {
    return await recordedScript();
};
```


