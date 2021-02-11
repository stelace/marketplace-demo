# Global CDN

Stelace Instant offers built-in media CDN to build your platform in no time and focus on growth.

## Building your own with AWS

No need to reinvent the wheel…
But you may want to have full control over your media or store _much_ more user files.

And we can help!

Here’s how you can use Amazon Web Services to securely upload files to your own global CDN.

Create a free AWS account if needed and follow this guide to enjoy fast and secure serverless uploads.

## S3 Bucket

Create an S3 bucket in your favorite AWS region with public read-access and CORS policy below.

We advise you to set your website URL for POST requests as following:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>https://your.website</AllowedOrigin>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["POST"],
    "AllowedHeaders": ["*"]
  },
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET"],
    "MaxAgeSeconds": 3600,
    "AllowedHeaders": ["*"]
  }
]
```

## Getting signed URLs with AWS Lambda

We need to secure uploads to this bucket by explicitly allowing them for every single file, rather than carelessly granting public write-access.

We could set up an Express server to handle this but serverless route spares most maintenance costs. Why bother?

### Upload IAM policy and user

#### Policy

We first have to create a policy in AWS using IAM.

You should create a first IAM user with admin rights if needed, rather than using your AWS root account.

Here is the policy you can create as admin afterwards:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3InstantTest",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

#### User

We now have to create a user that won’t connect to console and only get programmatic access with secret and access keys to integrate in Lambda.
Attach only the single policy created above to this user.

Save both user access and secret keys now, since the secret key is only shown once in AWS console.

_Note_: Should someone leak these credentials, this restricted user would only be able to upload to this single S3 bucket, minimizing risks for all other AWS account resources. You’d just have to revoke these keys and create new ones as soon as you’re aware of the leak to protect your S3 bucket.

### AWS Lambda

We can now proceed and create a Cloud9 environment to deploy a Lambda function behind API Gateway.

Note that Cloud9 is only available in some AWS regions.

You can also rely on AWS CLI `aws cloudformation` to deploy easily to any region.

Here is the AWS SAM template you can use, feel free to adapt this to your needs, save it to a new file named `template.yaml`

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: "AWS::Serverless-2016-10-31"
Description: Managing upload to app's S3 bucket
Globals:
  Api:
    # Enable CORS: change the origin wildcard
    # to a particular domain name, e.g. "'www.example.com'"
    #
    # Note that we can be more strict in S3 CORS policy rather than here
    # In this case a policy will still be returned to any domain and upload will be rejected by S3
    # S3 CORS xml is more flexible for it allows several origins
    Cors:
      AllowMethods: "'GET,OPTIONS'"
      AllowHeaders: "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
      AllowOrigin: "'*'"
Resources:
  getSignedUrlPolicy:
    Type: "AWS::Serverless::Function"
    Properties:
      Handler: getSignedUrlPolicy/index.handler
      Runtime: nodejs12.x
      Description: "Get short-lived signed URL with appropriate policy from S3-only user"
      MemorySize: 128
      Timeout: 15
      Environment:
        Variables:
          # The user specifically created with minimal rights
          # Note that you can remove these variables and set them in AWS Lambda console after deployment,
          # potentially enabling AWS KMS to encrypt keys on transit.
          S3_ACCESS_KEY: S3_USER_ACCESS_KEY
          S3_SECRET_KEY: S3_USER_SECRET_KEY
          # Bucket created previously
          S3_BUCKET: BUCKET_NAME
          S3_REGION: BUCKET_REGION
      Events:
        LambdaMicroservice:
          Type: Api
          Properties:
            Path: /upload/policy
            Method: GET
  getSignedUrlPolicyPermission:
    Type: "AWS::Lambda::Permission"
    Properties:
      Action: "lambda:InvokeFunction"
      FunctionName:
        "Fn::GetAtt":
          - getSignedUrlPolicy
          - Arn
      Principal: apigateway.amazonaws.com
      SourceArn:
        "Fn::Sub": "arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:*/*/*/*"
```

In the cloud9 console, run `sam validate` to check your template.

### Show me the real code

Here is an example of signing code you can use in your Lambda function, save it at the location `getSignedUrlPolicy/index.js`

```js
"use strict";

const crypto = require("crypto");

// This is the entry function that produces data for the frontend
// config is hash of S3 configuration:
// * bucket
// * region
// * accessKey
// * secretKey
function s3Credentials(config, filename) {
  return {
    endpoint_url: "https://" + config.bucket + ".s3.amazonaws.com",
    params: s3Params(config, filename)
  };
}

// Returns the parameters that must be passed to the API call
function s3Params(config, filename) {
  var credential = amzCredential(config);
  var policy = s3UploadPolicy(config, filename, credential);
  var policyBase64 = new Buffer(JSON.stringify(policy)).toString("base64");
  return {
    key: filename,
    acl: "public-read",
    success_action_status: "201",
    policy: policyBase64,
    "x-amz-algorithm": "AWS4-HMAC-SHA256",
    "x-amz-credential": credential,
    "x-amz-date": dateString() + "T000000Z",
    "x-amz-signature": s3UploadSignature(config, policyBase64, credential)
  };
}

function dateString() {
  var date = new Date().toISOString();
  return date.substr(0, 4) + date.substr(5, 2) + date.substr(8, 2);
}

function amzCredential(config) {
  return [
    config.accessKey,
    dateString(),
    config.region,
    "s3/aws4_request"
  ].join("/");
}

// Constructs the policy
function s3UploadPolicy(config, filename, credential) {
  return {
    // 5 minutes into the future
    expiration: new Date(new Date().getTime() + 5 * 60 * 1000).toISOString(),
    conditions: [
      { bucket: config.bucket },
      { key: filename },
      { acl: "public-read" },
      { success_action_status: "201" },
      // Optionally control content type and file size
      // {'Content-Type': 'application/pdf'},
      ["content-length-range", 0, 1000000],
      { "x-amz-algorithm": "AWS4-HMAC-SHA256" },
      { "x-amz-credential": credential },
      { "x-amz-date": dateString() + "T000000Z" }
    ]
  };
}

function hmac(key, string) {
  var hmac = require("crypto").createHmac("sha256", key);
  hmac.end(string);
  return hmac.read();
}

// Signs the policy with the credential
function s3UploadSignature(config, policyBase64, credential) {
  var dateKey = hmac("AWS4" + config.secretKey, dateString());
  var dateRegionKey = hmac(dateKey, config.region);
  var dateRegionServiceKey = hmac(dateRegionKey, "s3");
  var signingKey = hmac(dateRegionServiceKey, "aws4_request");
  return hmac(signingKey, policyBase64).toString("hex");
}

exports.handler = async function(event, context) {
  let result;
  let statusCode;
  let errorMessage;

  let params = event;
  // Handle both AWS Lambda and API Gateway (body nested) formats
  if (event.body) {
    params = JSON.parse(event.body);
  }
  if (event.queryStringParameters) {
    Object.assign(params, params.queryStringParameters);
  }

  const s3Config = {
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    maxSize: process.env.MAX_SIZE || 10485760 // 10 MB
  };

  if (params.filename) {
    const filename = `${crypto.randomBytes(16).toString("hex")}-${
      params.filename
    }`;

    result = s3Credentials(s3Config, {
      filename,
      contentType: params.content_type
    });
  } else {
    statusCode = 400;
    result = { message: "Bad Request: filename is required" };
  }

  const response = {
    statusCode, // 200 by default
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(result)
  };

  return response;
};
```

## deploy your template and lambda function

in the cloud9 console, `npm init` then, build `sam build`, then deploy `sam deploy --stack-name image-processing -g`

## deploy the serverless-image-handler for image modification

instructions here: https://docs.aws.amazon.com/solutions/latest/serverless-image-handler/deployment.html
Make sure to choose the same region as your other services.

## Stelace Environment Variables

Go to API Gateway in AWS Console and copy the `Prod` stage endpoint URL.

You can also get this in Lambda console by clicking on API gateway in function designer.
It probably looks like `https://******.execute-api.eu-central-1.amazonaws.com/Prod/upload/policy`
Paste this into Stelace Instant `VUE_APP_CDN_POLICY_ENDPOINT` .env variable.

You’ll also need to set `VUE_APP_CDN_S3_BUCKET` and `VUE_APP_CDN_WITH_IMAGE_HANDLER_URL` CloudFront URL, like `https://******.cloudfront.net/`. Values from the serverless-image-handler stack.

You can get this last one in CloudFormation Stack page in Outputs tab, from "Sample Request".

## Conclusion

Restart your dev server to test upload is working.

Build and deploy to production once ready… Good job, enjoy serverless upload!
