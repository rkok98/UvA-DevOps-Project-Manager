# SprintVision

An application used to create scrum boards for development teams to integrate into their agile workflow. 
Built with AWS.

## Installation
1. Install the required dependencies with `npm install`.
2. Copy the contents of `cdk.context.json.dist` to `cdk.context.json` and change `<YOUR_NAME>` to your first name in lowercase.
   For example: rene-dev or tessa-dev.

## Usage
- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Useful urls
Some useful URLs for this project:
- AWS SDK: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/
- AWS CDK: https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html

- Cognito & Postman: https://www.cognitobuilders.training/20-lab1/50-postman-api/
