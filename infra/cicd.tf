# -----------------------------------------------------------------------------
# 1. GitHub Actions OIDC Identity Provider (Zero static AWS keys in GitHub!)
#    Allows GitHub Actions to exchange a short-lived signed JWT for temporary
#    AWS STS credentials.
# -----------------------------------------------------------------------------
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

# Reusable trust policy: ONLY workflows running on `main` in `ibbya04/portfolio`
data "aws_iam_policy_document" "github_oidc_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_repository}:ref:refs/heads/main",
        "repo:ibbya04@102319353/portfolio@1468868399:ref:refs/heads/main",
      ]
    }
  }
}

# -----------------------------------------------------------------------------
# 2. Frontend Deploy Role (Strict Least Privilege)
#    Can ONLY upload/sync to our one S3 website bucket and invalidate CloudFront
# -----------------------------------------------------------------------------
resource "aws_iam_role" "github_frontend_deploy" {
  name               = "${var.project_name}-github-frontend-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_oidc_assume_role.json
}

data "aws_iam_policy_document" "github_frontend_deploy" {
  statement {
    sid       = "ListFrontendBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.frontend.arn]
  }

  statement {
    sid    = "SyncFrontendObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
  }

  statement {
    sid       = "InvalidateCloudFrontCache"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.frontend.arn]
  }
}

resource "aws_iam_role_policy" "github_frontend_deploy" {
  name   = "${var.project_name}-github-frontend-policy"
  role   = aws_iam_role.github_frontend_deploy.id
  policy = data.aws_iam_policy_document.github_frontend_deploy.json
}

# -----------------------------------------------------------------------------
# 3. Backend / Terraform Deploy Role (Scoped to this project's resources)
#    Allows GitHub Actions to run `terraform apply` for backend & infra updates
# -----------------------------------------------------------------------------
resource "aws_iam_role" "github_backend_deploy" {
  name               = "${var.project_name}-github-backend-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_oidc_assume_role.json
}

data "aws_iam_policy_document" "github_backend_deploy" {
  statement {
    sid    = "ManageTerraformStateAndFrontendBucket"
    effect = "Allow"
    actions = [
      "s3:*",
    ]
    resources = [
      "arn:aws:s3:::${var.project_name}-tfstate-${data.aws_caller_identity.current.account_id}",
      "arn:aws:s3:::${var.project_name}-tfstate-${data.aws_caller_identity.current.account_id}/*",
      aws_s3_bucket.frontend.arn,
      "${aws_s3_bucket.frontend.arn}/*",
    ]
  }

  statement {
    sid    = "ManagePortfolioCloudFront"
    effect = "Allow"
    actions = [
      "cloudfront:Get*",
      "cloudfront:List*",
      "cloudfront:UpdateDistribution",
      "cloudfront:UpdateOriginAccessControl",
      "cloudfront:TagResource",
      "cloudfront:UntagResource",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ManagePortfolioDynamoDB"
    effect = "Allow"
    actions = [
      "dynamodb:*",
    ]
    resources = [
      "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${var.project_name}-*",
    ]
  }

  statement {
    sid    = "ManagePortfolioLambda"
    effect = "Allow"
    actions = [
      "lambda:*",
    ]
    resources = [
      "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:${var.project_name}-*",
    ]
  }

  statement {
    sid    = "ManagePortfolioApiGateway"
    effect = "Allow"
    actions = [
      "apigateway:*",
    ]
    resources = [
      "arn:aws:apigateway:${var.aws_region}::/apis",
      "arn:aws:apigateway:${var.aws_region}::/apis/*",
      "arn:aws:apigateway:${var.aws_region}::/tags/*",
    ]
  }

  statement {
    sid    = "ManagePortfolioLogs"
    effect = "Allow"
    actions = [
      "logs:DescribeLogGroups",
      "logs:ListTagsForResource",
      "logs:ListTagsLogGroup",
    ]
    resources = ["*"]
  }

  statement {
    sid    = "ManagePortfolioLogGroups"
    effect = "Allow"
    actions = [
      "logs:*",
    ]
    resources = [
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project_name}-*",
    ]
  }

  statement {
    sid    = "ManagePortfolioIAM"
    effect = "Allow"
    actions = [
      "iam:Get*",
      "iam:List*",
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:UpdateAssumeRolePolicy",
      "iam:Tag*",
      "iam:Untag*",
      "iam:PassRole",
      "iam:UpdateOpenIDConnectProviderThumbprint",
    ]
    resources = [
      "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-*",
      aws_iam_openid_connect_provider.github.arn,
    ]
  }
}

resource "aws_iam_role_policy" "github_backend_deploy" {
  name   = "${var.project_name}-github-backend-policy"
  role   = aws_iam_role.github_backend_deploy.id
  policy = data.aws_iam_policy_document.github_backend_deploy.json
}
