import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

const cfg = new pulumi.Config()
const bucketName = cfg.require('bucketName')
const githubOwner = cfg.require('githubOwner')
const githubRepo = cfg.require('githubRepo')
const githubRefs = cfg.getObject<string[]>('githubRefs') ?? ['refs/heads/main']
const priceClass = cfg.get('cloudfrontPriceClass') ?? 'PriceClass_100'
const primaryDomain = cfg.get('primaryDomain')
const alternateDomains = cfg.getObject<string[]>('alternateDomains') ?? []
const hostedZoneId = cfg.get('hostedZoneId')
const certificateArnFromConfig = cfg.get('certificateArn')
const existingOidcProviderArn = cfg.get('oidcProviderArn')
const githubRoleName
  = cfg.get('githubRoleName')
    ?? `${pulumi.getProject()}-${pulumi.getStack()}-gha`

const callerIdentity = pulumi.output(aws.getCallerIdentity({}))
const allDomains = primaryDomain
  ? [primaryDomain, ...alternateDomains.filter(d => d !== primaryDomain)]
  : []

const bucket = new aws.s3.BucketV2(
  'siteBucket',
  {
    bucket: bucketName
  },
  { import: bucketName }
)

const originAccessControl = new aws.cloudfront.OriginAccessControl('siteOac', {
  name: `${pulumi.getProject()}-${pulumi.getStack()}-oac`,
  description: 'Origin access control for the static site bucket',
  originAccessControlOriginType: 's3',
  signingBehavior: 'always',
  signingProtocol: 'sigv4'
})

let certificateArn: pulumi.Output<string> | undefined

if (certificateArnFromConfig) {
  certificateArn = pulumi.output(certificateArnFromConfig)
} else if (primaryDomain && hostedZoneId) {
  const eastRegion = new aws.Provider('usEast1', { region: 'us-east-1' })
  const certificate = new aws.acm.Certificate(
    'siteCertificate',
    {
      domainName: primaryDomain,
      validationMethod: 'DNS',
      subjectAlternativeNames: alternateDomains,
      validationOptions: [
        {
          domainName: primaryDomain,
          validationDomain: primaryDomain
        },
        ...alternateDomains.map(domain => ({
          domainName: domain,
          validationDomain: domain
        }))
      ]
    },
    {
      provider: eastRegion,
      customTimeouts: {
        create: '20m',
        delete: '5m'
      }
    }
  )

  const validationRecords = certificate.domainValidationOptions.apply(options =>
    options
      .filter(
        option =>
          option.resourceRecordName
          && option.resourceRecordType
          && option.resourceRecordValue
      )
      .map(
        (option, index) =>
          new aws.route53.Record(
            `siteCertValidation-${index}`,
            {
              zoneId: hostedZoneId,
              name: option.resourceRecordName,
              type: option.resourceRecordType,
              records: [option.resourceRecordValue],
              ttl: 60,
              allowOverwrite: true
            },
            { dependsOn: certificate }
          )
      )
  )

  const certificateValidation = new aws.acm.CertificateValidation(
    'siteCertificateValidation',
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: validationRecords.apply(records =>
        records.map(record => record.fqdn)
      )
    },
    {
      provider: eastRegion,
      customTimeouts: {
        create: '20m',
        update: '20m',
        delete: '5m'
      }
    }
  )

  certificateArn = certificateValidation.certificateArn
} else if (primaryDomain) {
  throw new Error(
    'primaryDomain requires either certificateArn or hostedZoneId to request a certificate.'
  )
}

const distributionAliases = certificateArn ? allDomains : []

const distribution = new aws.cloudfront.Distribution('siteDistribution', {
  enabled: true,
  isIpv6Enabled: true,
  priceClass,
  defaultRootObject: 'index.html',
  origins: [
    {
      originId: 'site-bucket-origin',
      domainName: bucket.bucketRegionalDomainName,
      originAccessControlId: originAccessControl.id
    }
  ],
  defaultCacheBehavior: {
    targetOriginId: 'site-bucket-origin',
    viewerProtocolPolicy: 'redirect-to-https',
    allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
    cachedMethods: ['GET', 'HEAD'],
    compress: true,
    cachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
    originRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac'
  },
  restrictions: {
    geoRestriction: {
      restrictionType: 'none'
    }
  },
  viewerCertificate: certificateArn
    ? {
        acmCertificateArn: certificateArn,
        sslSupportMethod: 'sni-only',
        minimumProtocolVersion: 'TLSv1.2_2021'
      }
    : {
        cloudfrontDefaultCertificate: true
      },
  aliases: distributionAliases,
  httpVersion: 'http2and3',
  customErrorResponses: [
    {
      errorCode: 404,
      responseCode: 200,
      responsePagePath: '/index.html',
      errorCachingMinTtl: 300
    },
    {
      errorCode: 403,
      responseCode: 200,
      responsePagePath: '/index.html',
      errorCachingMinTtl: 300
    }
  ]
})

const bucketPolicy = pulumi
  .all([bucket.arn, distribution.arn])
  .apply(([bucketArn, distributionArn]) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowCloudFrontServiceAccess',
          Effect: 'Allow',
          Principal: {
            Service: 'cloudfront.amazonaws.com'
          },
          Action: ['s3:GetObject'],
          Resource: `${bucketArn}/*`,
          Condition: {
            StringEquals: {
              'AWS:SourceArn': distributionArn
            }
          }
        }
      ]
    })
  )

new aws.s3.BucketPolicy('siteBucketPolicy', {
  bucket: bucket.id,
  policy: bucketPolicy
})

if (primaryDomain && hostedZoneId && certificateArn) {
  const aliases = pulumi
    .all([distribution.domainName, distribution.hostedZoneId])
    .apply(([domainName, zoneId]) => ({
      name: domainName,
      zoneId
    }))

  allDomains.forEach((domain, index) => {
    new aws.route53.Record(`siteAliasA-${index}`, {
      zoneId: hostedZoneId,
      name: domain,
      type: 'A',
      aliases: [
        aliases.apply(alias => ({
          name: alias.name,
          zoneId: alias.zoneId,
          evaluateTargetHealth: false
        }))
      ]
    })

    new aws.route53.Record(`siteAliasAAAA-${index}`, {
      zoneId: hostedZoneId,
      name: domain,
      type: 'AAAA',
      aliases: [
        aliases.apply(alias => ({
          name: alias.name,
          zoneId: alias.zoneId,
          evaluateTargetHealth: false
        }))
      ]
    })
  })
}

const oidcProvider = existingOidcProviderArn
  ? aws.iam.OpenIdConnectProvider.get('githubProvider', existingOidcProviderArn)
  : new aws.iam.OpenIdConnectProvider('githubProvider', {
    url: 'https://token.actions.githubusercontent.com',
    clientIdLists: ['sts.amazonaws.com'],
    thumbprintLists: ['6938fd4d98bab03faadb97b34396831e3780aea1']
  })

const normalizeRef = (ref: string) => {
  if (ref.startsWith('ref:')) return ref
  if (ref.startsWith(':')) return `ref${ref}`
  return `ref:${ref}`
}

const ownerCandidates = Array.from(
  new Set([githubOwner, githubOwner.toLowerCase()])
)
const repoCandidates = Array.from(
  new Set([githubRepo, githubRepo.toLowerCase()])
)

const subjectSet = new Set<string>()
for (const owner of ownerCandidates) {
  for (const repo of repoCandidates) {
    subjectSet.add(`repo:${owner}/${repo}:*`)
    for (const ref of githubRefs) {
      subjectSet.add(`repo:${owner}/${repo}:${normalizeRef(ref)}`)
    }
  }
}

const subjects = Array.from(subjectSet)

const assumeRolePolicy = pulumi.all([oidcProvider.arn]).apply(([providerArn]) =>
  JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: {
          Federated: providerArn
        },
        Action: 'sts:AssumeRoleWithWebIdentity',
        Condition: {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub':
              subjects.length === 1 ? subjects[0] : subjects
          }
        }
      }
    ]
  })
)

const deploymentRole = new aws.iam.Role('githubActionsRole', {
  name: githubRoleName,
  assumeRolePolicy,
  description: 'Role assumed by GitHub Actions for static site deployments.'
})

const bucketArn = pulumi.interpolate`arn:aws:s3:::${bucketName}`
const bucketObjectsArn = pulumi.interpolate`arn:aws:s3:::${bucketName}/*`
const distributionArn = pulumi.interpolate`arn:aws:cloudfront::${callerIdentity.accountId}:distribution/${distribution.id}`

new aws.iam.RolePolicy('githubActionsPolicy', {
  role: deploymentRole.id,
  policy: pulumi
    .all([bucketArn, bucketObjectsArn, distributionArn])
    .apply(([arn, objectsArn, distArn]) =>
      JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: [
              's3:PutObject',
              's3:PutObjectAcl',
              's3:DeleteObject',
              's3:GetObject'
            ],
            Resource: objectsArn
          },
          {
            Effect: 'Allow',
            Action: ['s3:ListBucket', 's3:GetBucketLocation'],
            Resource: arn
          },
          {
            Effect: 'Allow',
            Action: ['cloudfront:CreateInvalidation'],
            Resource: distArn
          }
        ]
      })
    )
})

export const siteBucketName = bucket.bucket
export const cloudfrontDistributionId = distribution.id
export const cloudfrontDistributionDomain = distribution.domainName
export const githubActionsRoleArn = deploymentRole.arn
export const acmCertificateArn = certificateArn ?? null
