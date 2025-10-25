import {
  CloudFrontClient,
  GetDistributionCommand,
  UpdateDistributionCommand
} from '@aws-sdk/client-cloudfront'
import {
  S3Client,
  CreateBucketCommand,
  PutBucketOwnershipControlsCommand,
  PutBucketAclCommand,
  PutBucketPolicyCommand
} from '@aws-sdk/client-s3'

const region = process.env.AWS_REGION || 'us-west-2'
const accountId = '533267091967'
const distributionId = process.env.CF_DISTRIBUTION_ID || 'E1DLLQU8OGUHTK'
const logsBucket = process.env.CF_LOG_BUCKET || 'projectm-visualizer-cloudfront-logs'
const logsPrefix = process.env.CF_LOG_PREFIX || 'cloudfront/'

const s3 = new S3Client({ region })
const cf = new CloudFrontClient({ region })

async function ensureBucket() {
  try {
    await s3.send(new CreateBucketCommand({
      Bucket: logsBucket,
      CreateBucketConfiguration: { LocationConstraint: region }
    }))
    console.log(`Created S3 bucket ${logsBucket}`)
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou' || error.$metadata?.httpStatusCode === 409) {
      console.log(`Bucket ${logsBucket} already exists`)
    } else {
      throw error
    }
  }

  try {
    await s3.send(new PutBucketOwnershipControlsCommand({
      Bucket: logsBucket,
      OwnershipControls: {
        Rules: [{ ObjectOwnership: 'ObjectWriter' }]
      }
    }))
    console.log('Set bucket ownership to ObjectWriter (enables ACLs)')
  } catch (error) {
    if (error.name !== 'OwnershipControlsNotFoundError') {
      console.warn('Unable to set ownership controls:', error.message)
    }
  }

  try {
    await s3.send(new PutBucketAclCommand({
      Bucket: logsBucket,
      ACL: 'log-delivery-write'
    }))
    console.log('Applied log-delivery-write ACL')
  } catch (error) {
    console.warn('Skipping ACL update:', error.message)
  }

  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Service: 'cloudfront.amazonaws.com' },
        Action: 's3:PutObject',
        Resource: `arn:aws:s3:::${logsBucket}/${logsPrefix}*`,
        Condition: {
          StringEquals: {
            'AWS:SourceArn': `arn:aws:cloudfront::${accountId}:distribution/${distributionId}`
          }
        }
      }
    ]
  }

  await s3.send(new PutBucketPolicyCommand({
    Bucket: logsBucket,
    Policy: JSON.stringify(policy)
  }))
  console.log(`Bucket policy set on ${logsBucket}`)
}

async function enableLogging() {
  await ensureBucket()

  const { Distribution, ETag } = await cf.send(new GetDistributionCommand({ Id: distributionId }))
  if (!Distribution?.DistributionConfig) {
    throw new Error('Distribution configuration not found')
  }

  const config = Distribution.DistributionConfig
  config.Logging = {
    Enabled: true,
    IncludeCookies: true,
    Bucket: `${logsBucket}.s3.amazonaws.com`,
    Prefix: logsPrefix
  }

  await cf.send(new UpdateDistributionCommand({
    Id: distributionId,
    IfMatch: ETag,
    DistributionConfig: config
  }))

  console.log('CloudFront logging enabled for distribution', distributionId)
}

enableLogging().catch((err) => {
  console.error('Failed to enable CloudFront logging:', err)
  process.exit(1)
})
