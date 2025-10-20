# Infrastructure

Manage the static site infrastructure with Pulumi.

## Prerequisites

- Pulumi CLI
- AWS credentials with permissions to manage S3, CloudFront, ACM, Route53, and IAM

## Setup

1. Install dependencies:
   ```bash
   cd infra
   npm install
   ```
2. Log into the shared S3 backend (only needs to be done once per environment):
   ```bash
   AWS_PROFILE=projectm pulumi login s3://pulumi-state-projectm
   ```
3. Create a stack (example `dev`) if it does not exist:
   ```bash
   pulumi stack init dev
   ```
4. Configure required values:
   ```bash
   pulumi config set bucketName prjm
  pulumi config set githubOwner projectM-visualizer
  pulumi config set githubRepo projectm-visualizer.org
  pulumi config set githubRefs '["ref:refs/heads/master"]'
  # Allow additional refs as needed, for example:
  pulumi config set githubRefs '["ref:refs/heads/master","ref:refs/heads/*","ref:refs/tags/*","ref:refs/pull/*"]'
  pulumi config set aws:region your-app-region
   ```
5. Optional configuration:
   - `cloudfrontPriceClass` (`PriceClass_100`, `PriceClass_200`, `PriceClass_All`)
   - `primaryDomain` and `alternateDomains` to enable custom domains
   - `hostedZoneId` to request an ACM certificate via DNS validation
   - `certificateArn` to reuse an existing certificate instead of provisioning one
   - `oidcProviderArn` to reference an existing GitHub OIDC provider
   - `githubRoleName` to override the IAM role name

6. Deploy:
   ```bash
   AWS_PROFILE=projectm PULUMI_CONFIG_PASSPHRASE=projectm pulumi up
   ```

Outputs include the CloudFront distribution details and the IAM role ARN.

### State

State lives in `s3://pulumi-state-projectm` (versioned). Set `AWS_PROFILE=projectm` and `PULUMI_CONFIG_PASSPHRASE=projectm` when running Pulumi commands so AWS calls and encrypted config values work consistently.

## GitHub Actions

Set these repository secrets and variables before running the deployment workflow:

- `AWS_ROLE_ARN` (secret): ARN of the IAM role exported by Pulumi.
- `GH_TOKEN` (secret): GitHub token with `repo` scope for `generate-reports`.
- `NUXT_PUBLIC_ASSET_KEY` (secret): Encryption key used by `generate-reports`.
- `vars.PREVIEW_SITE_URL`: CloudFront preview URL (for example, `https://d15wenzbsa5dzp.cloudfront.net`).
- `secrets.NUXT_PUBLIC_SITE_URL`: Production URL used on the `master` branch (for example, `https://projectm-visualizer.org`).
- `vars.AWS_REGION`: AWS region for S3 operations (for example, `us-west-2`).
- `vars.S3_BUCKET`: Target S3 bucket name (`prjm`).
- `vars.CLOUDFRONT_DISTRIBUTION_ID`: Distribution ID exported by Pulumi.

The workflow runs on pushes to `master` and can also be triggered manually.
